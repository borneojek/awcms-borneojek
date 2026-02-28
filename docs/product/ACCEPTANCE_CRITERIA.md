> **Documentation Authority**: [SYSTEM_MODEL.md](../../SYSTEM_MODEL.md) → [AGENTS.md](../../AGENTS.md) → [PRD.md](PRD.md)

# AWCMS — Acceptance Criteria

## 1. Multi-Tenancy & Isolation

| ID | Criterion | Verification |
|----|-----------|--------------|
| MT-1 | Every tenant-scoped table has a `tenant_id` (UUID) column | `SELECT table_name FROM information_schema.columns WHERE column_name = 'tenant_id'` covers all business tables |
| MT-2 | RLS is enabled on ALL tables | `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity` returns 0 rows |
| MT-3 | No client code bypasses RLS | Code review: no `supabaseAdmin` usage in client-side code |
| MT-4 | Cross-tenant queries return 0 results for non-platform roles | Test: User A (tenant 1) cannot read User B (tenant 2) data |
| MT-5 | Tenant resolution uses `useTenant()` in admin and build-time env in public | Code review of auth context and Astro config |

## 2. ABAC Permissions

| ID | Criterion | Verification |
|----|-----------|--------------|
| AB-1 | All permission keys follow `scope.resource.action` format | `SELECT key FROM permissions WHERE key !~ '^[a-z]+\.[a-z_]+\.[a-z_]+$'` returns 0 |
| AB-2 | UI components check permissions before rendering actions | Code review: all action buttons wrapped in `hasPermission()` checks |
| AB-3 | RLS policies reference `public.has_permission()` for write operations | Policy audit: all INSERT/UPDATE/DELETE policies include permission check |
| AB-4 | Role hierarchy is enforced (higher roles inherit lower role permissions) | Test: Admin can do everything Editor can; Editor cannot do Admin actions |

## 3. Data Integrity

| ID | Criterion | Verification |
|----|-----------|--------------|
| DI-1 | Business data uses soft delete (`deleted_at` column) | No `DELETE FROM` statements in application code for business tables |
| DI-2 | All read queries filter `deleted_at IS NULL` | Code review / grep for `.is('deleted_at', null)` on all queries |
| DI-3 | Foreign keys use `ON DELETE RESTRICT` or `SET NULL` for business entities | Schema review: `ON DELETE CASCADE` only on join/link tables |

## 4. Content Sanitization

| ID | Criterion | Verification |
|----|-----------|--------------|
| CS-1 | Stitch HTML import is sanitized before storage | Unit test: malicious HTML stripped by `sanitizeStitchHtml.js` |
| CS-2 | Fallback rendering uses allowlisted tags only | Code review: `sanitize.js` and `sanitize.ts` use explicit allowlist |
| CS-3 | Stitch import mode respects tenant settings | Test: tenant with `stitch_import.enabled = false` cannot import |

## 5. Security

| ID | Criterion | Verification |
|----|-----------|--------------|
| SE-1 | No secrets in committed code | `grep -r 'SUPABASE_SECRET\|password\|api_key' --include='*.{js,ts,jsx,tsx}'` — false positives only |
| SE-2 | `.env*` files are gitignored | `.gitignore` contains `**/.env*` pattern |
| SE-3 | Audit logs capture all write operations | Test: create/update/delete actions produce `audit_logs` entries |
| SE-4 | Admin-only profile data is encrypted | `user_profile_admin` uses pgcrypto; plaintext not readable via RLS |

## 6. Build & Quality

| ID | Criterion | Verification |
|----|-----------|--------------|
| BQ-1 | `awcms` builds with 0 errors | `cd awcms && npm run build` exits 0 |
| BQ-2 | `awcms-public` builds with 0 errors | `cd awcms-public && npm run build` exits 0 |
| BQ-3 | All tests pass | `cd awcms && npx vitest run` exits 0 |
| BQ-4 | No hardcoded hex colors in components | `grep -r 'bg-\[#\|text-\[#' awcms/src/` returns 0 results |
| BQ-5 | All docs referenced in DOCS_INDEX.md | Manual check: every doc in `docs/` has an entry |

## 7. Compliance

| ID | Criterion | Verification |
|----|-----------|--------------|
| CO-1 | Consent mechanism documented for public portals | `analytics_consent` setting exists in tenant settings |
| CO-2 | Data subject rights workflows documented | PRD and compliance docs reference access/correct/delete flows |
| CO-3 | ISO control mapping covers required standards | `docs/compliance/iso-mapping.md` maps all listed standards |

## References

- [PRD.md](PRD.md) — Product requirements
- [USER_STORY.md](USER_STORY.md) — User flows
- [rls.md](../security/rls.md) — RLS policy details
- [abac.md](../security/abac.md) — ABAC system details
