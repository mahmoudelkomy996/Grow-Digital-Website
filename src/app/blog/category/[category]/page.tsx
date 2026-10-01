import type { Metadata } from "next";
import { getBlogCategories } from "@/lib/blog";
import { BlogListingPage, blogListingMetadata } from "@/lib/blog-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  return blogListingMetadata(category);
}

export default async function BlogCategoryPage({ params }: PageProps<"/blog/category/[category]">) {
  const { category } = await params;
  return <BlogListingPage category={category} />;
}
