import { Link } from "@/components/ui/Link";
import { cn } from "@/lib/cn";
import type { Tone } from "./Eyebrow";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  tone?: Tone;
  /** Accessible name of the nav (localized by the caller) */
  label?: string;
  className?: string;
}

/** Trail of links; the last item is the current page. */
export function Breadcrumb({ items, tone = "paper", label = "Breadcrumb", className }: BreadcrumbProps) {
  const dark = tone === "dark";
  return (
    <nav aria-label={label} className={className}>
      <ol className={cn("eyebrow flex flex-wrap items-center gap-x-3 gap-y-1", dark ? "text-teal-300" : "text-teal-700")}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-x-3">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-sm underline decoration-transparent underline-offset-4 transition-colors duration-300",
                    dark ? "hover:text-paper hover:decoration-paper/40" : "hover:text-teal-900 hover:decoration-teal-900/40",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && (dark ? "text-paper" : "text-teal-900"))}>
                  {item.label}
                </span>
              )}
              {!last ? (
                <span aria-hidden className={cn(dark ? "text-teal-400" : "text-teal-600")}>
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
