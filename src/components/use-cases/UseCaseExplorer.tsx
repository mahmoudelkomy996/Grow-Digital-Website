"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { Industry, UseCase } from "@/content/types";
import { cn } from "@/lib/cn";
import { UseCaseCard } from "@/components/sections/UseCaseCard";

type Category = "all" | "ai" | "iot";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "iot", label: "IoT" },
];

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-10 rounded-full border px-4 text-[0.9375rem] transition-colors duration-300",
        active
          ? "border-teal-900 bg-teal-900 text-paper"
          : "border-line bg-paper text-teal-900 hover:border-teal-900/40",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Filterable grid of use cases. Filter state lives in the URL (?category=ai&industry=healthcare)
 * so filtered views can be shared and survive a reload.
 */
export function UseCaseExplorer({ useCases, industries }: { useCases: UseCase[]; industries: Industry[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawCategory = params.get("category");
  const category: Category = rawCategory === "ai" || rawCategory === "iot" ? rawCategory : "all";
  const presentIndustries = industries.filter((ind) => useCases.some((u) => u.industry === ind.id));
  const rawIndustry = params.get("industry");
  const industry = presentIndustries.some((i) => i.id === rawIndustry) ? rawIndustry : null;

  const results = useMemo(
    () =>
      useCases.filter(
        (u) => (category === "all" || u.category.toLowerCase() === category) && (!industry || u.industry === industry),
      ),
    [useCases, category, industry],
  );

  function update(next: { category?: Category; industry?: string | null }) {
    const sp = new URLSearchParams(params.toString());
    const c = next.category ?? category;
    const ind = next.industry === undefined ? industry : next.industry;
    if (c === "all") sp.delete("category");
    else sp.set("category", c);
    if (ind) sp.set("industry", ind);
    else sp.delete("industry");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 border-b border-line pb-8" role="group" aria-label="Filter use cases">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-3 w-20 text-teal-600">Type</span>
          {CATEGORIES.map((c) => (
            <FilterButton key={c.id} active={category === c.id} onClick={() => update({ category: c.id })}>
              {c.label}
            </FilterButton>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-3 w-20 text-teal-600">Industry</span>
          <FilterButton active={!industry} onClick={() => update({ industry: null })}>
            All industries
          </FilterButton>
          {presentIndustries.map((ind) => (
            <FilterButton key={ind.id} active={industry === ind.id} onClick={() => update({ industry: ind.id })}>
              {ind.name}
            </FilterButton>
          ))}
        </div>
      </div>

      <p className="eyebrow text-teal-700" aria-live="polite">
        {results.length} {results.length === 1 ? "use case" : "use cases"}
      </p>

      {results.length ? (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="use-case-grid">
          {results.map((u) => (
            <li key={u.id} className="flex">
              <UseCaseCard useCase={u} expandable className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-5 rounded-[var(--radius-card)] border border-line bg-paper p-10">
          <p className="text-h3 font-light text-teal-900">No use cases match these filters yet.</p>
          <button
            type="button"
            onClick={() => update({ category: "all", industry: null })}
            className="text-[0.9375rem] text-teal-600 underline underline-offset-4"
          >
            Clear the filters
          </button>
        </div>
      )}
    </div>
  );
}
