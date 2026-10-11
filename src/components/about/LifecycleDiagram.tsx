import Link from "next/link";
import type { ServicePillar } from "@/content/services";

/**
 * "How we work": the four pillars as one connected journey (an ordered list):
 * we advise, we build, we market and we operate. Columns on desktop; a vertical list on smaller screens.
 */
export function LifecycleDiagram({ pillars }: { pillars: ServicePillar[] }) {
  return (
    <ol className="grid gap-0 lg:grid-cols-4" aria-label="The Grow Digital journey">
      {pillars.map((p) => (
        <li key={p.slug} className="relative">
          <Link
            href={`/services/${p.slug}`}
            className="group flex h-full items-start gap-5 border-t border-teal-300/15 py-6 pr-4 transition-colors duration-300 hover:border-lime lg:flex-col lg:gap-6 lg:border-t-0 lg:border-l lg:px-6 lg:py-2"
          >
            <span className="eyebrow pt-1 text-lime tabular-nums lg:pt-0">{p.num}</span>
            <span className="flex flex-col gap-2">
              <span className="text-h3 font-light text-paper transition-transform duration-300 group-hover:translate-x-0.5">{p.role}</span>
              <span className="text-[1.0625rem] text-teal-100">{p.name}</span>
              <span className="text-small text-teal-300">{p.tagline}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
