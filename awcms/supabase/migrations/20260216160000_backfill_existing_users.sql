-- Migration: Backfill existing users to new standards
-- Purpose: Ensure tenant_id, role_id, approval_status, and profile tables are consistent.

DO $$
DECLARE
  v_primary_tenant uuid;
BEGIN
  SELECT id INTO v_primary_tenant FROM public.tenants WHERE slug = 'primary';

  -- Ensure tenant_id and approval_status are set
  UPDATE public.users
  SET tenant_id = COALESCE(tenant_id, v_primary_tenant),
      approval_status = COALESCE(approval_status, 'approved'),
      updated_at = now()
  WHERE deleted_at IS NULL;

  -- Fill missing role_id with the best available role for the tenant
  UPDATE public.users u
  SET role_id = COALESCE(u.role_id, (
        SELECT id
        FROM public.roles
        WHERE deleted_at IS NULL
          AND (tenant_id = u.tenant_id OR tenant_id IS NULL)
          AND is_guest = false
          AND is_public = false
        ORDER BY is_platform_admin DESC,
                 is_full_access DESC,
                 is_tenant_admin DESC,
                 staff_level DESC NULLS LAST,
                 created_at ASC
        LIMIT 1
      )),
      updated_at = now()
  WHERE u.deleted_at IS NULL
    AND u.role_id IS NULL;

  -- Sync tenant_id on existing profile tables
  UPDATE public.user_profiles p
  SET tenant_id = u.tenant_id,
      updated_at = now()
  FROM public.users u
  WHERE u.id = p.user_id
    AND u.deleted_at IS NULL
    AND p.tenant_id IS DISTINCT FROM u.tenant_id;

  UPDATE public.user_profile_admin a
  SET tenant_id = u.tenant_id,
      updated_at = now()
  FROM public.users u
  WHERE u.id = a.user_id
    AND u.deleted_at IS NULL
    AND a.tenant_id IS DISTINCT FROM u.tenant_id;

  -- Create missing profile rows
  INSERT INTO public.user_profiles (user_id, tenant_id, created_by)
  SELECT u.id, u.tenant_id, u.id
  FROM public.users u
  LEFT JOIN public.user_profiles p ON p.user_id = u.id
  WHERE u.deleted_at IS NULL
    AND p.user_id IS NULL;

  INSERT INTO public.user_profile_admin (user_id, tenant_id, created_by)
  SELECT u.id, u.tenant_id, u.id
  FROM public.users u
  LEFT JOIN public.user_profile_admin a ON a.user_id = u.id
  WHERE u.deleted_at IS NULL
    AND a.user_id IS NULL;
END $$;
