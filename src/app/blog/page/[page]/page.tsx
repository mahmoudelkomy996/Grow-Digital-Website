import type { Metadata } from "next";
import { BlogListingPage, blogListingMetadata, blogPageParams } from "@/lib/blog-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPageParams().map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps<"/blog/page/[page]">): Promise<Metadata> {
  const { page } = await params;
  return blogListingMetadata(undefined, page);
}

export default async function BlogPaginatedPage({ params }: PageProps<"/blog/page/[page]">) {
  const { page } = await params;
  return <BlogListingPage page={page} />;
}
