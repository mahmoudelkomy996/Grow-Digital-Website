import { expect, test } from "@playwright/test";
import { skipPreloader } from "./helpers";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] } });

test.describe("homepage preloader", () => {
  test("covers the first visit, then lifts, unlocks the page and is not shown again", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-preloader", "on");
    const loader = page.locator("#preloader");
    await expect(loader).toBeVisible();
    await expect(loader).toHaveAttribute("role", "status");

    // At most MAX_MS (6.5s) plus the exit animation; allow headroom for slow CI.
    await expect(loader).toBeHidden({ timeout: 15_000 });
    await expect(page.locator("html")).toHaveAttribute("data-preloader", "off");
    expect(await page.evaluate(() => sessionStorage.getItem("gd:preloaded"))).toBe("1");
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    expect(await page.evaluate(() => document.getElementById("main")?.inert)).toBe(false);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-preloader", "off");
    await expect(page.locator("#preloader")).toBeHidden();
  });

  test("does not show on other pages", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-preloader", "off");
    await expect(page.locator("#preloader")).toHaveCount(0);
  });

  test("is hidden without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#preloader")).toBeHidden();
    await expect(page.locator("h1")).toBeVisible();
    await context.close();
  });
});

test.describe("route progress bar", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(skipPreloader);
  });

  test("runs on internal navigation and completes when the page arrives", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "networkidle" });
    const bar = page.locator("[data-route-progress]");
    await expect(bar).toHaveAttribute("data-state", "idle");

    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("[data-route-progress]")!;
      (window as unknown as { __states: string[] }).__states = [];
      new MutationObserver(() => (window as unknown as { __states: string[] }).__states.push(el.dataset.state!)).observe(el, {
        attributes: true,
        attributeFilter: ["data-state"],
      });
    });
    await page.locator('#site-footer a[href="/about"]').click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(bar).toHaveAttribute("data-state", "idle");
    const states = await page.evaluate(() => (window as unknown as { __states: string[] }).__states);
    expect(states).toEqual(["loading", "idle"]);
  });

  test("ignores links to the current page", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    await page.locator('#site-footer a[href="/about"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-route-progress]")).toHaveAttribute("data-state", "idle");
  });
});
