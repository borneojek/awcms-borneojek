-- Migration: Add locale to pages and posts
-- Timestamp: 20260217160000

-- Pages Table
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en';

-- Drop existing constraints/indexes if they exist to allow re-creation
DROP INDEX IF EXISTS idx_pages_slug_tenant;
ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_slug_tenant_id_key;

-- Add new unique constraint
ALTER TABLE public.pages
ADD CONSTRAINT pages_slug_tenant_locale_key UNIQUE (slug, tenant_id, locale);

-- Blogs Table
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en';

-- Drop existing constraints/indexes
ALTER TABLE public.blogs DROP CONSTRAINT IF EXISTS blogs_slug_tenant_id_key;

-- Add new unique constraint
ALTER TABLE public.blogs
ADD CONSTRAINT blogs_slug_tenant_locale_key UNIQUE (slug, tenant_id, locale);

-- Update RLS Policies (Optional but good practice to ensure they cover locale if needed)
-- Assuming existing policies filter by tenant_id, they will automatically include all locales.
