import type { Metadata } from "next";
import Image from "next/image";
import { COMPANY, IMAGES, PARTNERS, SERVICES, SERVICES_INTRO, VALUES } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmileArc } from "@/components/ui/SmileArc";
import { CtaBand } from "@/components/sections/CtaBand";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { PageHero } from "@/components/sections/PageHero";
import { ValuesGrid } from "@/components/sections/ValuesGrid";
import { LifecycleDiagram } from "@/components/about/LifecycleDiagram";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Grow Digital is a business integrator, not another vendor in the stack: one accountable team for enterprises across KSA and the UAE.",
  path: "/about",
});

export default function AboutPage() {
  const team = IMAGES["about-team"];
  const dubai = IMAGES["about-dubai"];
  return (
    <>
      <PageHero
        eyebrow="About Grow Digital"
        title="One accountable *team*."
        lead={COMPANY.positioning + " for enterprises across the Kingdom of Saudi Arabia and the United Arab Emirates."}
        image={IMAGES["about-hero"]}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      >
        <Button href="#how-we-work" variant="accent" arrow>
          How we work
        </Button>
      </PageHero>

      <Section tone="paper" aria-labelledby="who-title">
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="flex flex-col gap-8 lg:col-span-6 lg:pr-10">
            <SectionHeading eyebrow="Who we are" title="The agile *integrator*." id="who-title" />
            <p className="text-h3 font-light text-teal-900">{COMPANY.intro}</p>
            <p className="text-body-l text-teal-700">{COMPANY.statement}</p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-card)] bg-teal-900">
              <Image src={team.src} alt={team.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="stage" aria-label="Mission and vision">
        <Container>
          <dl className="grid gap-14 md:grid-cols-2 md:gap-10">
            {[
              { label: "Mission", text: COMPANY.mission },
              { label: "Vision", text: COMPANY.vision },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 120} className="flex flex-col gap-6">
                <dt>
                  <Eyebrow tone="dark" num={`0${i + 1}`}>
                    {item.label}
                  </Eyebrow>
                </dt>
                <dd className="text-h2 font-light text-paper">{item.text}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>

      <Section tone="dark" id="how-we-work" aria-labelledby="lifecycle-title" className="scroll-mt-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="How we work"
              title="From the first question to measurable *growth*."
              lead={SERVICES_INTRO.pillars}
              tone="dark"
              id="lifecycle-title"
            />
          </Reveal>
          <div className="mt-14 md:mt-20">
            <LifecycleDiagram pillars={SERVICES} />
          </div>
        </Container>
      </Section>

      <Section tone="paper-2" aria-labelledby="values-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our values"
              title="What we *stand* for."
              lead="Seven values that shape how one team delivers, across roles and locations."
              id="values-title"
            />
          </Reveal>
          <ValuesGrid values={VALUES} className="mt-14 md:mt-20" />
        </Container>
      </Section>

      <Section tone="paper" aria-labelledby="presence-title">
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:order-2 lg:col-span-6">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-card)] bg-teal-900">
              <Image src={dubai.src} alt={dubai.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-8 lg:order-1 lg:col-span-6 lg:pr-10">
            <SectionHeading
              eyebrow="Where we work"
              title="Rooted in KSA and the *UAE*."
              lead="We are the integrator KSA and UAE enterprises call first, working as one team across both markets."
              id="presence-title"
            />
            <ul className="border-t border-line">
              {COMPANY.markets.map((m) => (
                <li key={m} className="flex items-center gap-4 border-b border-line py-5 text-h3 font-light text-teal-900">
                  <SmileArc strokeWidth={3} className="w-4 text-teal-500" />
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section tone="paper" aria-label="Our partners" className="pt-0!">
        <LogoMarquee items={PARTNERS} label="Technology and solution partners" />
      </Section>

      <CtaBand />
    </>
  );
}
