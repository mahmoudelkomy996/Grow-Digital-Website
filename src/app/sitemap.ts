import type { MetadataRoute } from "next";
import { SERVICES } from "@/content";
import { getAllPosts, getBlogCategories, getPostsByCategory, paginate } from "@/lib/blog";
import { SITE_UPDATED, SITE_URL, languageAlternates } from "@/lib/seo";
import { LOCALES, hasPath, localizeHref } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPost = posts[0]?.updated ?? SITE_UPDATED;
  const at = (path: string, lastModified: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  const blogPages = Array.from({ length: paginate(posts, 1).totalPages - 1 }, (_, i) => at(`/blog/page/${i + 2}`, latestPost, 0.4, "weekly"));
  const categories = getBlogCategories().flatMap((c) => {
    const list = getPostsByCategory(c.slug);
    const { totalPages } = paginate(list, 1);
    return Array.from({ length: totalPages }, (_, i) =>
      at(i === 0 ? `/blog/category/${c.slug}` : `/blog/category/${c.slug}/page/${i + 1}`, list[0].updated, 0.5, "weekly"),
    );
  });

  // Localized pages: one entry per locale, each listing every language version (hreflang alternates).
  const abs = (href: string) => `${SITE_URL}${href === "/" ? "" : href}`;
  const localized = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") =>
    LOCALES.filter((l) => hasPath(l, path)).map((l) => ({
      ...at(localizeHref(l, path) === "/" ? "" : localizeHref(l, path), SITE_UPDATED, l === "en" ? priority : Math.max(0.1, priority - 0.1), changeFrequency),
      alternates: { languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([k, v]) => [k, abs(v)])) },
    }));

  return [
    ...localized("/", 1, "weekly"),
    ...SERVICES.flatMap((p) => localized(`/services/${p.slug}`, 0.9)),
    ...localized("/about", 0.7),
    ...localized("/use-cases", 0.8),
    ...localized("/partners", 0.7),
    ...localized("/contact", 0.7),
    at("/blog", latestPost, 0.8, "weekly"),
    ...blogPages,
    ...categories,
    ...posts.map((p) => ({ ...at(`/blog/${p.slug}`, p.updated, 0.6, "yearly"), ...(p.cover ? { images: [`${SITE_URL}${p.cover}`] } : {}) })),
  ];
}
