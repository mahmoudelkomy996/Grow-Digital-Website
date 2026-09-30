import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Pillar } from "@/content/types";
import { SmileArc } from "@/components/ui/SmileArc";

interface PillarCardProps {
  pillar: Pillar;
  /** "feature" is the dark, wide variant used for the first card in PillarGrid */
  variant?: "default" | "feature";
  className?: string;
}

/** Numbered pillar card linking to its page: verb, full name, one-liner and three featured services. */
export function PillarCard({ pillar, variant = "default", className }: PillarCardProps) {
  const dark = variant === "feature";
  return (
    <Link
      href={`/pillars/${pillar.slug}`}
      className={cn(
        "group/pc relative isolate flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[var(--radius-card)] border p-6 transition-[background-color,border-color,translate] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 md:p-7",
        dark
          ? "surface-dark border-teal-800 bg-teal-900 text-teal-100 hover:border-teal-600"
          : "border-line bg-paper text-ink hover:border-teal-900/35 hover:bg-teal-50",
        className,
      )}
    >
      {dark ? (
        <SmileArc
          strokeWidth={1}
          className="pointer-events-none absolute -right-16 -bottom-24 -z-10 w-[26rem] text-teal-800 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/pc:-translate-y-2"
        />
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <span className={cn("eyebrow tabular-nums", dark ? "text-lime" : "text-teal-600")}>
          {pillar.num} — {pillar.verb}
        </span>
        <span
          aria-hidden
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color] duration-300",
            dark
              ? "border-teal-300/30 text-paper group-hover/pc:border-lime group-hover/pc:bg-lime group-hover/pc:text-teal-950"
              : "border-line text-teal-900 group-hover/pc:border-teal-900 group-hover/pc:bg-teal-900 group-hover/pc:text-paper",
          )}
        >
          <ArrowUpRight
            strokeWidth={1.5}
            className="size-4 transition-transform duration-300 group-hover/pc:translate-x-px group-hover/pc:-translate-y-px"
          />
        </span>
      </div>

      <h3 className={cn("mt-10 font-light tracking-[-0.02em]", dark ? "text-h2 text-paper" : "text-h3 text-teal-900")}>
        {pillar.name}
      </h3>
      <p className={cn("mt-3 max-w-md text-[0.9375rem] leading-relaxed", dark ? "text-teal-200" : "text-teal-700")}>
        {pillar.oneLiner}
      </p>

      <div aria-hidden className="min-h-8 flex-1" />
      <ul
        className={cn(
          "flex flex-col gap-2 border-t pt-5 text-small",
          dark ? "border-teal-300/15 text-teal-100" : "border-line text-teal-800",
        )}
      >
        {pillar.featured.slice(0, 3).map((s) => (
          <li key={s} className="flex items-start gap-2.5">
            <SmileArc strokeWidth={3.5} className={cn("mt-[0.5em] w-2.5", dark ? "text-lime" : "text-teal-500")} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
