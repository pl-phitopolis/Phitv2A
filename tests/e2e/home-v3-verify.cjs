/**
 * Home V3 act-transition verification, over raw CDP against real Chrome.
 *
 * Why not the Browser pane / a hidden headless page: this repo's home page is
 * driven by Lenis, which is ticked by `gsap.ticker` off requestAnimationFrame.
 * A hidden or backgrounded page throttles rAF to a stop, so Lenis never
 * advances and every scroll-driven assertion reports a false failure. Same
 * reason `window.scrollTo` is never used here: Lenis ignores programmatic
 * scroll outright. Scroll is driven with real wheel events through
 * `Input.dispatchMouseEvent`, which is the CDP equivalent of `page.mouse.wheel`.
 *
 * Usage:  node tests/e2e/home-v3-verify.cjs [--reduced]
 * Requires a production build in dist/ (yarn build).
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 4187;
const CDP_PORT = 9452;
const DIST = path.resolve(__dirname, "../../dist");
const REDUCED = process.argv.includes("--reduced");

const MIME = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webm": "video/webm", ".ico": "image/x-icon" };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = (req.url || "/").split("?")[0];
      let file = path.join(DIST, url === "/" ? "index.html" : url);
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");
      try {
        res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
        res.end(fs.readFileSync(file));
      } catch { res.writeHead(404); res.end("nf"); }
    });
    srv.listen(PORT, "127.0.0.1", () => resolve(srv));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(url) {
  const res = await fetch(url);
  return res.json();
}

class Cdp {
  constructor(wsUrl) {
    this.id = 0; this.pending = new Map(); this.ready = false;
    this.ws = new WebSocket(wsUrl);
    this.opened = new Promise((res) => { this.ws.onopen = () => { this.ready = true; res(); }; });
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      const p = this.pending.get(msg.id);
      if (p) { this.pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); }
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const r = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    return r.result && "value" in r.result ? r.result.value : undefined;
  }
}

/** Instrumentation installed BEFORE any app script runs. */
const PROBE = `
window.__hv3 = { shots: [], names: [], errors: [], skipped: 0 };
(function () {
  const native = document.startViewTransition && document.startViewTransition.bind(document);
  window.__hv3.hasVtApi = typeof native === "function";
  if (!native) return;
  document.startViewTransition = function (cb) {
    const shot = document.documentElement.dataset.hv3Shot || "(none)";
    const before = [...document.querySelectorAll("[data-hv3-vt]")]
      .filter((el) => el.style.viewTransitionName).map((el) => el.dataset.hv3Vt);
    const vt = native(function () {
      cb();
      const after = [...document.querySelectorAll("[data-hv3-vt]")]
        .filter((el) => el.style.viewTransitionName).map((el) => el.dataset.hv3Vt);
      window.__hv3.names.push({ shot, before, after });
    });
    const entry = { shot, at: Date.now(), finished: false };
    window.__hv3.shots.push(entry);
    const originalSkip = vt.skipTransition && vt.skipTransition.bind(vt);
    if (originalSkip) vt.skipTransition = function () { window.__hv3.skipped++; return originalSkip(); };
    vt.finished.then(() => { entry.finished = true; }).catch(() => { entry.aborted = true; });
    return vt;
  };
})();
// NOTE: this script is injected at document-start, which is BEFORE <html> is
// parsed, so document.documentElement can still be null here. An unguarded
// observe(null) throws and silently kills the rest of this probe (which is how
// a previous run reported an empty log while the app was demonstrably setting
// the attribute). Defer until there is a root element to watch.
window.__hv3.attrLog = [];
(function watchAttrs() {
  const root = document.documentElement;
  if (!root) { requestAnimationFrame(watchAttrs); return; }
  new MutationObserver(() => {
    window.__hv3.attrLog.push({
      shot: root.dataset.hv3Shot || null,
      route: root.dataset.routeTransition || null,
    });
  }).observe(root, { attributes: true, attributeFilter: ["data-hv3-shot", "data-route-transition"] });
})();
window.addEventListener("error", (e) => { window.__hv3.errors.push(String(e.message)); });
`;

async function wheel(cdp, times, deltaY, gapMs) {
  for (let i = 0; i < times; i += 1) {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseWheel", x: 700, y: 450, deltaX: 0, deltaY, pointerType: "mouse",
    });
    await sleep(gapMs);
  }
}

(async () => {
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    console.error("No dist/index.html. Run `yarn build` first.");
    process.exit(2);
  }
  const srv = await serve();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "hv3-"));
  const args = [
    `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
    "--headless=new", "--no-first-run", "--no-default-browser-check",
    "--window-size=1440,900", "--hide-scrollbars", "--mute-audio",
    "--autoplay-policy=no-user-gesture-required",
  ];
  if (REDUCED) args.push("--force-prefers-reduced-motion");
  const chrome = spawn(CHROME, args, { stdio: "ignore" });

  let targets;
  for (let i = 0; i < 60; i += 1) {
    try { targets = await json(`http://127.0.0.1:${CDP_PORT}/json/list`); break; }
    catch { await sleep(250); }
  }
  const page = targets.find((t) => t.type === "page");
  const cdp = new Cdp(page.webSocketDebuggerUrl);
  await cdp.opened;

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: PROBE });
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });

  // Wait for the app to mount its acts.
  let mounted = false;
  for (let i = 0; i < 80; i += 1) {
    mounted = await cdp.evaluate(`!!document.querySelector('[data-hv3-act-panel]')`);
    if (mounted) break;
    await sleep(250);
  }

  const env = await cdp.evaluate(`JSON.stringify({
    hasVtApi: window.__hv3.hasVtApi,
    motion: document.documentElement.dataset.hv3Motion || null,
    act: document.documentElement.dataset.hv3Act || null,
    panels: document.querySelectorAll('[data-hv3-act-panel]').length,
    boundaries: document.querySelectorAll('[data-hv3-boundary]').length,
    h1s: document.querySelectorAll('h1').length,
    h1: (document.querySelector('h1')||{}).textContent,
    docHeight: document.documentElement.scrollHeight,
    describedImages: [...document.images].filter(i => i.alt && i.alt.trim() !== '').map(i => i.alt),
  })`);

  console.log(`\n=== HOME V3 ${REDUCED ? "(reduced motion)" : "(full motion)"} ===`);
  console.log(env);

  // Paced scroll: bursts with pauses, so a gate is not immediately escaped by
  // the reader's own continuing gesture. This is the "reader pauses to read"
  // case; the continuous-fling case is measured separately below.
  const trail = [];
  for (let burst = 0; burst < 26; burst += 1) {
    await wheel(cdp, 6, 220, 30);
    await sleep(700);
    const s = await cdp.evaluate(
      `document.documentElement.dataset.hv3Act + "/" + (document.documentElement.dataset.hv3AskStage||"-") + "@" + Math.round(window.scrollY)`,
    );
    trail.push(s);
  }

  // VT-5: click the closing CTA and confirm the route morph actually runs.
  //
  // NOTE: do NOT use el.scrollIntoView() to bring the CTA into view. Lenis
  // ignores programmatic scroll, so the page springs back to where Lenis
  // thinks it is, the rect read a moment earlier goes stale, and the click
  // lands on whatever now occupies those coordinates. That happened here: the
  // click hit the masthead Contact link instead, which also calls
  // navigateWithCurtain, so the run reported a successful navigation with no
  // ask-pill shot and looked like a product bug. Wheel it into view instead,
  // and re-read the rect immediately before clicking.
  let ctaReport = "CTA not found";
  const media = await cdp.evaluate(`JSON.stringify({
    reduce: matchMedia("(prefers-reduced-motion: reduce)").matches, width: innerWidth,
  })`);
  console.log("   media:", media);

  let rect = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const raw = await cdp.evaluate(`(() => {
      const el = document.querySelector('[data-hv3-vt="ask-pill"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return null;
      return JSON.stringify({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });
    })()`);
    if (raw) {
      const r = JSON.parse(raw);
      if (r.y > 140 && r.y < 760) { rect = r; break; }
      await wheel(cdp, 2, r.y >= 760 ? 200 : -200, 40);
    } else {
      await wheel(cdp, 2, 200, 40);
    }
    await sleep(180);
  }

  if (rect) {
    // Confirm the point really is the CTA before trusting the click.
    const hit = await cdp.evaluate(`(() => {
      const el = document.elementFromPoint(${String(rect.x)}, ${String(rect.y)});
      return el ? (el.closest('[data-hv3-vt="ask-pill"]') ? "cta" : el.tagName + "." + el.className) : "none";
    })()`);
    console.log("   hit test at CTA centre:", hit);

    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
    for (const type of ["mousePressed", "mouseReleased"]) {
      await cdp.send("Input.dispatchMouseEvent", { type, x: rect.x, y: rect.y, button: "left", clickCount: 1 });
    }
    await sleep(1800);
    ctaReport = await cdp.evaluate(`JSON.stringify({
      url: location.pathname,
      askPillShots: window.__hv3.shots.filter(s => s.shot === "ask-pill").length,
      askPillCompleted: window.__hv3.shots.filter(s => s.shot === "ask-pill" && s.finished).length,
      staleShotAttr: document.documentElement.dataset.hv3Shot || null,
      namedOnContact: [...document.querySelectorAll('[data-hv3-vt="ask-pill"]')].length,
      sawAskPillAttr: window.__hv3.attrLog.some(e => e.shot === "ask-pill"),
    })`);
  }
  console.log("\n-- VT-5 CTA click --");
  console.log(ctaReport);

  const result = await cdp.evaluate(`JSON.stringify(window.__hv3)`);
  const consoleErrors = await cdp.evaluate(`JSON.stringify(window.__hv3.errors)`);

  console.log("\n-- act trail --");
  console.log([...new Set(trail)].join("  ->  "));
  console.log("\n-- probe --");
  console.log(result);
  console.log("\n-- page errors --");
  console.log(consoleErrors);

  chrome.kill();
  srv.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
