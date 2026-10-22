# Frontend modular monolith (Al-Nass Insights UI)

One deployable SPA (Vite + React + TypeScript + PrimeReact + Tailwind). Source is organized by functional module so DASH-01..07 and auth stay cohesive.

## Folder structure

```text
src/
  main.tsx
  app/                 Composition root (providers, router, layouts, styles, App.tsx)
  modules/             auth + DASH-01..07 (pages/, components/, index.ts)
  contracts/           Shared DTOs / metric definitions
  infrastructure/      HTTP adapters to Insights API
  shared/              Reusable UI kit, hooks, display preferences
```

## Dependency rules

```text
app            → modules | contracts | infrastructure | shared
modules        → contracts | shared | infrastructure
infrastructure → contracts
shared         → contracts
```

- No module → module imports.
- Public surface only via each module’s `index.ts`.
- `shared` is not a dumping ground for module-specific code.

## Access control (UI)

- Navigation is filtered by `user.dashboards` from `/auth/me` (`*` = all).
- Users with no assigned dashboards see an explicit “no access” state.
- HTTP dashboard GETs may include `facility` / `period` query params when present in the URL.

See repo root `ENGINEERING.md` for auth seeding, rate limits, and production checklist.

Friendly paths remain `/overview`, `/clinical`, `/operating-room`, `/call-center`, `/outpatient`, `/emergency`, `/inpatient`. API dashboard ids remain `DASH-01`..`DASH-07`.
