"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { useDict } from "@/i18n/LocaleProvider";
import type { Solution } from "@/content/types";
import { SmileArc } from "@/components/ui/SmileArc";

interface SolutionCardProps {
  solution: Solution;
  className?: string;
}

/** Own product or partner platform: image, provenance, name, category, description and key features. */
export function SolutionCard({ solution, className }: SolutionCardProps) {
  const t = useDict();
  const own = solution.kind === "own";
  return (
    <article
      className={cn(
        "group/sc flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper transition-[border-color] duration-500 hover:border-teal-900/35",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-teal-900">
        <Image
          src={solution.image.src}
          alt={solution.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/sc:scale-[1.03]"
        />
        <span
          className={cn(
            "eyebrow absolute start-4 top-4 rounded-full px-3 py-1.5",
            own ? "bg-lime text-teal-950" : "bg-teal-950/70 text-paper backdrop-blur-sm",
          )}
        >
          {own ? t.cards.ownSolution : t.cards.partnerSolution}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="eyebrow text-teal-600">{own ? t.cards.byGrowDigital : t.cards.by(solution.by)}</p>
        <h3 className="mt-3 text-h3 text-teal-900">{solution.name}</h3>
        <p className="mt-1.5 text-small text-teal-700">{solution.category}</p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-teal-800">{solution.description}</p>
        {solution.features.length ? (
          <>
            <div aria-hidden className="min-h-6 flex-1" />
            <ul className="flex flex-col gap-2 border-t border-line pt-5 text-small text-teal-800">
              {solution.features.slice(0, 6).map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <SmileArc strokeWidth={3.5} className="mt-[0.5em] w-2.5 text-teal-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </article>
  );
}
