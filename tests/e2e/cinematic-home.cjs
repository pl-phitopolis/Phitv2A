const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("fs");
const out = path.resolve("docs/cinematic-home/verification");
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const results = {
    viewports: [],
    errors: [],
    failedRequests: [],
    scenes: [],
    checks: [],
  };
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    recordVideo: { dir: out, size: { width: 1440, height: 1000 } },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => results.errors.push(e.message));
  page.on("requestfailed", (r) => {
    if (!r.url().includes("api/") && !r.url().includes("vercel"))
      results.failedRequests.push({
        url: r.url(),
        error: r.failure()?.errorText,
      });
  });
  await page.addInitScript(() => {
    window.__metrics = { cls: 0, lcp: 0 };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        if (!e.hadRecentInput) window.__metrics.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => {
      window.__metrics.lcp = l.getEntries().at(-1)?.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto("http://127.0.0.1:4173");
  await page.waitForFunction(
    () => document.querySelectorAll(".ch .pin-spacer").length === 3,
  );
  await page.waitForTimeout(750);
  await page.screenshot({ path: out + "/desktop-opening.png" });
  results.metrics = await page.evaluate(() => ({
    ...window.__metrics,
    mainCount: document.querySelectorAll("main").length,
    height: document.body.scrollHeight,
    resources: performance
      .getEntriesByType("resource")
      .filter((r) => r.name.endsWith(".js"))
      .map((r) => ({ url: r.name.split("/").pop(), size: r.transferSize })),
  }));
  for (let i = 0; i < 54; i++) {
    await page.mouse.wheel(0, 190);
    await page.waitForTimeout(140);
    if ([17, 21, 25, 29, 36, 43].includes(i)) {
      await page.waitForTimeout(400);
      await page.screenshot({ path: out + `/motion-${i}.png` });
      results.scenes.push(
        await page.evaluate(() => ({
          scroll: scrollY,
          articles: [...document.querySelectorAll(".ch-application")].map(
            (a) => ({
              top: a.getBoundingClientRect().top,
              bottom: a.getBoundingClientRect().bottom,
            }),
          ),
          pins: document.querySelectorAll(".pin-spacer").length,
        })),
      );
    }
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: out + "/closing.png" });
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, -1600);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(800);
  await page
    .getByRole("button", { name: "Pause motion", exact: true })
    .first()
    .click();
  await page.waitForTimeout(300);
  results.checks.push({
    pauseRemovesPins: (await page.locator(".pin-spacer").count()) === 0,
  });
  results.checks.push(
    await page.evaluate(() => ({
      staticApplicationFlow:
        document.querySelector(".ch-app-stage").getBoundingClientRect()
          .height >=
        document.querySelector(".ch-app-track").getBoundingClientRect().height,
      deliveryAfterApplications:
        document.querySelector("#delivery").getBoundingClientRect().top >=
        document.querySelector(".ch-app-track").getBoundingClientRect().bottom -
          1,
    })),
  );

  await page.screenshot({
    path: out + "/desktop-full-page.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Resume motion", exact: true })
    .first()
    .click();
  await page.waitForTimeout(350);
  results.checks.push({
    resumeRestoresThreePins: (await page.locator(".pin-spacer").count()) === 3,
  });
  await page
    .getByRole("navigation", { name: "Primary navigation", exact: true })
    .getByRole("link", { name: "About", exact: true })
    .click();
  await page.waitForURL("**/about");
  await page.waitForTimeout(1400);
  results.checks.push({
    aboutNavigation: true,
    homePinsAfterLeaving: await page.locator(".ch .pin-spacer").count(),
    focus: await page.evaluate(() => document.activeElement?.id),
  });
  await page.goBack();
  await page.waitForTimeout(1800);
  results.checks.push({
    returnHomePinCount: await page.locator(".ch .pin-spacer").count(),
  });
  await page.mouse.wheel(0, 4200);
  await page.waitForTimeout(750);
  await page.setViewportSize({ width: 768, height: 844 });
  await page.waitForTimeout(500);
  results.checks.push(
    await page.evaluate(() => ({
      resizeRemovesPins:
        document.querySelectorAll(".ch .pin-spacer").length === 0,
      resizeRestoresFlow:
        document.querySelector(".ch-app-stage").getBoundingClientRect()
          .height >=
        document.querySelector(".ch-app-track").getBoundingClientRect().height,
    })),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(500);
  results.checks.push({
    resizeRestoresPins: (await page.locator(".ch .pin-spacer").count()) === 3,
  });
  await page.goto("http://127.0.0.1:4173");
  await page.waitForTimeout(1500);
  await page
    .getByRole("link", { name: "Explore the work", exact: false })
    .click();
  await page.waitForTimeout(500);
  results.checks.push(
    await page.evaluate(() => ({
      anchorTop: document.querySelector("#capabilities").getBoundingClientRect()
        .top,
      anchorHash: location.hash,
    })),
  );
  const walkthrough = page.video();
  await context.close();
  await walkthrough.saveAs(out + "/walkthrough.webm");
  await walkthrough.delete();
  for (const width of [320, 390, 768, 1440, 1920]) {
    const p = await browser.newPage({
      viewport: { width, height: width < 900 ? 844 : 1000 },
      reducedMotion: "reduce",
    });
    await p.goto("http://127.0.0.1:4173");
    await p.waitForTimeout(1000);
    await p.screenshot({ path: out + `/static-${width}.png`, fullPage: true });
    results.viewports.push(
      await p.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        pins: document.querySelectorAll(".pin-spacer").length,
        headings: [...document.querySelectorAll(".ch h2")].map(
          (h) => h.textContent,
        ),
        broken: [...document.querySelectorAll(".ch img")]
          .filter((i) => i.complete && !i.naturalWidth)
          .map((i) => i.currentSrc),
      })),
    );
    if (width === 390) {
      await p.getByRole("button", { name: "Menu +" }).click();
      await p.screenshot({ path: out + "/mobile-menu.png" });
      await p.keyboard.press("Escape");
      results.checks.push({
        escapeReturnsFocus: await p
          .getByRole("button", { name: "Menu +" })
          .evaluate((e) => e === document.activeElement),
      });
    }
    await p.close();
  }
  const delayed = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await delayed.route("**/*.woff2", async (route) => {
    await new Promise((r) => setTimeout(r, 1200));
    await route.continue();
  });
  await delayed.goto("http://127.0.0.1:4173");
  await delayed.waitForFunction(
    () => document.querySelectorAll(".ch .pin-spacer").length === 3,
    {},
    { timeout: 15000 },
  );
  results.checks.push({
    delayedFontPinCount: await delayed.locator(".pin-spacer").count(),
    delayedFontOverflow: await delayed.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
  await delayed.close();
  const failure = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await failure.route("**/images/cinematic/**", (r) => r.abort());
  await failure.route("**/videos/**", (r) => r.abort());
  await failure.goto("http://127.0.0.1:4173");
  await failure.waitForTimeout(1000);
  await failure.screenshot({ path: out + "/media-fallback.png" });
  results.checks.push({
    fallbackVisible: (await failure.locator("[data-media-failed]").count()) > 0,
    headingSurvives: await failure.locator("h1").isVisible(),
  });
  await failure.close();
  fs.writeFileSync(out + "/results.json", JSON.stringify(results, null, 2));
  assert.equal(results.errors.length, 0, "No runtime exceptions");
  for (const viewport of results.viewports) {
    assert.equal(
      viewport.width,
      viewport.scrollWidth,
      "No horizontal overflow",
    );
    assert.equal(viewport.pins, 0, "Reduced motion stays unpinned");
    assert.equal(viewport.broken.length, 0, "No broken artwork");
  }
  for (const check of results.checks)
    for (const [key, value] of Object.entries(check)) {
      if (typeof value === "boolean" && key !== "delayedFontOverflow")
        assert.equal(value, true, key);
    }
  assert.equal(
    results.checks.find((c) => "delayedFontPinCount" in c).delayedFontPinCount,
    3,
  );
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
