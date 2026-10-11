"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { UseCase } from "@/content/types";
import { useDict } from "@/i18n/LocaleProvider";
import { Disclosure } from "@/components/ui/Disclosure";

interface UseCaseCardProps {
  useCase: UseCase;
  /** Adds an in-place disclosure with the full project description */
  expandable?: boolean;
  className?: string;
}

/** Use case: image, industry, title, summary, 1–4 result metrics and an optional full-project disclosure. */
export function UseCaseCard({ useCase, expandable = false, className }: UseCaseCardProps) {
  const t = useDict();
  const results = useCase.results.slice(0, 4);
  return (
    <article
      data-use-case={useCase.id}
      className={cn(
        "group/uc flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper transition-[border-color] duration-500 hover:border-teal-900/35",
        className,
      )}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-teal-900">
        <Image
          src={useCase.image.src}
          alt={useCase.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/uc:scale-[1.03]"
        />
        <span className="eyebrow absolute start-4 top-4 rounded-full bg-teal-950/70 px-3 py-1.5 text-paper backdrop-blur-sm">
          {useCase.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="eyebrow text-teal-600">
          {t.cards.industries[useCase.industry]}
        </p>
        <h3 className="mt-3 text-h3 text-teal-900">{useCase.title}</h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-teal-700">{useCase.summary}</p>

        <div aria-hidden className="min-h-6 flex-1" />
        <dl className={cn("grid gap-x-6 gap-y-5 border-t border-line pt-5", results.length > 1 && "grid-cols-2")}>
          {results.map((r) => (
            <div key={`${r.value}-${r.label}`} className="flex flex-col gap-1">
              <dt className="order-2 text-small leading-snug text-teal-700">{r.label}</dt>
              <dd
                className={cn(
                  "order-1 leading-none font-light tracking-[-0.03em] text-teal-900 tabular-nums",
                  r.value.length > 6 ? "text-[1.5rem]" : "text-[2.25rem]",
                )}
              >
                {r.value}
              </dd>
            </div>
          ))}
        </dl>

        {expandable ? (
          <Disclosure summary={t.cards.readProject} className="mt-6 -mb-2">
            <p className="text-[0.9375rem] leading-relaxed text-teal-800">{useCase.project}</p>
          </Disclosure>
        ) : null}
      </div>
    </article>
  );
}
