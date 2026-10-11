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
    await expect(footer.locator('a[href^="/services/"]')).toHaveCount(4);
  });
});

test.describe("service dropdowns (desktop)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "desktop navigation only");
  });

  test("each pillar has its own header link and dropdown", async ({ page }) => {
    await page.goto(PAGE);
    for (const name of ["Consultancy", "Managed Services", "Software", "Digital Marketing", "Company"]) {
      await expect(page.getByRole("navigation", { name: "Main" }).getByRole("button", { name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Insights" })).toHaveAttribute("href", "/blog");
  });

  test("opens with Enter, Tab enters the panel, Esc closes and returns focus", async ({ page }) => {
    await page.goto(PAGE);
    const trigger = page.getByRole("button", { name: "Consultancy", exact: true });
    const panel = page.locator("#mega-menu-consultancy");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-controls", "mega-menu-consultancy");
    await expect(panel).toBeHidden();

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    // 4 practices, 17 services
    await expect(panel.locator('a[href^="/services/consultancy#"]')).toHaveCount(17);
    await expect(panel.getByRole("link", { name: /Explore consultancy/ })).toHaveAttribute("href", "/services/consultancy");

    await expect
      .poll(() => page.getByRole("banner").evaluate((el) => getComputedStyle(el).backgroundColor))
      .toBe("rgb(246, 245, 240)");

    await page.keyboard.press("Tab");
    await expect(panel.locator("a").first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("hovering another link switches menus; outside click closes", async ({ page }) => {
    await page.goto(PAGE);
    await page.getByRole("button", { name: "Software", exact: true }).hover();
    await expect(page.locator("#mega-menu-software-development")).toBeVisible();
    await expect(page.locator("#mega-menu-software-development").getByText("Patient Mobile App")).toBeVisible();
    await page.getByRole("button", { name: "Digital Marketing", exact: true }).hover();
    await expect(page.locator("#mega-menu-software-development")).toBeHidden();
    await expect(page.locator("#mega-menu-digital-marketing")).toBeVisible();
    await page.mouse.click(700, 850);
    await expect(page.locator("#mega-menu-digital-marketing")).toBeHidden();
  });

  test("closes on route change", async ({ page }) => {
    await page.goto(PAGE);
    await page.getByRole("button", { name: "Managed Services", exact: true }).click();
    const panel = page.locator("#mega-menu-managed-services");
    await expect(panel).toBeVisible();
    await page.evaluate(() => window.history.pushState(null, "", "/design-system/route-change"));
    await expect(page.getByRole("button", { name: "Managed Services", exact: true })).toHaveAttribute("aria-expanded", "false");
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
    await expect(page.getByRole("button", { name: "Consultancy", exact: true })).toBeHidden();
    await expect(menu).toBeHidden();

    await toggle.click();
    const close = page.getByRole("button", { name: "Close menu" });
    await expect(close).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("button", { name: /Consultancy/ })).toBeVisible();
    await menu.getByRole("button", { name: /Consultancy/ }).click();
    await expect(menu.locator('a[href^="/services/consultancy"]').first()).toBeVisible();
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
