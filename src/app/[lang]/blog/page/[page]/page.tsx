import type { Metadata } from "next";
import { BlogListingPage, blogListingMetadata, blogPageParams, inBlogLocales } from "@/lib/blog-pages";

export const dynamicParams = false;

// English-only blog (BLOG_LOCALES); the proxy redirects other locales
export function generateStaticParams() {
  return inBlogLocales(blogPageParams().map((page) => ({ page })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/page/[page]">): Promise<Metadata> {
  const { page } = await params;
  return blogListingMetadata(undefined, page);
}

export default async function BlogPaginatedPage({ params }: PageProps<"/[lang]/blog/page/[page]">) {
  const { page } = await params;
  return <BlogListingPage page={page} />;
}
