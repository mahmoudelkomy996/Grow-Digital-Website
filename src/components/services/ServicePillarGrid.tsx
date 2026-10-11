import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServicePillar } from "@/content/services";
import { serviceCount } from "@/content/services";
import { cn } from "@/lib/cn";
import { SmileArc } from "@/components/ui/SmileArc";

/** The four service pillars as cards (home page). The first card is dark and wide. */
export function ServicePillarGrid({ pillars, className }: { pillars: ServicePillar[]; className?: string }) {
  return (
    <ul className={cn("grid gap-3 md:grid-cols-2", className)}>
      {pillars.map((p, i) => {
        const dark = i === 0;
        const featured = p.groups.flatMap((g) => g.services).slice(0, 4);
        return (
          <li key={p.slug} className="flex">
            <Link
              href={`/services/${p.slug}`}
              className={cn(
                "group/card relative flex w-full flex-col gap-6 overflow-hidden rounded-[var(--radius-card)] p-7 transition-colors duration-300 md:p-9",
                dark ? "surface-dark bg-teal-900 text-teal-100" : "border border-line bg-paper text-teal-900 hover:border-teal-900/30",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <p className={cn("eyebrow", dark ? "text-lime" : "text-teal-600")}>
                  {p.num} — {p.role}
                </p>
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full border transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5",
                    dark ? "border-teal-300/30" : "border-line",
                  )}
                >
                  <ArrowUpRight aria-hidden strokeWidth={1.5} className="size-4" />
                </span>
              </div>
              <div>
                <h3 className={cn("text-h2 font-light", dark ? "text-paper" : "text-teal-900")}>{p.name}</h3>
                <p className={cn("mt-3 max-w-md text-body", dark ? "text-teal-200" : "text-teal-700")}>{p.tagline}</p>
              </div>
              <ul className={cn("mt-auto grid gap-x-6 border-t pt-5 sm:grid-cols-2", dark ? "border-teal-300/15" : "border-line")}>
                {featured.map((sv) => (
                  <li key={sv.id} className="flex items-center gap-2.5 py-1.5 text-small">
                    <SmileArc strokeWidth={3} className={cn("w-2.5 shrink-0", dark ? "text-lime" : "text-teal-500")} />
                    {sv.name}
                  </li>
                ))}
              </ul>
              <p className={cn("eyebrow", dark ? "text-teal-300" : "text-teal-600")}>{serviceCount(p)} services</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
