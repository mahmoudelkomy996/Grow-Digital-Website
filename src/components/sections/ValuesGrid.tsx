import { cn } from "@/lib/cn";
import type { Value } from "@/content/types";
import { SmileArc } from "@/components/ui/SmileArc";

interface ValuesGridProps {
  values: Value[];
  className?: string;
}

/**
 * Compact hairline grid of values. When the count leaves a gap in the last row (7 values → 8 cells),
 * a dark motif cell closes the grid.
 */
export function ValuesGrid({ values, className }: ValuesGridProps) {
  const fillSm = values.length % 2 !== 0;
  const fillLg = values.length % 4 !== 0;
  return (
    <ul className={cn("grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-4", className)}>
      {values.map((v, i) => (
        <li key={v.id} className="flex min-h-56 flex-col border-r border-b border-line p-6 md:p-8">
          <span className="eyebrow text-teal-600 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
          <div aria-hidden className="min-h-10 flex-1" />
          <h3 className="text-h3 text-teal-900">{v.name}</h3>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-teal-700">{v.description}</p>
        </li>
      ))}
      {fillSm || fillLg ? (
        <li
          aria-hidden
          className={cn(
            "surface-dark relative isolate hidden min-h-56 overflow-hidden border-r border-b border-teal-900 bg-teal-900",
            fillSm ? "sm:block" : "sm:hidden",
            fillLg ? "lg:block" : "lg:hidden",
          )}
        >
          <SmileArc strokeWidth={0.8} className="absolute -right-14 -bottom-24 -z-10 w-80 text-teal-700" />
          <SmileArc strokeWidth={2.6} className="absolute right-7 bottom-9 w-20 text-lime" />
        </li>
      ) : null}
    </ul>
  );
}
