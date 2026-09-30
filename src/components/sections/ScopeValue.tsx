import Image from "next/image";
import { cn } from "@/lib/cn";
import type { DeepDive } from "@/content/types";
import { SmileArc } from "@/components/ui/SmileArc";

interface ScopeValueProps {
  deepDive: DeepDive;
  /** 0-based position in the list; shown as "01", "02", … */
  index: number;
  /** Put the image on the right on desktop */
  reverse?: boolean;
  className?: string;
}

function ArcList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex items-start gap-3 border-t py-3 text-[0.9375rem] leading-snug first:border-t-0",
            dark ? "border-teal-300/15 text-teal-100" : "border-line text-teal-900",
          )}
        >
          <SmileArc strokeWidth={3.5} className={cn("mt-[0.45em] w-3", dark ? "text-lime" : "text-teal-500")} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A deep dive: index, title, objective, then "Scope includes" (paper card) beside "Value delivered"
 * (dark card). Falls back to prose (`body`) and a generic bullet list when there is no scope/value split.
 */
export function ScopeValue({ deepDive, index, reverse = false, className }: ScopeValueProps) {
  const { title, objective, body, scope, value, bullets, image } = deepDive;
  const num = String(index + 1).padStart(2, "0");
  const hasLists = Boolean(scope?.length || value?.length);

  return (
    <article id={deepDive.id} className={cn("grid scroll-mt-28 gap-10 lg:grid-cols-12 lg:gap-8", className)}>
      {image ? (
        <div className={cn("lg:col-span-5", reverse ? "lg:order-2 lg:pl-6" : "lg:pr-6")}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-teal-900 lg:sticky lg:top-28 lg:aspect-[4/5]">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>
      ) : null}

      <div className={cn(image ? "lg:col-span-7" : "lg:col-span-12", image && reverse && "lg:order-1")}>
        <div className="flex items-center gap-4">
          <span className="eyebrow text-teal-600 tabular-nums">{num}</span>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>
        <h3 className="mt-6 max-w-[20ch] text-h2 font-light text-teal-900">{title}</h3>
        {objective ? <p className="mt-5 max-w-2xl text-body-l text-teal-700">{objective}</p> : null}
        {body?.map((p) => (
          <p key={p.slice(0, 40)} className="mt-4 max-w-2xl text-teal-800">
            {p}
          </p>
        ))}

        {hasLists ? (
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {scope?.length ? (
              <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6 md:p-7">
                <h4 className="eyebrow mb-3 text-teal-600">Scope includes</h4>
                <ArcList items={scope} />
              </div>
            ) : null}
            {value?.length ? (
              <div className="surface-dark rounded-[var(--radius-card)] bg-teal-900 p-6 text-teal-100 md:p-7">
                <h4 className="eyebrow mb-3 text-lime">Value delivered</h4>
                <ArcList items={value} dark />
              </div>
            ) : null}
          </div>
        ) : null}

        {bullets?.length ? (
          <div className="mt-8 max-w-2xl border-t border-line pt-2">
            <ArcList items={bullets} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
