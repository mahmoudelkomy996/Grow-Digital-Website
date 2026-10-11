import { expect, test } from "@playwright/test";
import { SERVICE_SLUGS } from "./routes";

test.describe("home", () => {
  test("sections, pillar links and organization JSON-LD", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    for (const id of ["integrator-title", "pillars-title", "use-cases-title", "solutions-title", "industries-title", "partners-title", "values-title"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    const pillarLinks = page.locator("#pillars a[href^='/services/']");
    await expect(pillarLinks).toHaveCount(4);
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(JSON.parse(ld ?? "{}")["@type"]).toBe("Organization");
  });
});

test.describe("service pillars", () => {
  const counts: Record<string, number> = { consultancy: 17, "managed-services": 10, "software-development": 4, "digital-marketing": 8 };
  for (const slug of SERVICE_SLUGS) {
    test(`/services/${slug} renders hero, every service in the index and in detail`, async ({ page }) => {
      const res = await page.goto(`/services/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("#services [data-service]")).toHaveCount(counts[slug]);
      await expect(page.locator("main article[id]")).toHaveCount(counts[slug]);
      await expect(page.getByRole("navigation", { name: "Service pillars" })).toBeVisible();
      await expect(page).toHaveTitle(/· Grow Digital$/);
    });
  }

  test("pillar-specific sections", async ({ page }) => {
    await page.goto("/services/managed-services");
    await expect(page.locator("#models")).toContainText("Co-managed Services");
    await page.goto("/services/software-development");
    await expect(page.locator("#products")).toContainText("Athar");
    await page.goto("/services/digital-marketing");
    await expect(page.locator("#packages")).toContainText("Premium");
  });

  test("unknown service is a 404 with the custom page", async ({ page }) => {
    const res = await page.goto("/services/unknown");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("grown");
  });

  test("old 7-pillar URLs redirect permanently", async ({ request }) => {
    for (const [from, to] of [
      ["/pillars/consult", "/services/consultancy"],
      ["/pillars/secure", "/services/managed-services"],
      ["/pillars/grow", "/services/digital-marketing"],
    ]) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect([301, 308]).toContain(res.status());
      expect(res.headers()["location"]).toMatch(new RegExp(`${to}$`));
    }
  });
});

test.describe("about", () => {
  test("values and lifecycle", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toContainText("team");
    await expect(page.getByRole("list", { name: "The Grow Digital journey" }).getByRole("link")).toHaveCount(4);
  });
});

test.describe("use cases", () => {
  test("filters by category and industry, kept in the URL", async ({ page }) => {
    await page.goto("/use-cases");
    const cards = page.locator("[data-use-case]");
    await expect(cards).toHaveCount(12);

    await page.getByRole("button", { name: "IoT", exact: true }).click();
    await expect(page).toHaveURL(/category=iot/);
    await expect(cards).toHaveCount(4);

    await page.goto("/use-cases?category=ai&industry=healthcare");
    await expect(page.getByRole("button", { name: "AI", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(await cards.count()).toBeGreaterThan(0);
    for (const card of await cards.all()) await expect(card).toContainText(/healthcare/i);
  });

  test("a card expands its full project", async ({ page }) => {
    await page.goto("/use-cases");
    const toggle = page.locator("[data-use-case]").first().getByRole("button", { name: /full project/i });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

test.describe("partners", () => {
  test("sections and logos", async ({ page }) => {
    await page.goto("/partners");
    for (const id of ["solution-title", "tech-title", "clients-title", "projects-title", "references-title"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    const marks = page.locator("main [role='img'], main img[alt]:not([alt=''])");
    expect(await marks.count()).toBeGreaterThanOrEqual(30);
  });
});

test.describe("contact", () => {
  test("empty submit shows field errors and focuses name", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    for (const id of ["name-error", "company-error", "email-error", "message-error", "consent-error"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await expect(page.locator("#name")).toBeFocused();
    await expect(page.locator("#name")).toHaveAttribute("aria-invalid", "true");
  });

  // Development (or a configured RESEND_API_KEY) shows the success state; an unconfigured production
  // build shows the friendly mailto fallback instead. Both are correct outcomes of a valid submission.
  test("valid submit shows success, or the mailto fallback when email is not configured", async ({ page }) => {
    await page.goto("/contact");
    await page.fill("#name", "Test Person");
    await page.fill("#company", "Test Co");
    await page.fill("#email", "test@example.com");
    await page.fill("#message", "We would like to talk about a data platform.");
    await page.check("input[name='consent']");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("main").getByRole("status").or(page.locator("#form-status")).first()).toContainText(/Thank you|info@growdigital.com/);
    await expect(page.locator("[aria-invalid=true]")).toHaveCount(0);
  });

  test("honeypot is not focusable", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("#website")).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("seo", () => {
  test("sitemap, robots and OG image", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    // The 12 core pages must be listed (blog posts and categories add more URLs on top).
    for (const path of ["", "/about", "/use-cases", "/partners", "/contact", ...SERVICE_SLUGS.map((s) => `/services/${s}`)]) {
      expect(sitemap, path || "/").toContain(`<loc>https://growdigital.com${path}</loc>`);
    }
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /design-system");
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");
  });

  test("unique titles and canonicals", async ({ page }) => {
    const titles = new Set<string>();
    for (const route of ["/", "/about", "/use-cases", "/partners", "/contact", "/services/consultancy"]) {
      await page.goto(route);
      titles.add(await page.title());
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    }
    expect(titles.size).toBe(6);
  });
});
