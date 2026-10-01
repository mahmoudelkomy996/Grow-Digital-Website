// Every public route of the site. Keep in sync with src/app.
export const PILLAR_SLUGS = ["consult", "transform", "build", "operate", "secure", "solve", "grow"] as const;

export const ROUTES = [
  "/",
  "/about",
  ...PILLAR_SLUGS.map((s) => `/pillars/${s}`),
  "/use-cases",
  "/partners",
  "/contact",
  "/blog",
  "/blog/page/2",
  "/blog/category/transform",
  "/blog/the-critical-importance-of-cybersecurity-for-modern-organizations",
  "/blog/2030-ksa-vision",
] as const;
