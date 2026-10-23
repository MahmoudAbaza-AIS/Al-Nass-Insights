# Visual & functional verification (in-repo)

Headless Chrome CDP scripts adapted from the previous `%TEMP%\alnass-vis` harness. They use **deterministic fixture injection** (or live API) and do not require Playwright.

## Prerequisites

- Google Chrome or Chromium (`CHROME_PATH` if not on a default install path)
- A running frontend that proxies `/api` (Vite dev or production preview against the stack)
- Dev seed user available to the local API (`demo` / `Demo123!`) for auth bootstrap only

## Commands

From `frontend/`:

```bash
# Unit tests (fixtures / timezone / API mapping)
npm test

# Layout + overflow matrix (fixture mode, screenshots under scripts/visual/out)
npm run test:visual

# Focused matrix (example)
npm run test:visual -- --viewports 1920x1080,390x844 --routes overview,emergency --shots 0

# Navigation / auth / refresh / presentation (live local stack)
npm run test:func

# Refresh / hard-reload / invalid-timezone crash probe
npm run test:refresh-probe
```

Optional env:

- `ALNASS_BASE_URL` (default `http://localhost:5173` — prefer `localhost` over `127.0.0.1` if another process contends for the same port on IPv4)
- `CHROME_PATH`
- For Vite + Docker API: `VITE_DEV_PROXY_TARGET=http://localhost:8080 npm run dev`

## Modes (`test:visual`)

| Mode | Purpose |
|---|---|
| `fixture` | Intercepts dashboard GETs with deterministic widgets |
| `unavailable` | All widgets `Unavailable` |
| `error` / `loading` | Forced failure / hung request |
| `live` | Real API responses |
| `anon` | Cleared auth → login |

## Interpreting results

- `DOC-X` / `DOC-Y` on non-mobile viewports are hard failures for page overflow.
- Mobile (`width < 768` or height-fit off) may scroll vertically (`DOC-Y(mobile-ok)`).
- `scroll` / `clip` / `outside` / `overlap` are **signals**, not automatic proof of harmful UI defects — combine with screenshots.
- Fixture passes do not prove the live API publishes the same fields (see series / OR rooms unavailable states).
