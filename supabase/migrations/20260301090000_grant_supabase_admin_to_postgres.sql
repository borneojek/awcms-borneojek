-- Grant supabase_admin role to database users
-- This is required for SECURITY DEFINER functions to work properly
-- when called via PostgREST (RPC)
GRANT supabase_admin TO postgres;
GRANT supabase_admin TO anon;
GRANT supabase_admin TO authenticated;
GRANT supabase_admin TO service_role;
