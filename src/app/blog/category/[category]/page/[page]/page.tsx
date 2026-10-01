import type { Metadata } from "next";
import { getBlogCategories } from "@/lib/blog";
import { BlogListingPage, blogListingMetadata, blogPageParams } from "@/lib/blog-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogCategories().flatMap((c) => blogPageParams(c.slug).map((page) => ({ category: c.slug, page })));
}

export async function generateMetadata({ params }: PageProps<"/blog/category/[category]/page/[page]">): Promise<Metadata> {
  const { category, page } = await params;
  return blogListingMetadata(category, page);
}

export default async function BlogCategoryPaginatedPage({ params }: PageProps<"/blog/category/[category]/page/[page]">) {
  const { category, page } = await params;
  return <BlogListingPage category={category} page={page} />;
}
