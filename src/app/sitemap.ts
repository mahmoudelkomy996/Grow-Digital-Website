import type { MetadataRoute } from "next";
import { PILLARS } from "@/content";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/use-cases", "/partners", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...PILLARS.map((p) => ({ url: `${SITE_URL}/pillars/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
  ];
}
