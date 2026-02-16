
import pg from 'pg';

// Default local Supabase connection
const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const { Pool } = pg;
const pool = new Pool({ connectionString });

async function seedPrimaryTenant() {
    console.log('Connecting to DB via Default Local URL...');
    const client = await pool.connect();

    try {
        // 1. Check if primary tenant exists
        const checkRes = await client.query("SELECT * FROM public.tenants WHERE slug = 'primary'");

        if (checkRes.rows.length > 0) {
            console.log('Primary tenant already exists:', checkRes.rows[0].id);
            return;
        }

        // 2. Insert if not exists
        console.log('Inserting primary tenant...');
        const insertRes = await client.query(`
      INSERT INTO public.tenants (name, slug, domain, subscription_tier, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, ['Primary Tenant', 'primary', 'primary', 'enterprise', 'active']);

        console.log('Successfully created primary tenant:', insertRes.rows[0]);

    } catch (err) {
        console.error('Error seeding tenant:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedPrimaryTenant();
