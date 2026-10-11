import type { Metadata } from "next";
import { getBlogCategories } from "@/lib/blog";
import { BlogListingPage, blogListingMetadata, blogPageParams, inBlogLocales } from "@/lib/blog-pages";

export const dynamicParams = false;

// English-only blog (BLOG_LOCALES); the proxy redirects other locales
export function generateStaticParams() {
  return inBlogLocales(getBlogCategories().flatMap((c) => blogPageParams(c.slug).map((page) => ({ category: c.slug, page }))));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/category/[category]/page/[page]">): Promise<Metadata> {
  const { category, page } = await params;
  return blogListingMetadata(category, page);
}

export default async function BlogCategoryPaginatedPage({ params }: PageProps<"/[lang]/blog/category/[category]/page/[page]">) {
  const { category, page } = await params;
  return <BlogListingPage category={category} page={page} />;
}
