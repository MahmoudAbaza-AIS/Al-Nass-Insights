// Headless Chrome CDP harness for Al-Nass visual + overflow verification.
// Usage:
//   npm run test:visual -- --out ./scripts/visual/out --mode fixture
//   node scripts/visual/harness.mjs --base http://127.0.0.1:4173 --viewports 1920x1080,390x844
// Env: ALNASS_BASE_URL, CHROME_PATH (optional). Does not embed credentials in fixtures mode
// beyond obtaining a short-lived demo token from the local stack login endpoint.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);

const BASE = args.base ?? process.env.ALNASS_BASE_URL ?? "http://localhost:5173";
const OUT = args.out ?? join(__dirname, "out");
const MODE = args.mode ?? "fixture";
const SHOTS = args.shots !== "0";
const ROUTES = (args.routes ?? "overview,clinical,operating-room,call-center,outpatient,emergency,inpatient").split(",");
const VIEWPORTS = (
  args.viewports ??
  "3840x2160,1920x1080,1440x900,1366x768,1280x600,1024x768,768x1024,390x844,844x390"
)
  .split(",")
  .map((v) => v.split("x").map(Number));
const ACTION = args.action ?? "";
mkdirSync(OUT, { recursive: true });

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
  console.error("Chrome/Chromium not found. Set CHROME_PATH to a browser binary.");
  process.exit(1);
}
const PORT = 9333 + Math.floor(Math.random() * 500);
const profile = join(tmpdir(), `alnass-chrome-${PORT}`);
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--hide-scrollbars=false",
  "--force-device-scale-factor=1",
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, init) {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(url, init);
      return await r.json();
    } catch {
      await sleep(200);
    }
  }
  throw new Error(`unreachable ${url}`);
}

const W = (state, value, explanation = null, unit = null) => ({ state, value, explanation, unit });
const FIXTURE_WIDGETS = {
  "DASH-01": {
    "er.visits.total": W("Available", 0),
    "opd.visits.attended": W("Available", 0),
    "application_request.outcome_split": W("Available", 100, "Approved=62 Waiting=21 Rejected=17"),
    "opd.appointment_performance": W("Available", 100, "OnTime=60 NoShow=25 Cancellation=15"),
    "callcenter.inbound_outbound_share": W("Available", 100, "Inbound=82 Outbound=18"),
    "or.utilization_rate": W("Available", 60),
    "er.door_to_doctor_minutes": W("Available", 32),
    "inpatient.bed_occupancy_rate": W("Available", 60),
    "clinical.recovery_rate": W("Available", 88),
  },
  "DASH-02": {
    "clinical.pressure_ulcer_rate": W("Available", 3),
    "clinical.adverse_events_rate": W("Available", 20),
    "clinical.missed_diagnosis_rate": W("Available", 15),
    "clinical.vte_compliance": W("Available", 88),
    "clinical.falls_rate": W("Available", 5),
    "clinical.ventilator_utilization": W("Available", 75),
    "clinical.ventilator_days": W("Available", 120),
    "clinical.extubation_failure": W("Available", 10),
    "clinical.reintubation_48h": W("Available", 2),
    "clinical.recovery_rate": W("Available", 92),
    "clinical.complication_rate": W("Available", 4),
    "clinical.mortality_rate": W("Available", 2),
    "clinical.med_turnaround_minutes": W("Available", 32),
    "clinical.near_miss": W("Available", 4.5),
    "clinical.medication_error": W("Available", 2.1),
    "or.ssi_rate": W("Available", 1.1),
    "clinical.cauti_rate": W("Available", 2),
    "clinical.clabsi_rate": W("Available", 1.7),
    "clinical.vap_rate": W("Available", 2.7),
  },
  "DASH-03": {
    "or.utilization_rate": W("Available", 78),
    "or.first_case_ontime": W("Available", 22),
    "or.turnover_minutes": W("Available", 25),
    "or.cancellation_rate": W("Available", 4),
    "or.postop_complication_rate": W("Available", 5),
    "or.ssi_rate": W("Available", 15),
    "or.daily_surgeries_cath": W("Available", 200),
    "or.reoperation_rate": W("Available", 22),
  },
  "DASH-04": {
    "callcenter.volume_total": W("Available", 2350),
    "callcenter.service_level_20s": W("Available", 89),
    "callcenter.aht": W("Available", 3.45),
    "callcenter.abandoned_rate": W("Available", 45),
  },
  "DASH-05": {
    "opd.visits.attended": W("Available", 0),
    "opd.referral_rate": W("Available", 75),
    "opd.appointment_lead_days": W("Available", 7),
    "opd.clinic_utilization": W("Available", 78),
    "opd.visits_per_physician": W("Available", 75),
    "opd.waiting_minutes": W("Available", 24),
    "opd.consultation_minutes": W("Available", 18),
    "opd.followup_compliance": W("Available", 92),
    "opd.appointment_performance": W("Available", 100, "OnTime=60 NoShow=25 Cancellation=15"),
  },
  "DASH-06": {
    "er.visits.total": W("Available", 0),
    "er.admitted_count": W("Available", 0),
    "er.discharged_home_count": W("Available", 0),
    "er.referred_out_count": W("Available", 0),
    "er.lwbs_count": W("Available", 0),
    "er.door_to_doctor_minutes": W("Available", 25),
    "er.length_of_stay": W("Available", 4.5),
  },
  "DASH-07": {
    "inpatient.bed_occupancy_rate": W("Available", 78),
    "inpatient.alos_days": W("Available", 4.5),
    "inpatient.bed_turnover": W("Available", 4),
    "inpatient.cancellation_rate": W("Available", 4),
    "inpatient.bed_capacity": W("Available", 5000, "Used=3900 Available=1100", "beds"),
    "inpatient.readmission_rate": W("Available", 10),
    "inpatient.satisfaction_score": W("Available", 4),
    "inpatient.complaint_rate": W("Available", 5),
    "inpatient.violation_rate": W("Available", 12),
  },
};

function buildPayloads(mode) {
  const now = new Date().toISOString();
  const out = {};
  for (const [id, widgets] of Object.entries(FIXTURE_WIDGETS)) {
    out[id] = {
      dashboardId: id,
      name: id,
      businessArea: "fixture",
      dataAsOf: now,
      lastSuccessfulRefresh: now,
      widgets: Object.entries(widgets).map(([kpi, w]) => ({
        reviewId: kpi,
        canonicalKpiId: kpi,
        displayName: kpi,
        state: mode === "unavailable" ? "Unavailable" : w.state,
        value: mode === "unavailable" ? null : w.value,
        unit: w.unit,
        period: null,
        dataAsOf: now,
        explanation: mode === "unavailable" ? null : w.explanation,
        isPartial: false,
      })),
    };
  }
  return out;
}

function injectedScript(token, expiresAt, mode, payloads) {
  return `(() => {
    const mode = ${JSON.stringify(mode)};
    try {
      if (mode === "anon") { localStorage.clear(); }
      else { localStorage.setItem("alnass.auth.token", ${JSON.stringify(token)}); localStorage.setItem("alnass.auth.expiresAt", ${JSON.stringify(expiresAt)}); }
    } catch {}
    if (mode === "live" || mode === "anon") return;
    const payloads = ${JSON.stringify(payloads)};
    const orig = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : input.url;
      const m = /\\/api\\/v1\\/dashboards\\/(DASH-0[1-7])/.exec(url);
      if (!m) return orig(input, init);
      if (mode === "loading") return new Promise(() => {});
      if (mode === "error") return Promise.resolve(new Response(JSON.stringify({ title: "Upstream cache unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } }));
      return Promise.resolve(new Response(JSON.stringify(payloads[m[1]]), { status: 200, headers: { "Content-Type": "application/json" } }));
    };
  })();`;
}

const measureFn = `(() => {
  const iw = innerWidth, ih = innerHeight;
  const de = document.documentElement;
  const desc = (el) => {
    const cls = (el.getAttribute("class") || "").split(/\\s+/).slice(0, 4).join(".");
    const txt = (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\\s+/g, " ").slice(0, 40);
    return el.tagName.toLowerCase() + (cls ? "." + cls : "") + (txt ? ' "' + txt + '"' : "");
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    if (cs.position === "absolute" && cs.clip === "rect(0px, 0px, 0px, 0px)") return false;
    if (el.closest(".sr-only")) return false;
    return true;
  };
  const all = [...document.body.querySelectorAll("*")].filter(visible);
  const scrollables = [], clipped = [], outside = [];
  for (const el of all) {
    const cs = getComputedStyle(el);
    const ox = cs.overflowX, oy = cs.overflowY;
    const overY = el.scrollHeight - el.clientHeight > 1, overX = el.scrollWidth - el.clientWidth > 1;
    if ((["auto","scroll"].includes(oy) && overY) || (["auto","scroll"].includes(ox) && overX)) scrollables.push(desc(el) + " sh=" + el.scrollHeight + "/" + el.clientHeight + " sw=" + el.scrollWidth + "/" + el.clientWidth);
    else if (((oy === "hidden" || oy === "clip") && overY) || ((ox === "hidden" || ox === "clip") && overX)) clipped.push(desc(el) + " sh=" + el.scrollHeight + "/" + el.clientHeight + " sw=" + el.scrollWidth + "/" + el.clientWidth);
    const hasContent = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || ["IMG","svg","BUTTON","INPUT"].includes(el.tagName);
    if (hasContent) {
      const r = el.getBoundingClientRect();
      if (r.right > iw + 1 || r.bottom > ih + 1 || r.left < -1 || r.top < -1) outside.push(desc(el) + " [" + Math.round(r.left) + "," + Math.round(r.top) + "," + Math.round(r.right) + "," + Math.round(r.bottom) + "]");
    }
  }
  const texts = all.filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const rects = texts.map((el) => {
    const range = document.createRange(); range.selectNodeContents(el);
    const g = range.getBoundingClientRect(), b = el.getBoundingClientRect();
    const isSvg = el instanceof SVGElement;
    const r = isSvg ? g : { left: Math.max(g.left, b.left), right: Math.min(g.right, b.right), top: Math.max(g.top, b.top), bottom: Math.min(g.bottom, b.bottom) };
    return { el, r, isSvg };
  });
  const overlaps = [];
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i], b = rects[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
    const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (x > 2 && y > 2) overlaps.push(desc(a.el) + " <> " + desc(b.el));
  }
  let minFont = 99, minFontEl = ""; const smallFonts = [];
  for (const { el, isSvg } of rects) {
    let fs = parseFloat(getComputedStyle(el).fontSize);
    if (isSvg && el.getScreenCTM) { const m = el.getScreenCTM(); if (m) fs *= Math.hypot(m.a, m.b); }
    fs = Math.round(fs * 10) / 10;
    if (fs < minFont) { minFont = fs; minFontEl = desc(el); }
    if (fs < 10) smallFonts.push(fs + " " + desc(el) + " in " + (el.closest("svg")?.getAttribute("aria-label") ?? el.closest("[aria-label]")?.getAttribute("aria-label") ?? ""));
  }
  return {
    viewport: iw + "x" + ih,
    doc: { sw: de.scrollWidth, sh: de.scrollHeight, bodySw: document.body.scrollWidth, bodySh: document.body.scrollHeight },
    docScrollX: de.scrollWidth > iw + 1, docScrollY: de.scrollHeight > ih + 1,
    scrollables, clipped, outside: outside.slice(0, 15), overlaps: overlaps.slice(0, 15),
    minFont, minFontEl, smallFonts: [...new Set(smallFonts)], title: document.querySelector("h1")?.innerText ?? "",
  };
})()`;

async function main() {
  const version = await getJson(`http://127.0.0.1:${PORT}/json/version`);
  let token = "", expiresAt = "";
  if (MODE !== "anon") {
    const login = await fetch(`${BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "demo", password: "Demo123!" }),
    });
    if (!login.ok) throw new Error(`login failed ${login.status}`);
    const j = await login.json();
    token = j.accessToken;
    expiresAt = j.expiresAt;
  }
  const payloads = buildPayloads(MODE);

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
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

  const results = [];
  for (const [w, h] of VIEWPORTS) {
    for (const route of ROUTES) {
      const { targetId } = await send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
      const s = (m, p) => send(m, p, sessionId);
      await s("Page.enable");
      await s("Runtime.enable");
      await s("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768, screenWidth: w, screenHeight: h });
      await s("Page.addScriptToEvaluateOnNewDocument", { source: injectedScript(token, expiresAt, MODE, payloads) });
      await s("Page.navigate", { url: `${BASE}/${route}` });
      const evalJs = async (expression) => (await s("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
      for (let i = 0; i < 40; i++) {
        await sleep(250);
        const ready = await evalJs(`document.readyState === "complete" && !!document.querySelector("#root > *") && ![...document.querySelectorAll("[role=status]")].some(e => /Checking session|Loading view/.test(e.innerText))`);
        if (ready && i > 6) break;
      }
      await evalJs(`document.fonts.ready.then(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))))`);
      if (ACTION) await evalJs(ACTION);
      await sleep(900);
      const m = await evalJs(measureFn);
      m.route = route;
      results.push(m);
      if (SHOTS) {
        const shot = await s("Page.captureScreenshot", { format: "jpeg", quality: 80 });
        writeFileSync(join(OUT, `${route}-${w}x${h}-${MODE}.jpg`), Buffer.from(shot.data, "base64"));
      }
      await send("Target.closeTarget", { targetId });
    }
  }
  writeFileSync(join(OUT, `results-${MODE}.json`), JSON.stringify(results, null, 2));
  let failed = 0;
  for (const r of results) {
    const [vw, vh] = r.viewport.split("x").map(Number);
    const mobileLike = vw < 768 || vh < 500;
    const flags = [];
    if (r.docScrollX) flags.push("DOC-X");
    // Non-mobile layouts must not page-scroll; mobile may scroll vertically.
    if (r.docScrollY && !mobileLike) flags.push("DOC-Y");
    if (r.docScrollY && mobileLike) flags.push("DOC-Y(mobile-ok)");
    if (r.scrollables.length) flags.push(`scroll:${r.scrollables.length}`);
    if (r.clipped.length) flags.push(`clip:${r.clipped.length}`);
    if (r.outside.length) flags.push(`outside:${r.outside.length}`);
    if (r.overlaps.length) flags.push(`overlap:${r.overlaps.length}`);
    const hardFail = flags.some((f) => f === "DOC-X" || f === "DOC-Y");
    if (hardFail) failed += 1;
    console.log(
      `${r.route.padEnd(15)} ${r.viewport.padEnd(10)} doc=${r.doc.sw}x${r.doc.sh} minFont=${r.minFont} ${flags.join(" ") || "OK"}`,
    );
  }
  if (failed > 0) {
    throw new Error(`${failed} viewport/route combo(s) failed document-overflow checks`);
  }
  ws.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => chrome.kill());
