import Link from "next/link";
import type { Pillar } from "@/content/types";

/**
 * "How we work": the seven verbs as one connected lifecycle (an ordered list).
 * Horizontal columns on desktop; a vertical list on smaller screens.
 */
export function LifecycleDiagram({ pillars }: { pillars: Pillar[] }) {
  return (
    <ol className="grid gap-0 lg:grid-cols-7" aria-label="The Grow Digital lifecycle">
      {pillars.map((p) => (
        <li key={p.slug} className="relative">
          <Link
            href={`/pillars/${p.slug}`}
            className="group flex h-full items-start gap-5 border-t border-teal-300/15 py-6 pr-4 transition-colors duration-300 hover:border-lime lg:flex-col lg:gap-6 lg:border-t-0 lg:border-l lg:px-5 lg:py-2"
          >
            <span className="eyebrow pt-1 text-lime tabular-nums lg:pt-0">{p.num}</span>
            <span className="flex flex-col gap-2">
              <span className="text-h3 font-light text-paper transition-transform duration-300 group-hover:translate-x-0.5">
                {p.verb}
              </span>
              <span className="text-small text-teal-300">{p.name}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
