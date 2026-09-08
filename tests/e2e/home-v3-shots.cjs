/**
 * Capture home V3 down the page as PNGs, for looking at.
 *
 * Scroll is wheel-driven through CDP because Lenis ignores programmatic scroll
 * (`window.scrollTo` / `scrollIntoView` spring back and every subsequent
 * measurement is against a stale layout).
 *
 * Usage:  STEPS=9 W=1440 H=900 SHOT_DIR=/tmp/hv3 node tests/e2e/home-v3-shots.cjs
 * Requires a production build in dist/.
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 4191;
const CDP_PORT = 9456;
const DIST = path.resolve(__dirname, "../../dist");
const OUT = process.env.SHOT_DIR || "/tmp/hv3-shots";

const MIME = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webm": "video/webm", ".ico": "image/x-icon",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = (req.url || "/").split("?")[0];
      let file = path.join(DIST, url === "/" ? "index.html" : url);
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");
      try {
        res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
        res.end(fs.readFileSync(file));
      } catch {
        res.writeHead(404); res.end();
      }
    });
    srv.listen(PORT, "127.0.0.1", () => resolve(srv));
  });
}

class Cdp {
  constructor(wsUrl) {
    this.id = 0; this.pending = new Map();
    this.ws = new WebSocket(wsUrl);
    this.opened = new Promise((r) => { this.ws.onopen = () => r(); });
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
  async ev(expression) {
    const r = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    return r.result && "value" in r.result ? r.result.value : undefined;
  }
}

(async () => {
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    console.error("No dist/index.html. Run `yarn build` first."); process.exit(2);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "hv3s-"));
  const width = Number(process.env.W || 1440);
  const height = Number(process.env.H || 900);

  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
    "--headless=new", "--no-first-run", "--hide-scrollbars", "--mute-audio",
    "--autoplay-policy=no-user-gesture-required", `--window-size=${width},${height}`,
  ], { stdio: "ignore" });

  let list;
  for (let i = 0; i < 60; i += 1) {
    try { list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json(); break; }
    catch { await sleep(250); }
  }
  const cdp = new Cdp(list.find((t) => t.type === "page").webSocketDebuggerUrl);
  await cdp.opened;
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });

  for (let i = 0; i < 80; i += 1) {
    if (await cdp.ev(`!!document.querySelector('[data-hv3-act-panel]')`)) break;
    await sleep(250);
  }
  await sleep(1400);

  const total = await cdp.ev(`document.documentElement.scrollHeight`);
  const steps = Number(process.env.STEPS || 10);
  const perStep = Math.ceil(total / steps / 7);

  for (let i = 0; i < steps; i += 1) {
    const y = await cdp.ev(`Math.round(window.scrollY)`);
    const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(OUT, `${String(i).padStart(2, "0")}-y${y}.png`), Buffer.from(shot.data, "base64"));
    for (let k = 0; k < 7; k += 1) {
      await cdp.send("Input.dispatchMouseEvent", {
        type: "mouseWheel", x: width / 2, y: height / 2, deltaX: 0, deltaY: perStep, pointerType: "mouse",
      });
      await sleep(35);
    }
    await sleep(900);
  }

  console.log(`wrote ${String(steps)} shots to ${OUT} (docHeight ${String(total)})`);
  chrome.kill(); srv.close(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
