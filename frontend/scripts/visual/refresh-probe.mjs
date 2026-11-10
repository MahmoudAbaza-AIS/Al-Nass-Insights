/**
 * Repeated refresh / hard-reload probe for AppErrorBoundary regressions.
 * Usage: node scripts/visual/refresh-probe.mjs [--base http://127.0.0.1:5173] [--rounds 12]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, "out"), { recursive: true });

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);

const BASE = args.base ?? process.env.ALNASS_BASE_URL ?? "http://localhost:5173";
const ROUNDS = Number(args.rounds ?? 12);

function resolveChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((p) => existsSync(p));
}

const CHROME = resolveChrome();
if (!CHROME) {
  console.error("Chrome/Chromium not found. Set CHROME_PATH.");
  process.exit(1);
}

const PORT = 9700 + Math.floor(Math.random() * 90);
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${join(tmpdir(), `alnass-refresh-${PORT}`)}`,
  "--no-first-run",
  "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let i = 0; i < 50; i++) {
    try {
      return await (await fetch(url)).json();
    } catch {
      await sleep(200);
    }
  }
  throw new Error("Chrome CDP unreachable");
}

async function main() {
  const version = await getJson(`http://127.0.0.1:${PORT}/json/version`);
  const login = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "demo", password: "Demo123!" }),
  });
  if (!login.ok) throw new Error(`login failed ${login.status}`);
  const auth = await login.json();

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === "Runtime.exceptionThrown") {
      consoleErrors.push(JSON.stringify(msg.params.exceptionDetails).slice(0, 500));
    }
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s("Page.enable");
  await s("Runtime.enable");
  await s("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await s("Page.addScriptToEvaluateOnNewDocument", {
    source: `try{localStorage.setItem("alnass.auth.token", ${JSON.stringify(auth.accessToken)});localStorage.setItem("alnass.auth.expiresAt", ${JSON.stringify(auth.expiresAt)});}catch{}`,
  });
  // Seed an invalid timezone once to verify the app no longer crashes on render.
  await s("Page.addScriptToEvaluateOnNewDocument", {
    source: `try{localStorage.setItem("alnass.dashboard.displayPrefs", JSON.stringify({timeZone:"Not/AZone",refreshIntervalMs:60000}));}catch{}`,
  });
  await s("Page.navigate", { url: `${BASE}/overview` });
  const js = async (expression) =>
    (await s("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;

  for (let i = 0; i < 40; i++) {
    await sleep(250);
    if (await js(`!!document.querySelector("header h1")`)) break;
  }

  const log = [];
  const boundary = async () =>
    js(`document.body.innerText.includes("Something went wrong")`);

  log.push({ step: "initial-load", boundary: await boundary() });

  for (let i = 0; i < ROUNDS; i++) {
    await js(`document.querySelector('button[aria-label="Refresh dashboard data"]')?.click()`);
    await sleep(400);
    if (i % 3 === 2) {
      await s("Page.reload", { ignoreCache: true });
      for (let j = 0; j < 40; j++) {
        await sleep(200);
        if (await js(`!!document.querySelector("header h1, form")`)) break;
      }
    }
    log.push({
      step: `round-${i + 1}`,
      boundary: await boundary(),
      title: await js(`document.querySelector("header h1")?.textContent ?? ""`),
    });
  }

  // Rapid refresh burst
  await js(`for (let i=0;i<8;i++) document.querySelector('button[aria-label="Refresh dashboard data"]')?.click()`);
  await sleep(1500);
  log.push({ step: "rapid-refresh", boundary: await boundary() });

  const failed = log.filter((e) => e.boundary);
  writeFileSync(join(__dirname, "out", "refresh-probe.json"), JSON.stringify({ log, consoleErrors, failed }, null, 2));
  console.log(JSON.stringify({ rounds: ROUNDS, boundaryHits: failed.length, consoleErrors: consoleErrors.length }, null, 2));
  if (failed.length) process.exitCode = 1;
  ws.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => chrome.kill());
