# Frontend modular monolith (Al-Nass Insights UI)

Aligned with Platform.Docs: one deployable SPA, seven dashboard modules (DASH-01..07), clear internal boundaries.

```
src/
  app/                 Composition root (shell, routing, providers)
  modules/             Feature modules — DASH-01..07 (no cross-module imports)
  contracts/           Shared DTOs / metric definitions (like Platform.Contracts)
  infrastructure/      HTTP adapters to Insights API (`/api/v1/...`)
  shared/              UI kit, hooks, providers used by modules
  styles/              Global theme
```

Dependency direction:

```
app → modules | contracts | infrastructure | shared
modules → contracts | shared | infrastructure (via hooks)
infrastructure → contracts
shared → contracts
```

Modules must not import other modules. API dashboard ids are `DASH-01`..`DASH-07`. Friendly paths remain `/overview`, `/clinical`, etc.
