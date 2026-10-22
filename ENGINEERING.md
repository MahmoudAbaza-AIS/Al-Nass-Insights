# Engineering conventions (Al-Nass Insights)

Production-oriented notes for the modular-monolith SPA + .NET API. See also `frontend/src/modules/ARCHITECTURE.md` and Platform.Docs.

## Architecture

| Layer | Location | Rule |
|-------|----------|------|
| UI composition | `frontend/src/app` | Routing, providers, shell only |
| Feature modules | `frontend/src/modules/*` | Own pages/components; public `index.ts` only |
| Shared UI | `frontend/src/shared` | Reusable, module-independent |
| Contracts | `frontend/src/contracts`, `Insights.Application/Contracts` | DTOs / metric shapes — not persistence entities |
| HTTP adapters | `frontend/src/infrastructure`, `Insights.Infrastructure` | Talk to cache/SQL/Oracle/Redis |
| Domain / app | `Insights.Domain`, `Insights.Application` | Business rules; no UI |

### KPI data path (no mock numbers)

```text
Hospital Oracle (approved OQ-* queries)
  → SynchronizationHostedService / SynchronizationOrchestrator
  → App cache (Redis / SqlServer)
  → GET /api/v1/dashboards/{id}
  → React SPA
```

- Dashboard HTTP handlers **never** query Oracle directly (cache-first).
- **No seeded/fake KPI values** in migrations or the SPA. Widget catalog SQL is layout metadata only.
- Missing / unmapped KPIs publish `null` + an availability state — never invent `0`.
- Production and PPR refuse to start if Oracle is disabled, uses a `CHANGE_ME` connection string, sync is off, or the cache provider is `InMemory`.

**Frontend invariant:** modules must not import other modules; compose in `app` / `modules/index.ts`.

## Local setup

### Backend

```powershell
cd backend
dotnet restore AlNass.Insights.slnx
dotnet build AlNass.Insights.slnx -c Release
dotnet test AlNass.Insights.slnx -c Release
dotnet run --project src/Insights.Presentation --launch-profile http
```

- Copy secrets into gitignored `appsettings.Development.json` or environment variables — never commit them.
- For a local demo login user: set `Authentication:SeedDemoUser=true` (Development/PPR only). Production must keep this `false`.
- LocalJwt requires `Authentication:SigningKey` ≥ 32 characters. Template `CHANGE_ME_TO_A_LONG_RANDOM_SECRET…` is rejected outside Development.

### Frontend

```powershell
cd frontend
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

- Default API base: `/api/v1` (Vite proxies to `VITE_DEV_PROXY_TARGET`, default `http://localhost:5080`).
- Docker Compose: set `AUTH_SEED_DEMO_USER=true` only on non-production stacks when a demo user is desired.

## Auth and access

| Concern | Behavior |
|---------|----------|
| Login | `POST /api/v1/auth/login` — rate-limited (10/min/IP) |
| Session | JWT in `localStorage`; expiry stored and checked client-side |
| Dashboard scope | JWT `dashboards` claim (or `*`). Empty claim ⇒ **no** dashboard access |
| Privileged roles | `executive` / `admin` / `Insights.Admin` may receive `*` when dashboards unset |
| Frontend nav | Filtered by `user.dashboards` from `/auth/me` |

## Testing

| Suite | Command |
|-------|---------|
| Backend unit + architecture + integration | `dotnet test AlNass.Insights.slnx -c Release` |
| Frontend unit (Vitest) | `cd frontend && npm test` |
| Frontend typecheck / build | `npm run typecheck` / `npm run build` |

CI (`.github/workflows/ci-cd.yml`) runs backend tests, frontend typecheck/test/build, then Docker image builds.

## Configuration checklist (production)

1. Unique `AUTH_JWT_SIGNING_KEY` (not the CHANGE_ME template).
2. `AUTH_SEED_DEMO_USER=false`.
3. `AUTH_DISABLE_FOR_LOCAL_DEVELOPMENT=false`.
4. CORS origins explicit if the UI is cross-origin.
5. OpenAPI/Scalar disabled on internet-facing hosts unless deliberately exposed.
6. Redis/SQL/Oracle secrets via env or secret store — not source control.

## Deferred (known, not blocking this pass)

- ESLint/Prettier for the frontend.
- First-class API fields for distributions / series / OR rooms (UI currently enriches from widget explanation text where present).
- Organization-level cache isolation (org claim is authenticated but not yet used for data partitioning).
- Shorter JWT lifetime + refresh tokens.
- Account lockout beyond IP rate limiting.
