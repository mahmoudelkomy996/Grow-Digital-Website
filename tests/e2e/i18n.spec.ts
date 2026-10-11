import { expect, test } from "@playwright/test";
import { skipPreloader } from "./helpers";
import { SERVICE_SLUGS } from "./routes";

// Multi-language routing, the Arabic (RTL) site, the language switch and hreflang SEO.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(skipPreloader);
});

test.describe("locale routing", () => {
  test("English keeps unprefixed URLs; /en/* redirects to them", async ({ request }) => {
    const res = await request.get("/en/about", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toMatch(/\/about$/);
    expect((await request.get("/about")).status()).toBe(200);
  });

  test("the English-only blog redirects from /ar/blog", async ({ request }) => {
    const res = await request.get("/ar/blog/2030-ksa-vision", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toMatch(/\/blog\/2030-ksa-vision$/);
  });

  test("unknown Arabic URL is a localized 404", async ({ page }) => {
    const res = await page.goto("/ar/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/[؀-ۿ]/);
  });
});

test.describe("Arabic site", () => {
  test("home is Arabic, right-to-left, with localized navigation", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("#story h1")).toHaveText("حان وقت النمو.");
    const footer = page.locator("footer");
    await expect(footer.locator('a[href^="/ar/services/"]')).toHaveCount(4);
    // the English-only blog keeps its English URL
    await expect(footer.locator('a[href="/blog"]')).toHaveCount(1);
  });

  test("desktop header: Arabic pillar dropdowns link inside /ar", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "desktop navigation only");
    await page.goto("/ar/about");
    const trigger = page.getByRole("button", { name: "الاستشارات", exact: true });
    await trigger.click();
    const panel = page.locator("#mega-menu-consultancy");
    await expect(panel).toBeVisible();
    await expect(panel.locator('a[href^="/ar/services/consultancy#"]')).toHaveCount(17);
  });

  test("text column sits on the right, mirrored layout", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "desktop layout only");
    await page.goto("/ar/about");
    const h1 = await page.locator("h1").boundingBox();
    const vw = page.viewportSize()!.width;
    expect(h1!.x + h1!.width).toBeGreaterThan(vw * 0.6);
  });

  for (const slug of SERVICE_SLUGS) {
    test(`/ar/services/${slug} renders in Arabic`, async ({ page }) => {
      const res = await page.goto(`/ar/services/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toContainText(/[؀-ۿ]/);
      await expect(page.locator("#services [data-service]").first()).toBeVisible();
    });
  }

  test("contact form validates in Arabic", async ({ page }) => {
    await page.goto("/ar/contact");
    await page.getByRole("button", { name: "أرسل الرسالة" }).click();
    await expect(page.locator("#name-error")).toHaveText("أدخل اسمك.");
    await expect(page.locator("#name")).toBeFocused();
  });
});

test.describe("language switch", () => {
  test("switches to the same page in the other language", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "the desktop header shows the switch");
    await page.goto("/services/managed-services");
    const toArabic = page.locator('header a[hreflang="ar"]');
    await expect(toArabic).toHaveAttribute("href", "/ar/services/managed-services");
    await toArabic.click();
    await expect(page).toHaveURL(/\/ar\/services\/managed-services$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator('header a[hreflang="en"]')).toHaveAttribute("href", "/services/managed-services");
  });

  test("from the English-only blog, Arabic goes to the Arabic home", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "the desktop header shows the switch");
    await page.goto("/blog");
    await expect(page.locator('header a[hreflang="ar"]')).toHaveAttribute("href", "/ar");
  });

  test("mobile menu has the switch", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-mobile", "mobile menu only");
    await page.goto("/ar/about");
    // the header switch is desktop-only, so the menu button stays fully on screen
    await expect(page.locator('header a[hreflang="en"]')).toBeHidden();
    const toggle = page.getByRole("button", { name: "افتح القائمة" });
    const box = (await toggle.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await toggle.click();
    await expect(page.locator('#mobile-menu a[hreflang="en"]')).toHaveAttribute("href", "/about");
  });
});

test.describe("hreflang SEO", () => {
  test("pages declare every language version and a localized canonical", async ({ page }) => {
    await page.goto("/ar/about");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://growdigital.com/ar/about");
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://growdigital.com/about");
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", "https://growdigital.com/ar/about");
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", "https://growdigital.com/about");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "ar_SA");
  });

  test("sitemap lists Arabic pages with alternates", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>https://growdigital.com/ar/about</loc>");
    expect(sitemap).toContain('hreflang="ar"');
    expect(sitemap).not.toContain("/ar/blog");
  });
});
