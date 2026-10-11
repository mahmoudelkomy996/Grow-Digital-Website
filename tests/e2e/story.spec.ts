import { expect, test, type Page } from "@playwright/test";
import { skipPreloader } from "./helpers";

// Homepage growth story (plan Task 5): 3D canvas, chapter panels, rail and the no-WebGL fallback.

declare global {
  interface Window {
    __sceneReady?: boolean;
  }
}

/** Scroll the window so the story progress is p (0..1). */
async function scrollToProgress(page: Page, p: number) {
  await page.evaluate((p) => {
    const el = document.getElementById("story")!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + p * (el.offsetHeight - window.innerHeight));
  }, p);
}

const panel = (page: Page, id: string) => page.locator(`#story article[data-chapter="${id}"]`);

// The first-visit preloader is covered by loader.spec.ts; here the story is tested directly.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(skipPreloader);
});

// allow a software GL fallback on machines without a usable GPU
test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] } });

test.describe("growth story (WebGL)", () => {
  test("renders the canvas and reports ready", async ({ page }) => {
    await page.goto("/");
    await page.locator("#story").scrollIntoViewIfNeeded();
    await expect(page.locator("#story canvas")).toHaveCount(1, { timeout: 30_000 });
    await page.waitForFunction(() => window.__sceneReady === true, null, { timeout: 30_000 });
    await expect(page.locator("#story canvas")).toHaveAttribute("aria-hidden", "true");
  });

  test("the middle of the story shows the Operate chapter", async ({ page }) => {
    await page.goto("/");
    await expect(panel(page, "intro")).toHaveAttribute("data-active", "true");
    await scrollToProgress(page, 0.5);
    await expect(panel(page, "operate")).toHaveAttribute("data-active", "true", { timeout: 15_000 });
    await expect(panel(page, "operate")).not.toHaveAttribute("inert");
    await expect(panel(page, "operate").getByRole("heading", { level: 2 })).toHaveText("Systems that never sleep.");
    await expect(panel(page, "intro")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByRole("button", { name: "Go to chapter: Operate" })).toHaveAttribute("aria-current", "step");
  });

  test("rail button 05 jumps to the Secure chapter", async ({ page }) => {
    await page.goto("/");
    const rail = page.getByRole("navigation", { name: "Story chapters" });
    await expect(rail.getByRole("button")).toHaveCount(7);
    const secure = rail.getByRole("button", { name: "Go to chapter: Secure" });
    await expect(secure).toContainText("05");
    await secure.click();
    await expect(panel(page, "secure")).toHaveAttribute("data-active", "true", { timeout: 15_000 });
    await expect(secure).toHaveAttribute("aria-current", "step");
    await expect(panel(page, "secure").getByRole("link", { name: /Explore Secure/ })).toHaveAttribute("href", "/services/managed-services");
  });
});

test.describe("growth story without WebGL", () => {
  test("shows the poster fallback and logs no console errors", async ({ playwright, baseURL, viewport }) => {
    // a browser of its own: launch flags cannot be changed per describe group
    const browser = await playwright.chromium.launch({ args: ["--disable-webgl", "--disable-webgl2"] });
    const context = await browser.newContext({ baseURL, viewport });
    await context.addInitScript(skipPreloader);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    const poster = page.locator('[data-testid="story-fallback"] img').first();
    await expect(poster).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.locator("#story canvas")).toHaveCount(0);
    // the text story still works
    await scrollToProgress(page, 0.5);
    await expect(panel(page, "operate")).toHaveAttribute("data-active", "true", { timeout: 15_000 });
    expect(errors).toEqual([]);
    await browser.close();
  });
});

test("the home page has exactly one h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("#story h1")).toHaveText("It's time to grow.");
});
