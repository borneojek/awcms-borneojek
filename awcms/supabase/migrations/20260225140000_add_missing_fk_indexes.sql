-- Add missing indexes on foreign key columns (created_by)
-- Identified by the Supabase Performance Advisor
-- These indexes improve JOIN and DELETE CASCADE performance

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_by
  ON public.user_profiles (created_by);

CREATE INDEX IF NOT EXISTS idx_user_profile_admin_created_by
  ON public.user_profile_admin (created_by);

CREATE INDEX IF NOT EXISTS idx_stitch_import_jobs_created_by
  ON public.stitch_import_jobs (created_by);
