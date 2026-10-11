import Image from "next/image";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Seven industry tiles (4:5 photos with a caption overlay). Horizontal scroll-snap below 1024px. */
export async function IndustryTiles() {
  const { c, t } = await getI18n();
  return (
    <Section tone="dark" aria-labelledby="industries-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t.home.industriesEyebrow}
            title={t.home.industriesTitle}
            lead={t.home.industriesLead}
            tone="dark"
            id="industries-title"
          />
        </Reveal>
      </Container>
      <div className="container-site mt-14 md:mt-20">
        <ul
          aria-label={t.home.industriesLabel}
          className="-mx-[clamp(16px,4vw,32px)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[clamp(16px,4vw,32px)] pb-4 [scrollbar-width:thin] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {c.INDUSTRIES.map((ind, i) => {
            const lead = i === 0;
            return (
              <li
                key={ind.id}
                className={cn(
                  "group relative isolate aspect-[4/5] w-[78vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-[var(--radius-card)] bg-teal-950 sm:w-[44vw] lg:w-auto lg:max-w-none",
                  lead && "lg:col-span-2 lg:row-span-2 lg:aspect-auto",
                  i >= 5 && "lg:col-span-2 lg:aspect-[2/1]",
                )}
              >
                <Image
                  src={ind.image.src}
                  alt={ind.image.alt}
                  fill
                  sizes={lead ? "(min-width: 1024px) 50vw, 80vw" : "(min-width: 1024px) 25vw, 80vw"}
                  className="-z-10 object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
                <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-teal-950 via-teal-950/50 to-transparent" />
                <div className="flex h-full flex-col justify-end gap-3 p-6 md:p-7">
                  <p className="eyebrow text-lime">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className={cn("font-light text-paper", lead ? "text-h2" : "text-h3")}>{ind.name}</h3>
                  <p className={cn("text-small text-teal-200", lead ? "max-w-md" : "line-clamp-3")}>{ind.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
