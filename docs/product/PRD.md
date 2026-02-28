> **Documentation Authority**: [SYSTEM_MODEL.md](../../SYSTEM_MODEL.md) → [AGENTS.md](../../AGENTS.md) → [DOCS_INDEX.md](../../DOCS_INDEX.md)

# AWCMS — Product Requirements Document (PRD)

## 1. Purpose

AWCMS (Ahliweb Content Management System) is an **AI-native, multi-tenant CMS platform** designed for Indonesian educational institutions, government bodies, and SMEs. It provides tenant-isolated content management with built-in compliance, visual page building, and multi-channel publishing.

## 2. Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Platform Owner** | Manages the entire AWCMS instance | Tenant provisioning, global config, billing, compliance |
| **Platform Super Admin** | Technical operator across all tenants | System health, cross-tenant debugging, migration management |
| **Tenant Admin** | Manages a single tenant (e.g., school) | Branding, user management, modules, permissions |
| **Tenant Auditor** | Read-only oversight within a tenant | Audit logs, content review, compliance checks |
| **Editor** | Content lifecycle manager | Create, review, approve, publish content |
| **Author** | Content creator (own content only) | Write, edit own posts, submit for review |
| **Member** | Authenticated community participant | Profile, commenting, community features |
| **Subscriber** | Premium content consumer | Access gated content, manage subscription |
| **Public User** | Anonymous visitor | Browse published content, search, contact forms |

## 3. Key Capabilities

### 3.1 Multi-Tenancy & Isolation

- Logical tenant isolation on shared PostgreSQL schema
- Mandatory `tenant_id` on all tenant-scoped tables
- RLS-enforced data boundaries — never bypassed in client code
- Configurable resource sharing (settings, branding, modules) vs isolation (content, users, media, commerce)

### 3.2 Content Management

- Visual page builder (Puck Editor) with tenant-scoped templates
- Rich text editing (TipTap) with XSS-safe sanitization
- Blog, page, and custom content type support
- Soft delete lifecycle (`deleted_at` column) — no hard deletes for business data
- Media library with tenant-scoped storage buckets

### 3.3 Access Control (ABAC)

- Attribute-Based Access Control with `scope.resource.action` permission keys
- 10-level staff hierarchy (Platform Owner → No Access)
- Frontend enforcement via `usePermissions().hasPermission()`
- Database enforcement via `public.has_permission()` in RLS policies
- DB-driven menu system reflecting granted permissions

### 3.4 Multi-Channel Publishing

- **Admin Panel**: React 19 SPA for content management
- **Public Portal**: Astro SSG with React islands for public-facing sites
- **Mobile App**: Flutter for iOS/Android (subscriber + member features)
- **IoT**: ESP32 firmware for digital signage / sensor integration

### 3.5 AI Integration

- OpenClaw AI Gateway with per-tenant agent isolation
- MCP server topology for developer tooling (Context7, Supabase, GitHub, Cloudflare)
- Stitch import with tenant-controlled sanitization policies

### 3.6 Compliance & Security

- Indonesian UU PDP and PP 71/2019 alignment
- ISO 27001/27701 control mapping
- Audit trail for all write operations
- Encrypted admin-only profile data (pgcrypto)
- Consent management for analytics/telemetry

## 4. Non-Goals

- AWCMS is **not** a general-purpose SaaS builder — it is purpose-built for content management
- **No** Node.js backend servers — all backend logic must reside in Supabase (PostgreSQL + Edge Functions)
- **No** cross-tenant data sharing except through explicitly documented hierarchy mechanisms
- **No** weakening of RLS for convenience — security is non-negotiable
- **No** hardcoded color values — all styling via semantic CSS variables for white-labeling

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| Tenant isolation violations | 0 (zero tolerance) |
| RLS policy coverage | 100% of tenant-scoped tables |
| Build/lint/test pass rate | 100% on main branch |
| Documentation coverage | All modules referenced in DOCS_INDEX.md |
| Compliance checklist completion | All deployer items documented |

## References

- [SYSTEM_MODEL.md](../../SYSTEM_MODEL.md) — Authoritative architecture and constraints
- [AGENTS.md](../../AGENTS.md) — AI agent coding standards
- [USER_STORY.md](USER_STORY.md) — User flows by persona
- [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) — Testable requirements
