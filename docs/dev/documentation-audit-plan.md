# Repository Documentation Audit and Revision Plan (Context7-First)

> **Owner:** Documentation Steward (AI + Maintainers)
>
> **Audit Cycle:** 2026-Q1 Full Re-Audit
>
> **Last Updated:** 2026-02-27
>
> **Primary Authority Chain:** `SYSTEM_MODEL.md` -> `AGENTS.md` -> `README.md` -> `DOCS_INDEX.md` -> implementation and package docs

## Mission

Run a full-repository documentation audit so every maintained doc is accurate, executable,
and aligned with current implementation details, database behavior, scripts, and CI/CD flows,
using Context7 MCP as the primary external reference for library best practices.

## Execution Status (Current Cycle)

- Phase 0 - Re-Inventory and Drift Refresh: Completed
- Phase 1 - Authority Reconciliation: Completed
- Phase 2 - DB/Security/Tenancy Reconciliation: Completed
- Phase 3 - Scripts/CI/Deploy Reconciliation: Completed
- Phase 4 - Feature + Package Documentation Pass: Completed
- Phase 5 - QA and Publication: Completed

See `docs/dev/documentation-audit-tracker.md` for evidence and drift state.

## Required Outcomes

1. Authority docs (`SYSTEM_MODEL.md`, `AGENTS.md`, `README.md`, `DOCS_INDEX.md`) are synchronized and contradiction-free.
2. Documentation claims about database schema, RLS/ABAC, and migration workflows match active SQL and tooling.
3. All command snippets in maintained docs are valid for current repository layout.
4. Library-specific guidance is verified with Context7 and logged in tracker evidence.
5. Documentation indexing and cross-links are complete and accurate.

## Scope

### In Scope

| Tier | Purpose | Paths |
| --- | --- | --- |
| Tier 0 (Authority) | Governance and canonical references | `SYSTEM_MODEL.md`, `AGENTS.md`, `README.md`, `DOCS_INDEX.md`, `docs/README.md` |
| Tier 1 (Architecture/Security/Tenancy) | Core system behavior and constraints | `docs/architecture/**`, `docs/security/**`, `docs/tenancy/**`, `docs/deploy/**`, `docs/compliance/**` |
| Tier 1 (Dev/Modules/Guides) | Operational runbooks and feature docs | `docs/dev/**`, `docs/modules/**`, `docs/guides/**` |
| Tier 2 (Package READMEs) | Package-level setup and usage docs | `awcms/**/README*.md`, `awcms-public/**/README*.md`, `awcms-mcp/**/README*.md`, `awcms-mobile*/**/README*.md`, `awcms-esp32/**/README*.md`, `awcms-ext/**/README*.md` |
| Tier 2 (Truth sources) | Non-doc implementation evidence | `supabase/**`, `awcms/supabase/**`, `scripts/**`, `.github/workflows/**`, `package.json` files, `mcp.json` |

### Out of Scope

- Third-party/vendor/generated docs that are not project-authoritative.
- Binary assets and non-markdown content.

## Current Baseline (Planning Inputs)

- Node runtime requirement: `>=22.12.0`.
- Admin: React 19.2.4, Vite 7.2.7, Tailwind 4.1.18, Supabase JS 2.93.3.
- Public: Astro 5.17.1 static output, React 19.2.4, Supabase JS 2.93.3.
- Canonical Supabase migration roots:
  - `supabase/migrations/**`
  - `awcms/supabase/migrations/**`
- Existing benchmark and response structure reference:
  - `docs/dev/context7-benchmark-playbook.md`

## Context7 MCP Protocol (Mandatory)

### Library Matrix

| Library | Context7 ID | Verification Surfaces |
| --- | --- | --- |
| Supabase platform | `/supabase/supabase` | tenancy, RLS, onboarding, edge-function docs |
| Supabase JS | `/supabase/supabase-js` | auth/client/query patterns |
| Supabase CLI | `/supabase/cli` | migration, lint, deploy workflows |
| Vite | `/vitejs/vite` | admin tooling and env conventions |
| Astro | `/withastro/docs` | static build, routing, env usage |
| React Router | `/remix-run/react-router` | routing and data-loading guidance |
| React | `/websites/react_dev` | React 19 behavior and anti-patterns |
| Tailwind CSS | `/websites/tailwindcss` | Tailwind v4 guidance |
| Puck | `/puckeditor/puck` | visual editor behavior |
| TipTap | `/ueberdosis/tiptap-docs` | editor extension and content safety |
| Framer Motion | `/grx7/framer-motion` | motion patterns and performance |
| OpenClaw | `/openclaw/openclaw` | AI gateway and multi-tenant routing docs |

### Verification Workflow

For each library-facing doc section:

1. Resolve topic-to-library mapping.
2. Query Context7 for current best practice and version-sensitive guidance.
3. Compare with repository implementation and scripts.
4. Apply revision decision: keep/revise/remove.
5. Record evidence in tracker (`library`, `query focus`, `decision`, `doc paths`).

## Evidence-Driven Audit Method

### Step 1 - Inventory and Classification

- Build inventory of all markdown files.
- Classify each as `Authority`, `Architecture`, `Operational`, `Feature`, `Package`, or `Historical`.
- Record owner/reviewer and last verified date.

### Step 2 - Truth-Source Reconciliation

Validate each doc claim against implementation evidence:

- Database: active migrations, functions, and policy SQL.
- Scripts: package scripts and root scripts.
- CI/CD: workflow triggers, runtime versions, deploy steps.
- App behavior: admin/public/mobile/esp32 code paths.

Any claim without evidence must be corrected, scoped as backlog, or removed.

### Step 3 - Security and Tenancy Integrity Pass

Confirm docs enforce canonical constraints:

- RLS is mandatory for tenant-scoped data.
- Soft delete uses `deleted_at` patterns.
- Permission keys use `scope.resource.action`.
- Secret naming uses `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`.
- Client docs never advise exposing secret keys.

### Step 4 - Consistency and Indexing Pass

- Resolve terminology drift across authority and module docs.
- Ensure `DOCS_INDEX.md` and `docs/README.md` map all maintained docs.
- Repair stale links and route references.

## Workstreams and Deliverables

### Workstream A - Authority Docs (Highest Priority)

Targets:

- `SYSTEM_MODEL.md`
- `AGENTS.md`
- `README.md`
- `DOCS_INDEX.md`
- `docs/README.md`

Deliverables:

- Unified constraints and naming conventions.
- Zero contradictions for stack versions, env keys, or policy statements.

### Workstream B - Database, Security, and Tenancy Docs

Targets:

- `docs/security/**`
- `docs/tenancy/**`
- `docs/architecture/database.md`
- `docs/dev/edge-functions.md`
- `docs/architecture/schema-definition.md`

Deliverables:

- Verified migration and RLS/ABAC guidance.
- Explicit dual-root migration instructions and guardrails.
- Tenant isolation and onboarding flows aligned with current RPC/function behavior.

### Workstream C - Scripts, CI/CD, and Operations

Targets:

- `docs/dev/setup.md`
- `docs/dev/troubleshooting.md`
- `docs/dev/ci-cd.md`
- `docs/deploy/**`

Deliverables:

- Command examples validated against active scripts and workflows.
- Runtime and environment expectations aligned with CI and deployment reality.

### Workstream D - Feature and Client Docs

Targets:

- `docs/dev/admin.md`
- `docs/dev/public.md`
- `docs/dev/mobile.md`
- `docs/dev/esp32.md`
- `docs/modules/**`
- `docs/guides/**`

Deliverables:

- Feature behavior docs reflect current route, permission, and workflow logic.
- Client-specific guides match real runtime and data-access patterns.

### Workstream E - Package README Surfaces

Targets:

- Maintained package `README*.md` across admin/public/mobile/mcp/esp32/ext workspaces.

Deliverables:

- Consistent setup instructions and environment naming.
- Correct links to canonical authority docs.

### Workstream F - Benchmark and Response Quality

Targets:

- `docs/dev/context7-benchmark-playbook.md`
- Benchmark-specific sections in `AGENTS.md` and relevant dev docs.

Deliverables:

- Standard response contract preserved:
  - Objective
  - Required Inputs
  - Workflow
  - Reference Implementation
  - Validation Checklist
  - Failure Modes and Guardrails

## Phase Plan

### Phase 0 - Re-Inventory and Drift Refresh

- Regenerate markdown inventory and ownership map.
- Refresh drift register with current unresolved findings.

### Phase 1 - Authority Reconciliation

- Resolve all Tier 0 inconsistencies first.
- Freeze canonical terminology and env naming.

### Phase 2 - DB/Security/Tenancy Reconciliation

- Validate against SQL migrations and active policy behavior.
- Re-check Supabase patterns via Context7.

### Phase 3 - Scripts/CI/Deploy Reconciliation

- Validate all documented commands in current workspace layout.
- Align docs with workflow files and environment assumptions.

### Phase 4 - Feature + Package Documentation Pass

- Reconcile feature docs and package READMEs.
- Normalize examples and cross-links.

### Phase 5 - QA and Publication

- Run lint/link checks and targeted build/test validations.
- Update tracker and changelog with completed revisions.

## Validation Gates

Run these before closing the cycle:

- Markdown lint:
  - `npx markdownlint-cli --config .markdownlint.json "**/*.md"`
- Link checks:
  - `cd awcms && npm run docs:check`
- Package sanity (for touched areas):
  - `cd awcms && npm run lint && npm run build`
  - `cd awcms-public/primary && npm run check && npm run build`
  - `cd awcms-mcp && npm run lint && npm run build`
- Migration consistency:
  - `scripts/verify_supabase_migration_consistency.sh`

## Risk Register and Guardrails

- **Risk:** Docs describe aspirational behavior as shipped behavior.
  - **Guardrail:** Mark roadmap/checklist items explicitly as backlog.
- **Risk:** Divergent guidance between authority docs and module docs.
  - **Guardrail:** Tier 0 updates are mandatory before Tier 1/Tier 2 revisions.
- **Risk:** Outdated library guidance after dependency upgrades.
  - **Guardrail:** Context7 verification required for library-facing sections.
- **Risk:** Security regression in docs (wrong key names or policy patterns).
  - **Guardrail:** Security naming and RLS checklist is a hard gate.

## Artifacts

Required outputs for this cycle:

1. Updated docs across all in-scope tiers.
2. Evidence log in `docs/dev/documentation-audit-tracker.md`.
3. Updated navigation entries in `DOCS_INDEX.md` and `docs/README.md` when needed.
4. Changelog entry summarizing documentation changes.

## Definition of Done

- Tier 0 and Tier 1 docs are reconciled and internally consistent.
- Tier 2 package docs are updated for touched workspaces.
- Context7 verification evidence exists for revised library-facing sections.
- Validation gates pass for lint/link and relevant package checks.
- No unresolved high-severity drift items remain in tracker.
