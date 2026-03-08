import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'
import { generateStorageKey, UploadSessionRequest } from './mediaContracts'

type Bindings = {
  STORAGE: R2Bucket
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_PUBLISHABLE_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  MAILKETING_API_TOKEN: string
  MAILKETING_DEFAULT_LIST_ID?: string
}

type Variables = {
  user: any
  token: string
  supabase: any
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', cors())

// Middleware to verify Supabase JWT
app.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', user);
  c.set('token', token);
  c.set('supabase', supabase);
  await next();
});

// Request an upload session
app.post('/api/media/upload-session', async (c) => {
  const user = c.get('user');
  const token = c.get('token');
  const body = await c.req.json<UploadSessionRequest>();
  
  if (!body.fileName || !body.mimeType || typeof body.sizeBytes !== 'number') {
    return c.json({ error: 'Invalid request body' }, 400);
  }

  // Use the authenticated user's token so RLS applies
  const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  // Extract tenantId from JWT claims (AWCMS specific, or assume the client sends it and RLS validates it)
  // Let's assume the client passes the tenant_id in header `x-tenant-id`
  const tenantId = c.req.header('x-tenant-id');
  if (!tenantId) {
    return c.json({ error: 'Missing tenant id header' }, 400);
  }

  const storageKey = generateStorageKey(tenantId, body.fileName);
  
  // Note: We cannot generate a signed R2 PUT URL with simple R2Bucket binding in Workers natively 
  // without S3 API unless we use the standard Workers `put()` or create a custom pre-signed proxy endpoint.
  // Actually, Cloudflare Workers doesn't natively generate AWS v4 presigned URLs via the R2Bindings. 
  // We usually either handle the upload directly through this worker endpoint by streaming the body, OR we use aws4fetch to sign URLs.
  // Given that this is a worker, streaming the PUT directly through the worker is very efficient! Let's do a direct upload endpoint instead of a presigned URL session for simplicity, or keep the session concept but route uploads via the worker.
  
  // Let's create a session record in Supabase
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
  
  const { data: session, error: dbError } = await supabase
    .from('media_upload_sessions')
    .insert({
      tenant_id: tenantId,
      uploader_id: user.id,
      file_name: body.fileName,
      mime_type: body.mimeType,
      size_bytes: body.sizeBytes,
      storage_key: storageKey,
      upload_url: '/api/media/upload-direct', // Internal route
      expires_at: expiresAt,
      status: 'pending'
    })
    .select()
    .single();

  if (dbError || !session) {
    return c.json({ error: 'Failed to create upload session', details: dbError }, 500);
  }

  return c.json({
    sessionId: session.id,
    uploadUrl: `/api/media/upload/${session.id}`,
    expiresAt: session.expires_at,
    storageKey: session.storage_key
  });
});

// Direct upload endpoint using the session
app.put('/api/media/upload/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const user = c.get('user');
  const token = c.get('token');

  const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: session, error: sessionError } = await supabase
    .from('media_upload_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session || session.status !== 'pending' || session.uploader_id !== user.id) {
    return c.json({ error: 'Invalid or expired upload session' }, 403);
  }

  if (new Date(session.expires_at) < new Date()) {
    return c.json({ error: 'Session expired' }, 403);
  }

  // Upload to R2
  const body = await c.req.arrayBuffer();
  await c.env.STORAGE.put(session.storage_key, body, {
    httpMetadata: { contentType: session.mime_type },
    customMetadata: {
      tenantId: session.tenant_id,
      uploaderId: user.id
    }
  });

  // Mark session completed and create media object
  await supabase.from('media_upload_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', sessionId);
  
  const { data: mediaObject, error: insertError } = await supabase.from('media_objects').insert({
    tenant_id: session.tenant_id,
    file_name: session.file_name,
    original_name: session.file_name,
    mime_type: session.mime_type,
    size_bytes: session.size_bytes,
    storage_key: session.storage_key,
    uploader_id: user.id,
    status: 'uploaded',
    access_control: 'public'
  }).select().single();

  if (insertError) {
    return c.json({ error: 'Failed to create media object', details: insertError }, 500);
  }

  return c.json(mediaObject);
});

// Get presigned URL for GET (Or proxy)
app.get('/api/media/file/:id', async (c) => {
  const mediaId = c.req.param('id');
  const token = c.get('token');

  const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: media, error } = await supabase
    .from('media_objects')
    .select('*')
    .eq('id', mediaId)
    .single();

  if (error || !media) {
    return c.json({ error: 'File not found or access denied' }, 404);
  }

  const object = await c.env.STORAGE.get(media.storage_key);
  if (!object) {
    return c.json({ error: 'File not found in storage' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  
  return new Response(object.body, { headers });
});

// Public proxy for public images
app.get('/public/media/:storageKey{*.*}', async (c) => {
  const storageKey = c.req.param('storageKey');
  // Need to use service role or similar to fetch ignoring RLS if it's purely public, or just query without token
  const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  
  // Public policy allows anyone to read if status=uploaded and access_control=public
  const { data: media, error } = await supabase
    .from('media_objects')
    .select('storage_key')
    .eq('storage_key', storageKey)
    .single();

  if (error || !media) {
    return c.json({ error: 'File not found or not public' }, 404);
  }

  const object = await c.env.STORAGE.get(storageKey);
  if (!object) {
    return c.json({ error: 'File not found in storage' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000');
  
  return new Response(object.body, { headers });
});

// ---- MIGRATED ENDPOINTS ----

// Sitemap generation
app.get('/public/sitemap', async (c) => {
  const domainParam = c.req.query('domain');
  const tenantIdParam = c.req.query('tenant_id');
  
  const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  
  let tenantId: string | null = null;
  let baseUrl = 'https://awcms.ahliweb.com';
  
  if (tenantIdParam) {
    tenantId = tenantIdParam;
    const { data: tenant } = await supabase.from('tenants').select('domain, config').eq('id', tenantId).single();
    if (tenant?.domain) baseUrl = `https://${tenant.domain}`;
  } else if (domainParam) {
    const { data: tenant } = await supabase.rpc('get_tenant_by_domain', { lookup_domain: domainParam });
    if (tenant) {
      tenantId = tenant.id;
      baseUrl = `https://${domainParam}`;
    }
  }

  if (!tenantId) {
    return c.text('<?xml version="1.0" encoding="UTF-8"?><error>Tenant not found</error>', 404, { 'Content-Type': 'application/xml' });
  }

  const { data: articles } = await supabase.from('articles').select('slug, updated_at').eq('tenant_id', tenantId).eq('status', 'published').is('deleted_at', null).order('updated_at', { ascending: false });
  const { data: pages } = await supabase.from('pages').select('slug, updated_at').eq('tenant_id', tenantId).eq('status', 'published').eq('is_public', true).is('deleted_at', null).order('updated_at', { ascending: false });
  const { data: products } = await supabase.from('products').select('slug, updated_at').eq('tenant_id', tenantId).eq('status', 'active').is('deleted_at', null).order('updated_at', { ascending: false });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  xml += `\n  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`;

  if (articles && articles.length > 0) {
    articles.forEach((item: any) => {
      xml += `\n  <url>\n    <loc>${baseUrl}/articles/${item.slug}</loc>\n    <lastmod>${new Date(item.updated_at).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    });
  }

  if (pages && pages.length > 0) {
    pages.forEach((item: any) => {
      if (item.slug === 'home' || item.slug === '/') return;
      xml += `\n  <url>\n    <loc>${baseUrl}/${item.slug}</loc>\n    <lastmod>${new Date(item.updated_at).toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    });
  }

  if (products && products.length > 0) {
    products.forEach((item: any) => {
      xml += `\n  <url>\n    <loc>${baseUrl}/products/${item.slug}</loc>\n    <lastmod>${new Date(item.updated_at).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`;
    });
  }

  xml += `\n</urlset>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400'
  });
});

// Mailketing integration
const MAILKETING_API = 'https://api.mailketing.co.id/api/v1';

app.post('/api/mailketing', async (c) => {
  const apiToken = c.env.MAILKETING_API_TOKEN;
  if (!apiToken) {
    return c.json({ error: 'MAILKETING_API_TOKEN not configured' }, 500);
  }

  const body = await c.req.json();
  const { action } = body;

  let endpoint = '';
  let params: Record<string, string | number> = {};

  switch (action) {
    case 'send':
      endpoint = '/send';
      params = {
        api_token: apiToken,
        from_name: body.from_name || 'AWCMS',
        from_email: body.from_email || 'noreply@awcms.com',
        recipient: body.recipient || '',
        subject: body.subject || '',
        content: body.content || '',
      };
      if (body.attach1) params.attach1 = body.attach1;
      if (body.attach2) params.attach2 = body.attach2;
      if (body.attach3) params.attach3 = body.attach3;
      break;
    case 'subscribe':
      endpoint = '/addsubtolist';
      params = {
        api_token: apiToken,
        list_id: body.list_id || c.env.MAILKETING_DEFAULT_LIST_ID || 1,
        email: body.email || '',
      };
      if (body.first_name) params.first_name = body.first_name;
      if (body.last_name) params.last_name = body.last_name;
      if (body.phone) params.phone = body.phone;
      if (body.mobile) params.mobile = body.mobile;
      if (body.city) params.city = body.city;
      if (body.state) params.state = body.state;
      if (body.country) params.country = body.country;
      if (body.company) params.company = body.company;
      break;
    case 'credits':
      endpoint = '/ceksaldo';
      params = { api_token: apiToken };
      break;
    case 'lists':
      endpoint = '/viewlist';
      params = { api_token: apiToken };
      break;
    default:
      return c.json({ error: 'Invalid action. Use: send, subscribe, credits, lists' }, 400);
  }

  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, String(value));
  }

  try {
    const response = await fetch(`${MAILKETING_API}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const result = await response.json() as Record<string, any>;
    
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown';
    return c.json({ ...result, client_ip: clientIp });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app

