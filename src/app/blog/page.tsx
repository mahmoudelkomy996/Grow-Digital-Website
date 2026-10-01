import type { Metadata } from "next";
import { BlogListingPage, blogListingMetadata } from "@/lib/blog-pages";

export const metadata: Metadata = blogListingMetadata();

export default function BlogPage() {
  return <BlogListingPage />;
}
