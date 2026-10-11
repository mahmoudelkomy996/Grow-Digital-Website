// Every public route of the site. Keep in sync with src/app.
export const SERVICE_SLUGS = ["consultancy", "managed-services", "software-development", "digital-marketing"] as const;

export const ROUTES = [
  "/",
  "/about",
  ...SERVICE_SLUGS.map((s) => `/services/${s}`),
  "/use-cases",
  "/partners",
  "/contact",
  "/blog",
  "/blog/page/2",
  "/blog/category/software-development",
  "/blog/the-critical-importance-of-cybersecurity-for-modern-organizations",
  "/blog/2030-ksa-vision",
] as const;

/** Arabic (RTL) routes: every localized page. The blog is English-only. */
export const AR_ROUTES = [
  "/ar",
  "/ar/about",
  ...SERVICE_SLUGS.map((s) => `/ar/services/${s}`),
  "/ar/use-cases",
  "/ar/partners",
  "/ar/contact",
] as const;
