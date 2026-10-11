import Image from "next/image";
import { Link } from "@/components/ui/Link";
import type { ServiceDetail, ServicePillar } from "@/content/types";
import { serviceCount } from "@/content";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";

function ArcList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => {
        // "Label: text" items get a bold label
        const m = item.match(/^([^:]{3,40}):\s(.+)$/);
        return (
          <li
            key={item}
            className={cn(
              "flex items-start gap-3 border-t py-3 text-[0.9375rem] leading-snug first:border-t-0",
              dark ? "border-teal-300/15 text-teal-100" : "border-line text-teal-900",
            )}
          >
            <SmileArc strokeWidth={3.5} className={cn("mt-[0.45em] w-3 shrink-0", dark ? "text-lime" : "text-teal-500")} />
            <span>
              {m ? (
                <>
                  <span className="font-medium">{m[1]}:</span> {m[2]}
                </>
              ) : (
                item
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ServiceIntro({ pillar }: { pillar: ServicePillar }) {
  const [first, ...rest] = pillar.intro;
  return (
    <Section tone="paper" aria-label={pillar.name}>
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="flex flex-col gap-6 lg:col-span-6 lg:pe-10">
          <Eyebrow num={pillar.num}>{pillar.role}</Eyebrow>
          <p className="text-h3 font-light text-teal-900">{first}</p>
          {rest.map((p) => (
            <p key={p.slice(0, 32)} className="text-body-l text-teal-700">
              {p}
            </p>
          ))}
        </Reveal>
        <Reveal delay={120} className="lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-teal-900">
            <Image src={pillar.secondary.src} alt={pillar.secondary.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/** At-a-glance index of every service on the page, grouped (practices on Consultancy), linking to anchors. */
export async function ServiceOverview({ pillar }: { pillar: ServicePillar }) {
  const { t } = await getI18n();
  const many = pillar.groups.length > 1;
  return (
    <Section tone="paper-2" id="services" aria-labelledby="services-title" className="scroll-mt-20">
      <Container>
        <Reveal>
          <SectionHeading
            num={pillar.num}
            eyebrow={many ? t.service.practices : t.service.breadcrumb}
            title={many ? t.service.practicesTitle : t.service.everythingTitle}
            lead={pillar.slug === "managed-services" ? t.service.countAreas(serviceCount(pillar)) : t.service.countTeam(serviceCount(pillar))}
            id="services-title"
          />
        </Reveal>
        <div className={cn("mt-14 grid gap-3 md:mt-20", many ? "md:grid-cols-2 xl:grid-cols-4" : "")}>
          {pillar.groups.map((g, gi) => (
            <Reveal
              key={g.id}
              delay={gi * 80}
              className={cn("flex flex-col rounded-[var(--radius-card)] border border-line bg-paper p-6 md:p-7", !many && "md:p-9")}
            >
              {many ? (
                <>
                  <p className="eyebrow text-teal-600">{String(gi + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 text-h3 font-light text-teal-900">{g.name}</h3>
                  {g.question ? <p className="mt-2 font-serif text-[1.25rem] leading-snug text-teal-700 italic">{g.question}</p> : null}
                </>
              ) : null}
              <ul className={cn("mt-6 grid gap-x-8", !many && "mt-0 sm:grid-cols-2 lg:grid-cols-3")} data-testid="service-index">
                {g.services.map((sv, i) => (
                  <li key={sv.id} data-service className={cn("border-t border-line", many ? "first:border-t-0" : "")}>
                    <a href={`#${sv.id}`} className="group flex items-baseline gap-4 py-3.5">
                      <span className="eyebrow w-6 shrink-0 text-teal-600 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex flex-col">
                        <span className="text-[1.0625rem] text-teal-900 group-hover:underline group-hover:underline-offset-4">{sv.name}</span>
                        {!many ? <span className="mt-1 text-small text-teal-700">{sv.summary}</span> : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ServiceArticle({ service, index, outcomeLabel }: { service: ServiceDetail; index: number; outcomeLabel: string }) {
  return (
    <article id={service.id} className="grid scroll-mt-28 gap-8 border-t border-line pt-12 lg:grid-cols-12 lg:gap-8 md:pt-16">
      <div className="flex flex-col gap-5 lg:col-span-5 lg:pe-6">
        <span className="eyebrow text-teal-600 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="text-h2 font-light text-teal-900">{service.name}</h3>
        {service.body.map((p) => (
          <p key={p.slice(0, 40)} className="text-body text-teal-800">
            {p}
          </p>
        ))}
        {service.outcome ? (
          <div className="mt-2 flex items-start gap-4 rounded-[var(--radius-card)] bg-paper-2 p-5">
            <SmileArc strokeWidth={3} className="mt-1.5 w-5 shrink-0 text-teal-500" />
            <p className="text-[0.9375rem] text-teal-900">
              <span className="eyebrow mb-1 block text-teal-600">{outcomeLabel}</span>
              {service.outcome}
            </p>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 lg:col-span-7">
        <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6 md:p-7">
          <h4 className="eyebrow mb-3 text-teal-600">{service.listTitle}</h4>
          <ArcList items={service.list} />
        </div>
        {service.extras?.map((x) => (
          <div key={x.title} className="surface-dark rounded-[var(--radius-card)] bg-teal-900 p-6 text-teal-100 md:p-7">
            <h4 className="eyebrow mb-3 text-lime">{x.title}</h4>
            {x.intro ? <p className="mb-4 text-[0.9375rem] text-teal-200">{x.intro}</p> : null}
            <ArcList items={x.items} dark />
          </div>
        ))}
      </div>
    </article>
  );
}

/** Every service in full, grouped. */
export async function ServiceDetails({ pillar }: { pillar: ServicePillar }) {
  const { t } = await getI18n();
  const many = pillar.groups.length > 1;
  return (
    <Section tone="paper" aria-label={t.service.detailsLabel}>
      <Container className="flex flex-col gap-24 md:gap-32">
        {pillar.groups.map((g, gi) => (
          <div key={g.id} id={g.id} className="scroll-mt-24">
            <Reveal className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7">
                <SectionHeading
                  num={many ? String(gi + 1).padStart(2, "0") : undefined}
                  eyebrow={many ? t.service.practice : pillar.name}
                  title={g.name}
                  lead={g.intro}
                  id={`${g.id}-title`}
                />
              </div>
              {g.question ? (
                <p className="font-serif text-[1.5rem] leading-snug text-teal-700 italic lg:col-span-5 lg:self-end">{t.service.quote(g.question)}</p>
              ) : null}
            </Reveal>
            <div className="mt-12 flex flex-col gap-16 md:mt-16">
              {g.services.map((sv, i) => (
                <ServiceArticle key={sv.id} service={sv} index={i} outcomeLabel={t.service.outcome} />
              ))}
            </div>
          </div>
        ))}
      </Container>
    </Section>
  );
}

/** Pillar-specific sections: coverage/resourcing models, products, packages. */
export async function ServiceExtras({ pillar }: { pillar: ServicePillar }) {
  const { t } = await getI18n();
  return (
    <>
      {pillar.coverage ? (
        <Section tone="dark" id="models" aria-labelledby="models-title" className="scroll-mt-20">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="GrowShield™" title={t.service.modelsTitle} tone="dark" id="models-title" />
            </Reveal>
            <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-2">
              {pillar.coverage.map((m) => (
                <div key={m.title} className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-h3 font-light text-paper">{m.title}</h3>
                    <p className="mt-2 text-[0.9375rem] text-teal-200">{m.intro}</p>
                  </div>
                  <dl className="flex flex-col gap-3">
                    {m.rows.map((r, i) => (
                      <div key={r.name} className="rounded-[var(--radius-card)] border border-teal-300/15 bg-teal-950/40 p-6">
                        <dt className="flex items-baseline gap-3 text-[1.125rem] text-paper">
                          <span className="eyebrow text-lime">{String(i + 1).padStart(2, "0")}</span>
                          {r.name}
                        </dt>
                        <dd className="mt-2 text-[0.9375rem] leading-relaxed text-teal-200">{r.text}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {pillar.products ? (
        <Section tone="dark" id="products" aria-labelledby="products-title" className="scroll-mt-20">
          <Container>
            <Reveal>
              <SectionHeading eyebrow={t.service.productsEyebrow} title={t.service.productsTitle} lead={pillar.products.intro} tone="dark" id="products-title" />
            </Reveal>
            <ul className="mt-14 grid gap-3 md:mt-20 md:grid-cols-2 xl:grid-cols-4">
              {pillar.products.items.map((p, i) => (
                <Reveal as="li" key={p.name} delay={i * 80} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-teal-300/15 bg-teal-950/40 p-7">
                  <span className="eyebrow text-lime">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-h3 font-light text-paper">{p.name}</h3>
                  <p className="text-[0.9375rem] leading-relaxed text-teal-200">{p.text}</p>
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {pillar.packages ? (
        <Section tone="paper-2" id="packages" aria-labelledby="packages-title" className="scroll-mt-20">
          <Container>
            <Reveal>
              <SectionHeading eyebrow={t.service.packagesEyebrow} title={t.service.packagesTitle} lead={pillar.packages.intro} id="packages-title" />
            </Reveal>
            <ul className="mt-14 grid gap-3 md:mt-20 lg:grid-cols-3">
              {pillar.packages.items.map((p, i) => {
                const featured = i === 1;
                return (
                  <Reveal
                    as="li"
                    key={p.name}
                    delay={i * 80}
                    className={cn(
                      "flex flex-col gap-5 rounded-[var(--radius-card)] p-7 md:p-8",
                      featured ? "surface-dark bg-teal-900 text-teal-100" : "border border-line bg-paper",
                    )}
                  >
                    <span className={cn("eyebrow", featured ? "text-lime" : "text-teal-600")}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className={cn("text-h2 font-light", featured ? "text-paper" : "text-teal-900")}>{p.name}</h3>
                    <p className={cn("text-[0.9375rem]", featured ? "text-teal-200" : "text-teal-700")}>
                      <span className="eyebrow mb-1 block">{t.service.bestFor}</span>
                      {p.bestFor}
                    </p>
                    <p className={cn("border-t pt-5 text-[0.9375rem] leading-relaxed", featured ? "border-teal-300/15 text-teal-100" : "border-line text-teal-900")}>
                      {p.delivers}
                    </p>
                  </Reveal>
                );
              })}
            </ul>
            <p className="mt-8 text-center text-[0.9375rem] text-teal-700">{pillar.packages.note}</p>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

/** Previous / next pillar and the 01–04 rail. */
export async function ServiceNav({ current }: { current: ServicePillar }) {
  const { c, t } = await getI18n();
  const SERVICES = c.SERVICES;
  const i = SERVICES.findIndex((p) => p.slug === current.slug);
  const prev = SERVICES[(i - 1 + SERVICES.length) % SERVICES.length];
  const next = SERVICES[(i + 1) % SERVICES.length];
  return (
    <nav aria-label={t.service.navLabel} className="border-t border-line bg-paper-2 text-ink">
      <div className="container-site py-14 md:py-20">
        <ol className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-4">
          {SERVICES.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/services/${p.slug}`}
                aria-current={p.slug === current.slug ? "page" : undefined}
                className={cn("flex items-baseline gap-2 text-small", p.slug === current.slug ? "text-teal-900" : "text-teal-700 hover:text-teal-900")}
              >
                <span className="eyebrow text-teal-600">{p.num}</span>
                {p.navLabel}
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            { p: prev, dir: "prev", label: t.service.prev },
            { p: next, dir: "next", label: t.service.next },
          ].map(({ p, dir, label }) => (
            <Link
              key={dir}
              href={`/services/${p.slug}`}
              rel={dir}
              className={cn("group flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-paper p-6 hover:border-teal-900/30", dir === "next" && "sm:items-end sm:text-end")}
            >
              <span className="eyebrow text-teal-600">{label}</span>
              <span className="text-h3 font-light text-teal-900">
                <span className="eyebrow me-2 text-teal-600">{p.num}</span>
                {p.name}
              </span>
              <span className="text-small text-teal-700">{p.tagline}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
