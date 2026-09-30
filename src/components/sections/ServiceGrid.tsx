import { cn } from "@/lib/cn";
import type { ServiceGroup } from "@/content/types";

interface ServiceGridProps {
  groups: ServiceGroup[];
  className?: string;
}

/**
 * The pillar's full service list as a numbered, scannable grid (numbering runs across groups).
 * Each service is an <li data-service> so tests can count them.
 */
export function ServiceGrid({ groups, className }: ServiceGridProps) {
  const numbered = groups.reduce<{ group: ServiceGroup; start: number }[]>((acc, group) => {
    const prev = acc[acc.length - 1];
    acc.push({ group, start: prev ? prev.start + prev.group.items.length : 1 });
    return acc;
  }, []);

  return (
    <div className={cn("flex flex-col gap-14", className)}>
      {numbered.map(({ group, start }, gi) => (
        <div key={group.title ?? `group-${gi}`}>
          {group.title ? (
            <h3 className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-h3 text-teal-900">
              {group.title}
              <span className="eyebrow text-teal-600">{group.items.length} services</span>
            </h3>
          ) : null}
          <ol start={start} className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item, i) => (
              <li
                key={item}
                data-service
                className="flex items-baseline gap-5 border-t border-line py-5 transition-colors duration-300 hover:border-teal-900/40"
              >
                <span className="eyebrow w-6 shrink-0 text-teal-600 tabular-nums">
                  {String(start + i).padStart(2, "0")}
                </span>
                <span className="text-[1.0625rem] leading-snug text-teal-900">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
