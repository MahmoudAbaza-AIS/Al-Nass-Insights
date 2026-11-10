# Al-Nass Hospital Insights

Executive dashboard platform for Al-Nass Hospital: a cache-first **.NET 10** API and **React + Vite** web UI that read KPI data from an application-owned cache, synchronized from hospital sources.

This monorepo is the source of truth for the web application. A future mobile client is out of scope for current Docker deployment.

**Status vocabulary:** *Implemented* (code exists) ≠ *Executed* (ran here) ≠ *Integration verified* (against real hospital systems) ≠ *Production approved*. This README describes the repository implementation; it does not claim unverified deployments or customer Oracle connectivity.

---

## Architecture

| Component | Role |
|---|---|
| **frontend-nginx** | React 19 + Vite 6 SPA + nginx gateway. Proxies `/api`, `/health`, `/openapi`, `/scalar` to the backend on the Compose network. |
| **backend** (`Insights.Presentation`) | Minimal APIs + background sync. Reads dashboards/KPIs from the app cache only (never queries Oracle/SQL on dashboard traffic). |
| **redis** | Application-owned KPI/sync cache (AOF). One instance per environment stack. |
| **sql** | Application-owned SQL Server for symbols/widget catalog and auth users (not customer Oracle). One instance per stack; data on a named volume. |
| **Oracle** | **Customer-managed, external.** Reachable from the backend when enabled; never containerized, migrated, or provisioned by this repo. |
| **Keycloak** | External IdP (not in Compose). Configured via `AUTH_*` settings. |
Each deployment environment runs its **own** Compose project: frontend, backend, Redis, SQL Server, network, and volumes. Stacks can run side-by-side on one Docker host without sharing data.

```text
Browser → alnass-{env}-frontend-nginx:80
            ├─ /           → SPA
            └─ /api,/health → alnass-{env}-backend:8080
                                ├─ Redis (app cache)
                                ├─ SQL Server (symbols catalog)
                                └─ Oracle (optional, external RO)
```

---

## Monorepo layout

```text
Al-Nass Hospital/
├── .github/workflows/ci-cd.yml   # PR validation + branch deploy pipeline
├── docker-compose.yml            # Shared Compose definition (all stacks)
├── .env.example                  # Template for stack env files (no real secrets)
├── scripts/
│   ├── docker-up.ps1             # Local start (optional --build)
│   ├── docker-down.ps1           # Local stop (optional -Volumes; not used by CI)
│   └── Deploy-ComposeStack.ps1   # CI/CD: pull SHA-tagged images, up, smoke
├── frontend/                     # React + Vite (npm, package-lock.json)
│   ├── Dockerfile
│   └── nginx/                    # Per-stack gateway configs (dev/ppr/prod)
├── backend/                      # Al-Nass Insights (.NET 10)
│   ├── AlNass.Insights.slnx
│   ├── Dockerfile
│   ├── global.json               # SDK 10.0.300 (rollForward latestFeature)
│   ├── src/Insights.{Domain,Application,Infrastructure,Presentation}/
│   ├── tests/                    # Unit, architecture, integration
│   └── deploy/                   # Legacy Windows Service scripts (optional)
└── Platform.Docs/                # Local ops/requirements docs (gitignored)
```

---

## Prerequisites

| Tool | Version used / expected |
|---|---|
| .NET SDK | **10.0.300** (`backend/global.json`) |
| Node.js | **22** (frontend Dockerfile + CI) |
| npm | Comes with Node; lockfile is `frontend/package-lock.json` |
| Docker Engine + Compose | Docker Compose V2 (`docker compose`) |
| PowerShell | 5.1+ (Windows deploy scripts) |
| GitHub Actions runner (deploy) | Self-hosted labels: `self-hosted`, `windows`, `alnass-win10-deploy` |

---

## Local development

### Backend

```powershell
cd backend
dotnet restore AlNass.Insights.slnx
dotnet build AlNass.Insights.slnx -c Release
dotnet test AlNass.Insights.slnx -c Release
dotnet run --project src/Insights.Presentation --launch-profile http
```

- Health: `http://localhost:5080/health/live`, `/health/ready`
- OpenAPI/Scalar when enabled: `/openapi/v1.json`, `/scalar/v1`
- For local SqlServer app-cache migrations only:  
  `dotnet run --project src/Insights.Presentation -- --migrate-app-cache`  
  (requires `AppCache__Provider=SqlServer`; **skipped for Redis**)

### Frontend

```powershell
cd frontend
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

Engineering conventions (auth seeding, module boundaries, production checklist): see [ENGINEERING.md](./ENGINEERING.md).

Vite dev server (port **5173**) proxies `/api` and `/health` to `http://localhost:5080`.

**Quality gates:** Typecheck, Vitest (`npm test`), and production build are enforced in CI. ESLint/Prettier are not configured yet.

---

## Docker Compose (local)

1. Copy `.env.example` → `.env.dev` / `.env.ppr` / `.env` and replace every `CHANGE_ME`.
2. Start a stack:

```powershell
# Development  → http://localhost:8080
docker compose --env-file .env.dev up -d --build
# or: .\scripts\docker-up.ps1 -Stack dev -Build

# Preproduction → http://localhost:8081
.\scripts\docker-up.ps1 -Stack ppr -Build

# Production    → http://localhost:80
.\scripts\docker-up.ps1 -Stack prod -Build
```

Stop (keeps volumes):

```powershell
.\scripts\docker-down.ps1 -Stack dev
```

**Do not use** `docker compose down -v` (or `-Volumes`) on shared environments unless you intentionally wipe Redis/SQL data for that stack only. CI never uses volume wipe.

### Configuration injection (important)

| Mechanism | What it does |
|---|---|
| `docker compose --env-file .env.dev` | Substitutes `${VAR}` in `docker-compose.yml` (project name, ports, image names, mapped `environment:` values). |
| Backend `env_file: ${STACK_ENV_FILE}` | Loads that file into the **backend** container. |
| Backend `environment:` block | Explicit ASP.NET configuration overrides (`AppCache__*`, `Sources__*`, …). |
| Frontend `build.args` | `STACK_NAME` selects `nginx/nginx.{dev\|ppr\|prod}.conf`; `VITE_*` baked into the static bundle. |

`--env-file` alone does **not** magically inject every key into every service—only what Compose substitutes or what each service declares.

Secrets belong in gitignored `.env*` on the deploy host (or a secret store that populates them). Never bake credentials into Dockerfiles, images, or committed appsettings.

---

## Configuration and secrets

| Layer | Location | Secrets? |
|---|---|---|
| Shared Compose | `docker-compose.yml` | No |
| Stack identity + runtime | `.env.dev` / `.env.ppr` / `.env` (from `.env.example`) | Yes — gitignored |
| Backend template | `backend/.../appsettings.json` | Placeholders only (committed) |
| Backend env overlays | `appsettings.{Development,ppr,Production}.json` | Gitignored when secret-bearing; Docker env vars preferred in containers |
| Frontend local | `frontend/.env` (from `frontend/.env.example`) | Build-time public URLs only |
| CI registry auth | GitHub `GITHUB_TOKEN` / optional `REGISTRY_*` secrets | GitHub Environments — not exposed to PR forks unnecessarily |

**Frontend build-time vs backend runtime**

- `VITE_API_BASE_URL` / `VITE_DASHBOARD_PUBLIC_URL` are compiled into the frontend image.
- Backend settings (`ORACLE_*`, `AUTH_*`, Redis/SQL connection strings) are runtime env vars on the backend container.

---

## Environment mapping

| Git branch | GitHub Environment | Compose project | `STACK_NAME` | Default UI port | Deploy behavior |
|---|---|---|---|---|---|
| `dev` | `development` | `alnass-dev` | `dev` | `8080` | Push → validate → publish SHA images → deploy **dev** only |
| `ppr` | `preproduction` | `alnass-ppr` | `ppr` | `8081` | Push → validate → publish SHA images → deploy **ppr** only |
| `main` | `production` | `alnass-prod` | `prod` | `80` | Push → validate → publish SHA images → deploy **prod** only |

Pull requests targeting those branches run validation **only** (no registry push, no deploy).

**Image promotion:** not implemented. Each branch builds and publishes its own images from that commit. Redeploying an older SHA to an environment is done via `workflow_dispatch` + `image_tag` (rollback), not by promoting a digest across branches automatically.

---

## Data ownership

| Store | Owner | In Compose? | Persistence |
|---|---|---|---|
| Redis app cache | Application | Yes (`alnass-{env}-redis`) | Named volume `alnass-{env}-redis-data` |
| SQL Server symbols DB | Application | Yes (`alnass-{env}-sql`) | Named volume `alnass-{env}-sql-data` |
| Oracle | **Customer** | **No** | External; RO connection string only |

Redis and SQL Server are **not** published to the host by default (`expose` only). Oracle is never started, migrated, or volume-mounted by this repository.

**Owned SQL migrations:** DbUp scripts for the application cache run only when `AppCache:Provider=SqlServer` (CLI `--migrate-app-cache` or `RunMigrationsOnStartup`). Docker stacks default to **Redis**, so those SQL migrations are skipped. Rolling back container images does **not** reverse any SQL schema changes if SqlServer cache was used.

---

## Checks and tests

### Backend (implemented)

```powershell
cd backend
dotnet test tests/Insights.Domain.UnitTests -c Release
dotnet test tests/Insights.Application.UnitTests -c Release
dotnet test tests/Insights.Infrastructure.UnitTests -c Release
dotnet test tests/Insights.ArchitectureTests -c Release
dotnet test tests/Insights.IntegrationTests -c Release
```

Integration tests use `WebApplicationFactory` with **InMemory** cache and Oracle/SQL sources **disabled**. They do not require customer Oracle or production SQL Server.

### Frontend (implemented / gaps)

| Check | Status |
|---|---|
| `npm ci` | Implemented |
| `npm run typecheck` | Implemented |
| `npm run build` | Implemented (`tsc --noEmit && vite build`) |
| Lint | **Not configured** |
| Unit/component tests | **Not configured** |

---

## CI/CD

Workflow: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

### Pull request

1. **Backend validate** — restore, Release build, unit + architecture + integration tests, upload TRX/coverage artifacts  
2. **Frontend validate** — `npm ci`, typecheck, production build; documents missing lint/tests  
3. **Docker build validate** — `docker build` backend + frontend tagged with commit SHA (**no push**, **no deploy**)

Deployment cannot start unless required validate jobs succeed.

### Push to `dev` / `ppr` / `main`

1. Same validate jobs  
2. **Publish release images** to GHCR (`ghcr.io/<owner>/alnass-insights-backend:<sha>`, `...-frontend:<sha>`)  
3. **Deploy** on self-hosted Windows runner → `Deploy-ComposeStack.ps1`  
   - Logs into registry  
   - Sets `BACKEND_IMAGE` / `FRONTEND_IMAGE` to the **exact SHA refs from this run**  
   - `docker compose pull` + `up -d --no-build` (no image rebuild on server)  
   - Waits for healthy Redis, SQL, backend, frontend  
   - Smoke: `/`, `/health/live`, `/health/ready`  
   - Verifies running containers match the requested image refs  

Concurrency group `alnass-deploy-<environment>` prevents overlapping deploys to the same environment (`cancel-in-progress: false`).

### Rollback

Actions → **Al-Nass Insights CI/CD** → **Run workflow**:

- Choose environment  
- Set `image_tag` to a previously published commit SHA  
- Run from the branch that maps to that environment  

This redeploys existing registry images; it does not reverse database migrations.

### Legacy Windows Service path

`backend/deploy/Deploy-Insights.ps1` remains for optional non-Compose hosting. It is **not** used by the current CI/CD workflow.

---

## GitHub setup (manual — outside YAML)

Configure in the GitHub repository UI:

**Environments** (recommended protection):

| Environment | Branch | Notes |
|---|---|---|
| `development` | `dev` | Optional reviewers |
| `preproduction` | `ppr` | Optional reviewers |
| `production` | `main` | **Required reviewers** recommended |

**Variables**

| Name | Purpose |
|---|---|
| `DEPLOY_ROOT` | Host path with stack `.env*` files (e.g. `C:\Apps\AlNass.Hospital`) |
| `VITE_DASHBOARD_PUBLIC_URL_DEV` | Frontend build arg for `dev` images |
| `VITE_DASHBOARD_PUBLIC_URL_PPR` | Frontend build arg for `ppr` images |
| `VITE_DASHBOARD_PUBLIC_URL_PROD` | Frontend build arg for `main` images |

**Secrets**

| Name | Purpose |
|---|---|
| `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` | Optional; if unset, deploy uses `github.actor` + `GITHUB_TOKEN` for GHCR |
| Stack secrets | Kept in host `.env.dev` / `.env.ppr` / `.env` under `DEPLOY_ROOT` (Oracle, SQL passwords, Keycloak, etc.) — not in PR jobs |

**Runner:** install GitHub Actions runner on the Docker host with labels `self-hosted`, `windows`, `alnass-win10-deploy`. Docker Desktop/Engine must be running. Place filled env files under `DEPLOY_ROOT` before the first deploy.

**GHCR:** ensure packages `alnass-insights-backend` / `alnass-insights-frontend` are creatable by Actions (`packages: write` is set on the workflow).

---

## Health, logs, troubleshooting

| Check | URL / command |
|---|---|
| UI | `http://<host>:<UI_HOST_PORT>/` |
| Liveness | `http://<host>:<UI_HOST_PORT>/health/live` |
| Readiness (app cache) | `http://<host>:<UI_HOST_PORT>/health/ready` |
| Stack status | `docker compose --env-file .env.dev ps` |
| Logs | `docker compose --env-file .env.dev logs -f backend frontend` |
| Release metadata | `.deploy/<stack>-release.json` on the deploy host after CI deploy |

| Symptom | Likely cause |
|---|---|
| SQL container restart loop | Weak `MSSQL_SA_PASSWORD` |
| Ready 503 | Redis not healthy / wrong `APPCACHE_CONNECTION_STRING` |
| Auth failures | Keycloak `AUTH_*` misconfigured; bypass only allowed in Development/`ppr` |
| Blank UI after deploy | Frontend image build failed or wrong tag; check `docker inspect` image refs |
| Oracle sync errors | Network/VPN to customer Oracle — app still serves cache |

---

## Known limitations

- Frontend lint and unit tests are **not configured**.
- Customer Oracle, Keycloak SSO, and hospital network paths are **not claimed verified** by this README.
- Faster sync tiers exist in code but default `SYNC_ACTIVATE_FASTER_TIERS=false`.
- `Platform.Docs/` is local/gitignored operational documentation; treat it as reference, not published product docs.
- First successful GHCR publish and self-hosted deploy require the manual GitHub/runner/env setup above — not verified until those exist.

---

## License / ownership

Internal Advansys-IS / Al-Nass Hospital delivery. See `CODEOWNERS` for protected paths.
