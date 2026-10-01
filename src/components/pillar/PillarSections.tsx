// Generic sections of a pillar page: intro, services, deep dives, related use cases and partners.
import Image from "next/image";
import type { Pillar } from "@/content/types";
import { getPartners, getUseCases } from "@/content";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LogoTile } from "@/components/ui/LogoTile";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ScopeValue } from "@/components/sections/ScopeValue";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { UseCaseCard } from "@/components/sections/UseCaseCard";

export function PillarIntro({ pillar }: { pillar: Pillar }) {
  const [first, ...rest] = pillar.intro;
  return (
    <Section tone="paper" aria-label={`About ${pillar.name}`}>
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="flex flex-col gap-6 lg:col-span-6 lg:pr-10">
          <Eyebrow num={pillar.num}>{pillar.verb}</Eyebrow>
          <p className="text-h3 font-light text-teal-900">{first}</p>
          {rest.map((p) => (
            <p key={p.slice(0, 32)} className="text-body-l text-teal-700">
              {p}
            </p>
          ))}
        </Reveal>
        <Reveal delay={120} className="lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-teal-900">
            <Image
              src={pillar.secondary.src}
              alt={pillar.secondary.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export function PillarServices({ pillar }: { pillar: Pillar }) {
  const count = pillar.services.reduce((n, g) => n + g.items.length, 0);
  return (
    <Section tone="paper-2" id="services" aria-labelledby="services-title" className="scroll-mt-20">
      <Container>
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            num={pillar.num}
            eyebrow="Services"
            title="What we *deliver*."
            lead={`${count} ${pillar.name.toLowerCase().includes("solutions") ? "solutions" : "services"} under one accountable team.`}
            id="services-title"
          />
        </Reveal>
        <ServiceGrid groups={pillar.services} className="mt-14 md:mt-20" />
      </Container>
    </Section>
  );
}

export function PillarDeepDives({ pillar }: { pillar: Pillar }) {
  if (!pillar.deepDives.length) return null;
  return (
    <Section tone="paper" id="deep-dives" aria-labelledby="deep-dives-title" className="scroll-mt-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="In depth"
            title="How the work *gets done*."
            lead="Scope, outcomes and the partners behind each capability."
            id="deep-dives-title"
          />
        </Reveal>
        <div className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-32">
          {pillar.deepDives.map((d, i) => {
            const partners = getPartners(d.partnerIds ?? []);
            return (
              <Reveal key={d.id} className="flex flex-col gap-8">
                <ScopeValue deepDive={d} index={i} reverse={i % 2 === 1} />
                {partners.length ? (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6 lg:ml-[calc(5/12*100%+2rem)]">
                    <span className="eyebrow text-teal-600">Delivered with</span>
                    <ul className="flex flex-wrap gap-2">
                      {partners.map((p) => (
                        <li key={p.id} className="w-40 rounded-[var(--radius-control)] border border-line bg-paper">
                          <LogoTile item={p} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function PillarUseCases({ pillar }: { pillar: Pillar }) {
  const cases = getUseCases(pillar.useCaseIds).slice(0, 3);
  if (!cases.length) return null;
  return (
    <Section tone="paper-2" aria-labelledby="related-title">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading eyebrow="Use cases" title="Proof, in *production*." id="related-title" />
          </Reveal>
          <ArrowLink href="/use-cases">All use cases</ArrowLink>
        </div>
        <ul className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((u, i) => (
            <Reveal as="li" key={u.id} delay={i * 100} className="flex">
              <UseCaseCard useCase={u} className="w-full" />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Partner logos for pillars whose extras do not already show their partners. */
export function PillarPartners({ pillar }: { pillar: Pillar }) {
  const partners = getPartners(pillar.partnerIds);
  if (!partners.length) return null;
  return (
    <Section tone="paper" aria-labelledby="pillar-partners-title" className="py-16! md:py-20!">
      <Container className="grid items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>Partners</Eyebrow>
          <h2 id="pillar-partners-title" className="mt-4 text-h3 font-light text-teal-900">
            Delivered with our partners
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-4">
          {partners.map((p) => (
            <li key={p.id} className="rounded-[var(--radius-control)] border border-line">
              <LogoTile item={p} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
