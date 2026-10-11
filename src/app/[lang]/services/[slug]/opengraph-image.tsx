import { SERVICES, getService } from "@/content";
import { plain } from "@/lib/accent";
import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "Grow Digital services";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return SERVICES.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getService(slug);
  return ogImage({ eyebrow: p ? `${p.num} — ${p.name}` : "Grow Digital", title: p ? plain(p.headline) : "The agile integrator" });
}
