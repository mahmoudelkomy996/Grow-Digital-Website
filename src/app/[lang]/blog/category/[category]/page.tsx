import type { Metadata } from "next";
import { getBlogCategories } from "@/lib/blog";
import { BlogListingPage, blogListingMetadata, inBlogLocales } from "@/lib/blog-pages";

export const dynamicParams = false;

// English-only blog (BLOG_LOCALES); the proxy redirects other locales
export function generateStaticParams() {
  return inBlogLocales(getBlogCategories().map((c) => ({ category: c.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  return blogListingMetadata(category);
}

export default async function BlogCategoryPage({ params }: PageProps<"/[lang]/blog/category/[category]">) {
  const { category } = await params;
  return <BlogListingPage category={category} />;
}
