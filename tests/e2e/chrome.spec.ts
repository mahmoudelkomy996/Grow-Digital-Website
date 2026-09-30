import { expect, test } from "@playwright/test";

// Site chrome: header, skip link, mega menu, mobile menu and footer.
// /design-system is used because it only depends on the UI foundation.
const PAGE = "/design-system";

test.describe("site chrome", () => {
  test("header is visible and transparent at the top, solid after scrolling", async ({ page }) => {
    await page.goto(PAGE);
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: "Grow Digital home" })).toBeVisible();

    const bg = () => header.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await bg()).toBe("rgba(0, 0, 0, 0)");
    await page.mouse.wheel(0, 600);
    await expect.poll(bg).toBe("rgb(246, 245, 240)");
  });

  test("skip link moves focus to #main", async ({ page }) => {
    await page.goto(PAGE);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("footer has contact details and the copyright line", async ({ page }) => {
    await page.goto(PAGE);
    const footer = page.getByRole("contentinfo");
    await expect(footer.locator('a[href="mailto:info@growdigital.com"]')).toHaveCount(1);
    await expect(footer.locator('a[href^="tel:"]')).toHaveCount(1);
    await expect(footer.getByText("It's time to grow.")).toBeVisible();
    await expect(footer.getByText("© 2026 Grow Digital. All rights reserved.")).toBeVisible();
    await expect(footer.locator('a[href^="/pillars/"]')).toHaveCount(7);
  });
});

test.describe("mega menu (desktop)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "desktop navigation only");
  });

  test("opens with Enter, lists 7 pillars, closes on Esc and returns focus", async ({ page }) => {
    await page.goto(PAGE);
    const trigger = page.getByRole("button", { name: "Pillars" });
    const panel = page.locator("#mega-menu");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-controls", "mega-menu");
    await expect(panel).toBeHidden();

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    await expect(panel.locator("[data-pillar]")).toHaveCount(7);
    await expect(panel.getByRole("list", { name: "Pillars" }).getByRole("link")).toHaveCount(7);
    await expect(panel.getByRole("link", { name: "See how the pillars connect" })).toHaveAttribute("href", "/#story");

    // The header turns solid while the menu is open, even at the top of the page.
    await expect
      .poll(() => page.getByRole("banner").evaluate((el) => getComputedStyle(el).backgroundColor))
      .toBe("rgb(246, 245, 240)");

    // Tab moves into the panel.
    await page.keyboard.press("Tab");
    await expect(panel.locator("a").first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("opens with Space and closes on outside click", async ({ page }) => {
    await page.goto(PAGE);
    const trigger = page.getByRole("button", { name: "Pillars" });
    await trigger.focus();
    await page.keyboard.press("Space");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.mouse.click(700, 700);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mega-menu")).toBeHidden();
  });

  test("closes on route change", async ({ page }) => {
    await page.goto(PAGE);
    await page.getByRole("button", { name: "Pillars" }).click();
    const panel = page.locator("#mega-menu");
    await expect(panel).toBeVisible();
    const href = await panel.getByRole("list", { name: "Pillars" }).getByRole("link").first().getAttribute("href");
    expect(href).toBe("/pillars/consult");
    // history.pushState is integrated with the App Router, so usePathname() changes without a reload.
    await page.evaluate(() => window.history.pushState(null, "", "/design-system/route-change"));
    await expect(page.getByRole("button", { name: "Pillars" })).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
  });
});

test.describe("mobile menu", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-mobile", "mobile navigation only");
  });

  test("opens full-screen, locks scroll, closes with the toggle and Esc", async ({ page }) => {
    await page.goto(PAGE);
    const toggle = page.getByRole("button", { name: "Open menu" });
    const menu = page.locator("#mobile-menu");
    await expect(page.getByRole("button", { name: "Pillars" })).toBeHidden();
    await expect(menu).toBeHidden();

    await toggle.click();
    const close = page.getByRole("button", { name: "Close menu" });
    await expect(close).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();
    await expect(menu.locator('a[href^="/pillars/"]')).toHaveCount(8); // 7 pillars + Solutions
    await expect(menu.getByRole("link", { name: "Talk to us" })).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");

    await close.click();
    await expect(menu).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });
});
