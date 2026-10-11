import { expect, test } from "@playwright/test";

const POST = "the-critical-importance-of-cybersecurity-for-modern-organizations";

test.describe("blog listing", () => {
  test("first page: featured post, 12 cards, pagination, category nav", async ({ page }) => {
    const res = await page.goto("/blog");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main article")).toHaveCount(12);
    await expect(page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "Page 2" })).toHaveAttribute("href", "/blog/page/2");
    await expect(page.getByRole("navigation", { name: "Blog categories" }).getByRole("link")).toHaveCount(5);
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute("href", /\/blog\/rss\.xml$/);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((t) => JSON.parse(t)["@type"] === "Blog")).toBe(true);
  });

  test("pagination and category pages", async ({ page }) => {
    expect((await page.goto("/blog/page/2"))?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/blog\/page\/2$/);
    expect((await page.goto("/blog/page/99"))?.status()).toBe(404);
    expect((await page.goto("/blog/category/managed-services"))?.status()).toBe(200);
    for (const eyebrow of await page.locator("main article .eyebrow").allTextContents()) expect(eyebrow).toContain("Managed Services");
    expect((await page.goto("/blog/category/unknown"))?.status()).toBe(404);
  });
});

test.describe("blog post", () => {
  test("article content, structured data and metadata", async ({ page }) => {
    const res = await page.goto(`/blog/${POST}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Cybersecurity");
    await expect(page.locator(".prose-gd h2").first()).toBeVisible();
    await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link").first()).toHaveAttribute("href", /^#/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://growdigital.com/blog/${POST}`);
    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)["@type"]);
    expect(types).toEqual(expect.arrayContaining(["BlogPosting", "BreadcrumbList"]));
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description!.length).toBeLessThanOrEqual(160);
  });

  test("unknown post is a 404", async ({ page }) => {
    expect((await page.goto("/blog/does-not-exist"))?.status()).toBe(404);
  });
});

test.describe("seo plumbing", () => {
  test("legacy WordPress URLs redirect permanently", async ({ request }) => {
    for (const [from, to] of [
      ["/ecommerce-benefits", "/blog/ecommerce-benefits"],
      ["/contact-us", "/contact"],
      ["/cybersecurity-unit", "/services/managed-services"],
      ["/gemini-is-powering-the-future-of-ai-2", "/blog/gemini-is-powering-the-future-of-ai"],
      ["/category/ecommerce", "/blog"],
      ["/feed", "/blog/rss.xml"],
    ]) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect([301, 308], from).toContain(res.status());
      expect(res.headers()["location"], from).toMatch(new RegExp(`${to.replace(/[/.]/g, "\\$&")}/?$`));
    }
  });

  test("rss, llms.txt, manifest and sitemap", async ({ request }) => {
    const rss = await request.get("/blog/rss.xml");
    expect(rss.headers()["content-type"]).toContain("application/rss+xml");
    expect((await rss.text()).match(/<item>/g)?.length).toBeGreaterThanOrEqual(40);
    const llms = await (await request.get("/llms.txt")).text();
    expect(llms).toContain("# Grow Digital");
    expect(llms).toContain("/services/consultancy");
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.short_name).toBe("Grow Digital");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`/blog/${POST}`);
    expect(sitemap).toContain("/blog/category/digital-marketing");
    expect(sitemap).toContain("/services/consultancy");
    expect(sitemap).not.toContain("/pillars/");
  });

  test("security headers", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });
});
