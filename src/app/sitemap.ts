import type { MetadataRoute } from "next";
import { PILLARS } from "@/content";
import { getAllPosts, getBlogCategories, getPostsByCategory, paginate } from "@/lib/blog";
import { SITE_UPDATED, SITE_URL } from "@/lib/seo";

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

  return [
    at("", SITE_UPDATED, 1, "weekly"),
    ...PILLARS.map((p) => at(`/pillars/${p.slug}`, SITE_UPDATED, 0.9)),
    at("/about", SITE_UPDATED, 0.7),
    at("/use-cases", SITE_UPDATED, 0.8),
    at("/partners", SITE_UPDATED, 0.7),
    at("/contact", SITE_UPDATED, 0.7),
    at("/blog", latestPost, 0.8, "weekly"),
    ...blogPages,
    ...categories,
    ...posts.map((p) => ({ ...at(`/blog/${p.slug}`, p.updated, 0.6, "yearly"), ...(p.cover ? { images: [`${SITE_URL}${p.cover}`] } : {}) })),
  ];
}
