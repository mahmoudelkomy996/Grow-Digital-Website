import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavLink, NavPillar } from "@/content/navigation";
import { SmileArc } from "@/components/ui/SmileArc";

interface MegaMenuProps {
  id: string;
  labelledBy: string;
  open: boolean;
  pillars: NavPillar[];
  promo: NavLink & { eyebrow: string; body: string };
  currentPath: string;
  /** Called when a link inside the panel is activated */
  onNavigate: () => void;
}

/**
 * Full-width pillars panel below the header bar (desktop only). Rendered on the server-side HTML at all
 * times so the links are crawlable; hidden with `visibility` (and `inert`) while closed.
 */
export function MegaMenu({ id, labelledBy, open, pillars, promo, currentPath, onNavigate }: MegaMenuProps) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      inert={!open}
      className={cn(
        "absolute inset-x-0 top-full hidden border-b border-line bg-paper text-teal-900 lg:block",
        "transition-[opacity,translate,visibility] duration-500 ease-[var(--ease-out-expo)]",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
      )}
    >
      <div className="container-site grid grid-cols-4 gap-2 pt-6 pb-8">
        {/* display:contents lets the 7 pillars and the promo share one 4×2 grid; role="list" keeps list semantics */}
        <ul role="list" aria-label="Pillars" className="contents">
          {pillars.map((p, i) => {
            const current = currentPath === p.href;
            return (
              <li
                key={p.slug}
                data-pillar
                className={cn(
                  "group/mm relative flex flex-col rounded-[var(--radius-card)] p-5 transition-[background-color,opacity,translate] duration-500 ease-[var(--ease-out-expo)] hover:bg-teal-50",
                  current && "bg-teal-50",
                  open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                )}
                style={{ transitionDelay: open ? `${40 + i * 25}ms` : "0ms" }}
              >
                <Link
                  href={p.href}
                  onClick={onNavigate}
                  aria-current={current ? "page" : undefined}
                  className="flex flex-col rounded-sm after:absolute after:inset-0 after:rounded-[var(--radius-card)] after:content-['']"
                >
                  <span className="flex items-center justify-between">
                    <span className="eyebrow text-teal-600 tabular-nums">{p.num}</span>
                    <ArrowRight
                      aria-hidden
                      strokeWidth={1.5}
                      className="size-4 -translate-x-1 text-teal-600 opacity-0 transition-[opacity,translate] duration-300 group-hover/mm:translate-x-0 group-hover/mm:opacity-100"
                    />
                  </span>
                  <span className="mt-4 text-[1.5rem] leading-tight font-light tracking-[-0.02em] text-teal-900">
                    {p.name}
                  </span>
                  <span className="mt-1 text-small text-teal-700">{p.full}</span>
                </Link>
                <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[0.8125rem] leading-snug text-teal-700">
                  {p.featured.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <SmileArc strokeWidth={3.5} className="mt-[0.45em] w-2.5 text-teal-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
        <div
          className={cn(
            "surface-dark relative isolate flex flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-teal-900 p-5 text-teal-100",
            "transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)]",
            open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          )}
          style={{ transitionDelay: open ? `${40 + pillars.length * 25}ms` : "0ms" }}
          >
          <SmileArc
            strokeWidth={1.2}
            className="pointer-events-none absolute -right-10 -bottom-16 -z-10 w-56 text-teal-700"
          />
          <span className="eyebrow text-lime">{promo.eyebrow}</span>
          <p className="mt-4 text-small text-teal-200">{promo.body}</p>
          <Link
            href={promo.href}
            onClick={onNavigate}
            className="group/pr mt-6 inline-flex items-center gap-2 self-start rounded-sm text-[0.9375rem] font-medium text-paper"
          >
            <span className="underline decoration-lime/60 underline-offset-[6px] transition-[text-decoration-color] group-hover/pr:decoration-lime">
              {promo.label}
            </span>
            <ArrowRight
              aria-hidden
              strokeWidth={1.5}
              className="size-4 text-lime transition-transform duration-300 group-hover/pr:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
