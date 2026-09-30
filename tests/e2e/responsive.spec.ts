import { expect, test, type ConsoleMessage } from "@playwright/test";
import { ROUTES } from "./routes";

const WIDTHS = [320, 390, 768, 1440];

// Site-wide guarantees: no horizontal overflow, exactly one H1, no console errors, on every route and width.
for (const route of ROUTES) {
  test.describe(`route ${route}`, () => {
    for (const width of WIDTHS) {
      test(`${width}px: one h1, no overflow, no console errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (m: ConsoleMessage) => {
          if (m.type() === "error") errors.push(m.text());
        });
        page.on("pageerror", (e) => errors.push(e.message));

        await page.setViewportSize({ width, height: 900 });
        const res = await page.goto(route, { waitUntil: "networkidle" });
        expect(res?.status()).toBe(200);

        await expect(page.locator("h1")).toHaveCount(1);

        // Scroll through the page so lazy sections and reveals mount before measuring.
        await page.evaluate(async () => {
          const step = window.innerHeight * 0.8;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 40));
          }
          window.scrollTo(0, 0);
        });

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(1);
        expect(errors, errors.join("\n")).toEqual([]);
      });
    }
  });
}
