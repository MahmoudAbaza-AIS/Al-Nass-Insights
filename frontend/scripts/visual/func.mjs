// Functional checks with trusted CDP input against the local dev stack (read-only GETs, dev seed user).
// Usage: npm run test:func --  (requires a running app; set ALNASS_BASE_URL / CHROME_PATH as needed)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, "out"), { recursive: true });
const BASE = process.env.ALNASS_BASE_URL ?? "http://localhost:5173";
function resolveChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return candidates.find((p) => existsSync(p));
}
const CHROME = resolveChrome();
if (!CHROME) {
  console.error("Chrome/Chromium not found. Set CHROME_PATH.");
  process.exit(1);
}
const PORT = 9900 + Math.floor(Math.random() * 90);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), `alnass-func-${PORT}`)}`, "--no-first-run", "about:blank"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
let currentJs = null;
const check = async (name, ok, detail = "") => {
  if (currentJs) { const crashed = await currentJs(`document.body.innerText.includes('Something went wrong')`); if (crashed) detail += " [ERROR BOUNDARY VISIBLE]"; } results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };

async function getJson(url) { for (let i = 0; i < 50; i++) { try { return await (await fetch(url)).json(); } catch { await sleep(200); } } throw new Error("no chrome"); }

async function main() {
  const version = await getJson(`http://127.0.0.1:${PORT}/json/version`);
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0; const pending = new Map();
  ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data);
    if (m.method === "Runtime.exceptionThrown") console.log("  [exception]", JSON.stringify(m.params.exceptionDetails).slice(0, 1500));
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") console.log("  [console.error]", m.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 1500));
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params, sessionId })); });

  async function openPage(w, h, path, { anon = false } = {}) {
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const s = (m, p) => send(m, p, sessionId);
    await s("Page.enable"); await s("Runtime.enable");
    await s("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
    const js = async (expression) => (await s("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: false })).result.value;
    if (!anon) {
      const r = await fetch(`${BASE}/api/v1/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "demo", password: "Demo123!" }) });
      const j = await r.json();
      await s("Page.addScriptToEvaluateOnNewDocument", { source: `try{if(!sessionStorage.getItem('seeded')){localStorage.setItem("alnass.auth.token", ${JSON.stringify(j.accessToken)});localStorage.setItem("alnass.auth.expiresAt", ${JSON.stringify(j.expiresAt)});sessionStorage.setItem('seeded','1')}}catch{}` });
    } else {
      await s("Page.addScriptToEvaluateOnNewDocument", { source: `try{localStorage.clear()}catch{}` });
    }
    await s("Page.navigate", { url: `${BASE}${path}` });
    await waitFor(js, `!!document.querySelector("header h1, form")`, 10000);
    await sleep(1200);
    const center = async (sel) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    const click = async (sel) => {
      const c = await center(sel); if (!c) return false;
      await s("Input.dispatchMouseEvent", { type: "mouseMoved", x: c.x, y: c.y });
      await s("Input.dispatchMouseEvent", { type: "mousePressed", x: c.x, y: c.y, button: "left", clickCount: 1 });
      await s("Input.dispatchMouseEvent", { type: "mouseReleased", x: c.x, y: c.y, button: "left", clickCount: 1 });
      return true;
    };
    const hover = async (sel) => { const c = await center(sel); if (c) await s("Input.dispatchMouseEvent", { type: "mouseMoved", x: c.x, y: c.y }); };
    const key = async (k, code, vk) => { await s("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: vk, ...(k === "Enter" ? { text: "\r" } : {}) }); await s("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk }); };
    const type = async (text) => s("Input.insertText", { text });
    currentJs = js;
    return { s, js, click, hover, key, type, close: () => send("Target.closeTarget", { targetId }) };
  }
  async function waitFor(js, expr, ms = 5000) { const t = Date.now(); while (Date.now() - t < ms) { if (await js(expr)) return true; await sleep(150); } return false; }

  // 1. Routing via nav (desktop)
  {
    const p = await openPage(1440, 900, "/overview");
    const navs = await p.js(`[...document.querySelectorAll('aside[aria-label=Primary] button')].map(b => b.getAttribute('aria-label') + (b.getAttribute('aria-current') ? '*' : ''))`);
    await check("nav: 7 accessible buttons, Overview current", navs.length === 7 && navs[0].endsWith("*"), navs.join(", "));
    const routes = [["Clinical Performance", "/clinical"], ["Operating Room Performance", "/operating-room"], ["Call Center Performance", "/call-center"], ["Outpatient Clinic Performance", "/outpatient"], ["Emergency Performance", "/emergency"], ["Inpatient Services Performance", "/inpatient"], ["Hospital Overview", "/overview"]];
    for (const [label, path] of routes) {
      const sel = `aside[aria-label=Primary] button[aria-label="${label}"]`;
      const found = await p.click(sel);
      const ok = found && await waitFor(p.js, `location.pathname === ${JSON.stringify(path)} && document.querySelector('header h1')?.textContent.trim() === ${JSON.stringify(label)} && document.querySelector(${JSON.stringify(sel)}).getAttribute('aria-current') === 'page'`);
      await check(`route click → ${path}`, ok, found ? "" : `nav button "${label}" not found`);
    }
    await p.js(`history.back()`);
    await check("browser back → /inpatient", await waitFor(p.js, `location.pathname === '/inpatient' && document.querySelector('header h1')?.textContent.trim() === 'Inpatient Services Performance'`));

    // 1b. Persistent identity (not tooltip-only)
    const identity = await p.js(`(() => {
      const header = document.querySelector('header');
      if (!header) return false;
      const text = header.innerText || '';
      // Prefer display name; accept username if claims only expose that.
      return /Demo User|\\bdemo\\b/i.test(text) && /Last updated/i.test(text);
    })()`);
    await check("header shows persistent user identity", identity, await p.js(`document.querySelector('header')?.innerText.slice(0,240)`));

    // 2. Refresh: counts dashboard GETs issued by the button
    await p.js(`window.__dashCalls = 0; performance.clearResourceTimings();`);
    const before = await p.js(`performance.getEntriesByType('resource').filter(e => /\\/api\\/v1\\/dashboards\\//.test(e.name)).length`);
    await p.click(`button[aria-label="Refresh dashboard data"]`);
    const refreshed = await waitFor(p.js, `performance.getEntriesByType('resource').filter(e => /\\/api\\/v1\\/dashboards\\//.test(e.name)).length > ${before}`, 5000);
    await check("refresh button issues a dashboard request", refreshed);
    await sleep(800);
    await check(
      "refresh does not trip AppErrorBoundary",
      !(await p.js(`document.body.innerText.includes('Something went wrong')`)),
    );

    // 3. Tooltips on hover
    await waitFor(p.js, `!document.querySelector('button[aria-label="Refresh dashboard data"]').disabled`, 8000);
    await p.s("Input.dispatchMouseEvent", { type: "mouseMoved", x: 700, y: 450 });
    await sleep(600);
    for (const [lbl, tip] of [["Refresh dashboard data", "Refresh"], ["Enter presentation mode", "Presentation"], ["Sign out", "Sign out"], ["Clinical Performance", "Clinical Performance"]]) {
      await p.hover(`[aria-label="${lbl}"]`);
      const shown = await waitFor(p.js, `[...document.querySelectorAll('[role=tooltip], [data-pc-name=tooltip], .p-tooltip, [data-scope=tooltip]')].some(e => e.textContent.includes(${JSON.stringify(tip)}))`, 2500);
      const any = shown ? "" : await p.js(`[...document.body.querySelectorAll('body > *')].slice(-3).map(e => e.outerHTML.slice(0, 160)).join(' | ')`);
      await check(`tooltip on hover: ${lbl}`, shown, any);
      await p.s("Input.dispatchMouseEvent", { type: "mouseMoved", x: 700, y: 450 });
      await sleep(300);
    }

    // 4. Keyboard: tab order + visible focus
    await p.js(`location.reload()`);
    await waitFor(p.js, `!!document.querySelector('header h1')`, 10000);
    await sleep(1500);
    const seq = [];
    for (let i = 0; i < 12; i++) {
      await p.key("Tab", "Tab", 9);
      await sleep(120);
      seq.push(await p.js(`(() => { const e = document.activeElement; const cs = getComputedStyle(e); const ring = (cs.boxShadow && cs.boxShadow !== 'none') || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0); return (e.getAttribute('aria-label') || e.textContent.trim().slice(0, 30) || e.tagName) + (ring ? '' : ' [NO RING]'); })()`));
    }
    await check("keyboard tab order reaches skip link, header actions and nav with visible focus", !seq.some((x) => x.includes("[NO RING]")) && seq.some((x) => x.includes("Skip")) && seq.some((x) => x.includes("Refresh")) && seq.some((x) => x.includes("Clinical")), seq.join(" → "));
    // Enter on focused nav button navigates
    await p.js(`document.querySelector('aside button[aria-label="Emergency Performance"]').focus()`);
    await p.key("Enter", "Enter", 13);
    await check("keyboard Enter on nav button navigates", await waitFor(p.js, `location.pathname === '/emergency'`));

    // 5. Presentation mode (trusted click → real fullscreen request)
    await p.click(`button[aria-label="Enter presentation mode"]`);
    const entered = await waitFor(p.js, `!!document.querySelector('button[aria-label="Exit presentation mode"]')`, 4000);
    const fs = await p.js(`!!document.fullscreenElement`);
    await check("presentation: enter toggles state", entered, `fullscreenElement=${fs}`);
    const fit = await p.js(`document.documentElement.scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth + 1`);
    await check("presentation: no document scroll", fit);
    await p.click(`button[aria-label="Exit presentation mode"]`);
    await check("presentation: exit restores state", await waitFor(p.js, `!!document.querySelector('button[aria-label="Enter presentation mode"]') && !document.fullscreenElement`, 4000));

    // 6. RTL robustness (not a product feature): no overflow with dir=rtl
    await p.js(`document.documentElement.dir = 'rtl'`);
    await sleep(500);
    const rtl = await p.js(`({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, iw: innerWidth, ih: innerHeight })`);
    await check("dir=rtl: no document overflow at 1440x900", rtl.sw <= rtl.iw + 1 && rtl.sh <= rtl.ih + 1, JSON.stringify(rtl));
    await p.js(`document.documentElement.dir = 'ltr'`);

    // 7. Sign out → login page, token cleared
    await p.click(`button[aria-label="Sign out"]`);
    const out = await waitFor(p.js, `!!document.querySelector('form') && !localStorage.getItem('alnass.auth.token')`, 4000);
    await check("sign out → login form, token cleared", out);
    // 8. Sign in with dev seed user through the form
    await p.click(`input[autocomplete=username], input[name=username], form input:not([type=password])`);
    await p.type("demo");
    await p.click(`input[type=password]`);
    await p.type("Demo123!");
    await p.click(`form button[type=submit]`);
    await check("sign in via form → dashboard", await waitFor(p.js, `!!document.querySelector('header h1') && !!localStorage.getItem('alnass.auth.token')`, 8000), await p.js(`location.pathname`));
    await p.close();
  }

  // 9. Mobile compact nav
  {
    const p = await openPage(390, 844, "/overview");
    const sel = `main ~ * button[aria-label="Clinical Performance"], div.md\\:hidden button[aria-label="Clinical Performance"]`;
    await p.click(sel);
    await check("mobile: compact nav routes", await waitFor(p.js, `location.pathname === '/clinical'`));
    const ox = await p.js(`document.documentElement.scrollWidth <= innerWidth`);
    await check("mobile: no horizontal overflow (live data)", ox);
    await p.close();
  }

  // 10. Deep link + unauthenticated redirect behaviour
  {
    const p = await openPage(1280, 600, "/operating-room");
    await check("deep link /operating-room renders its dashboard", await waitFor(p.js, `document.querySelector('header h1')?.textContent.trim() === 'Operating Room Performance'`));
    await p.close();
    const a = await openPage(1280, 600, "/clinical", { anon: true });
    await check("unauthenticated deep link shows login", await waitFor(a.js, `!!document.querySelector('form input[type=password]')`));
    await a.close();
  }

  writeFileSync(join(__dirname, "out", "func-results.json"), JSON.stringify(results, null, 2));
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} passed`);
  if (passed !== results.length) process.exitCode = 1;
  ws.close();
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => chrome.kill());
