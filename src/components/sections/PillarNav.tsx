import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PillarSlug } from "@/content/types";
import { NAV_PILLARS, type NavPillar } from "@/content/navigation";
import { SmileArc } from "@/components/ui/SmileArc";

interface PillarNavProps {
  current: PillarSlug;
  className?: string;
}

function StepLink({ pillar, dir }: { pillar: NavPillar; dir: "prev" | "next" }) {
  const next = dir === "next";
  const Arrow = next ? ArrowRight : ArrowLeft;
  return (
    <Link
      href={pillar.href}
      rel={dir}
      className={cn(
        "group/pn flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-paper p-6 transition-[border-color,background-color] duration-300 hover:border-teal-900/35 hover:bg-teal-50 md:p-8",
        next && "sm:items-end sm:text-right",
      )}
    >
      <span className={cn("eyebrow flex items-center gap-2 text-teal-600", next && "flex-row-reverse")}>
        <Arrow
          aria-hidden
          strokeWidth={1.5}
          className={cn(
            "size-4 transition-transform duration-300",
            next ? "group-hover/pn:translate-x-1" : "group-hover/pn:-translate-x-1",
          )}
        />
        {next ? "Next pillar" : "Previous pillar"}
      </span>
      <span className="text-h3 font-light text-teal-900">
        <span className="font-mono text-[0.7em] text-teal-600 tabular-nums">{pillar.num}</span> {pillar.name}
      </span>
      <span className="text-small text-teal-700">{pillar.full}</span>
    </Link>
  );
}

/** Previous / next pillar (the lifecycle loops: GROW leads back to CONSULT) plus the 01–07 rail. */
export function PillarNav({ current, className }: PillarNavProps) {
  const n = NAV_PILLARS.length;
  const i = Math.max(
    0,
    NAV_PILLARS.findIndex((p) => p.slug === current),
  );
  const prev = NAV_PILLARS[(i - 1 + n) % n];
  const next = NAV_PILLARS[(i + 1) % n];

  return (
    <nav aria-label="Pillars" className={cn("border-t border-line bg-paper-2 text-ink", className)}>
      <div className="container-site py-14 md:py-20">
        <ol className="flex flex-wrap items-end justify-between gap-y-2 border-b border-line pb-4 md:justify-start md:gap-x-2">
          {NAV_PILLARS.map((p) => {
            const active = p.slug === current;
            return (
              <li key={p.slug}>
                <Link
                  href={p.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${p.num} ${p.name}`}
                  className={cn(
                    "group/rail relative flex flex-col items-center gap-1 rounded-md px-1.5 pt-1 pb-3.5 transition-colors sm:px-3",
                    active ? "text-teal-900" : "text-teal-700 hover:text-teal-900",
                  )}
                >
                  <span className="eyebrow tabular-nums">{p.num}</span>
                  <span className="hidden text-small md:block">{p.name}</span>
                  <SmileArc
                    stretch
                    strokeWidth={1.5}
                    className={cn(
                      "absolute bottom-0 left-1/2 h-1.5 w-5 -translate-x-1/2 text-teal-500 transition-opacity duration-300",
                      active ? "opacity-100" : "opacity-0 group-hover/rail:opacity-50",
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <StepLink pillar={prev} dir="prev" />
          <StepLink pillar={next} dir="next" />
        </div>
      </div>
    </nav>
  );
}
