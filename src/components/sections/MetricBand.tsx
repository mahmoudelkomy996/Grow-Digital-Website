import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Metric } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface MetricBandProps {
  metrics: Metric[];
  eyebrow?: ReactNode;
  /** Optional heading; wrap one word in *asterisks* */
  title?: string;
  id?: string;
}

/** Dark impact band: big lime figures with their label and the use case they come from. */
export function MetricBand({ metrics, eyebrow = "Impact", title, id }: MetricBandProps) {
  return (
    <section
      id={id}
      aria-label={title ? undefined : typeof eyebrow === "string" ? eyebrow : "Impact"}
      aria-labelledby={title && id ? `${id}-title` : undefined}
      className="surface-dark relative isolate overflow-hidden bg-stage text-teal-100 section-y"
    >
      <Container>
        {title ? (
          <SectionHeading eyebrow={eyebrow} title={title} tone="dark" id={id ? `${id}-title` : undefined} className="mb-14 md:mb-20" />
        ) : (
          <p className="eyebrow mb-10 text-lime">{eyebrow}</p>
        )}
        <dl className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-x-7">
          {metrics.map((m, i) => (
            <div key={`${m.value}-${i}`} className="flex flex-col gap-4 border-t border-teal-300/20 pt-7">
              <dt className="order-2 max-w-[18rem] text-[0.9375rem] leading-snug text-teal-200">{m.label}</dt>
              <dd
                className={cn(
                  "order-1 leading-[0.9] font-light tracking-[-0.04em] text-lime tabular-nums",
                  m.value.length > 5 ? "text-[clamp(2.5rem,1.9rem+1.6vw,3.25rem)]" : "text-[clamp(3rem,2rem+3vw,4.5rem)]",
                )}
              >
                {m.value}
              </dd>
              <dd className="order-3 eyebrow mt-auto pt-2 text-teal-400">{m.source}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
