import { PILLARS, getPillar } from "@/content";
import { plain } from "@/lib/accent";
import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "Grow Digital pillar";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return PILLARS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pillar = getPillar(slug);
  return ogImage({
    eyebrow: pillar ? `${pillar.num} — ${pillar.verb} · ${pillar.name}` : "Grow Digital",
    title: pillar ? plain(pillar.headline) : "The agile integrator",
  });
}
