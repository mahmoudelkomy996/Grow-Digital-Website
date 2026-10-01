import { getPillar } from "@/content";
import { getAllPosts } from "@/lib/blog";
import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "Grow Digital insights";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);
  const pillar = post ? getPillar(post.category) : undefined;
  return ogImage({
    eyebrow: pillar ? `Insights · ${pillar.num} ${pillar.verb}` : "Grow Digital insights",
    title: post?.title ?? "Grow Digital insights",
  });
}
