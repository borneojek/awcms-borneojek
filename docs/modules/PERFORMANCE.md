> **Documentation Authority**: [SYSTEM_MODEL.md](../../SYSTEM_MODEL.md) Section 1 (Tech Stack)

# Performance Guide

## Purpose

Summarize performance strategies implemented in AWCMS.

## Audience

- Admin panel developers
- Operators tuning performance

## Prerequisites

- [SYSTEM_MODEL.md](../../SYSTEM_MODEL.md) - **Primary authority** for performance optimization patterns
- [AGENTS.md](../../AGENTS.md) - Implementation patterns and Context7 references
- `docs/architecture/overview.md`

## Core Concepts

- Route-level code splitting with `React.lazy`.
- Local caching via `UnifiedDataManager` (60s TTL).
- Vite 7 warmup for faster dev startup.
- React Router loaders reduce redundant client fetches.

## How It Works

- Code splitting is defined in `awcms/src/components/MainRouter.jsx`.
- `UnifiedDataManager` caches read operations and invalidates on writes.
  - Cache entries are stored in localStorage with a 60s TTL (`udm_cache_` prefix).

## Implementation Patterns

```javascript
const BlogsManager = lazy(() => import('@/components/dashboard/BlogsManager'));
```

### Context7 Guidance (React + Router)

- Prefer `loader` + `useLoaderData` for route data to reduce duplicate `useEffect` fetches.
- Keep effects separated by concern and include full dependency arrays.

## Permissions and Access

- Performance optimizations must not bypass ABAC or RLS.

## Security and Compliance Notes

- Cached data must remain tenant-scoped.
- Do not cache data across tenants.

## References

- `docs/architecture/overview.md`
- `docs/modules/SCALABILITY_GUIDE.md`
