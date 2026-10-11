import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import { getI18n } from "@/i18n/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({ title: t.about.metaTitle, description: t.about.metaDescription, path: "/about", locale });
}

export default async function AboutPage() {
  const { c, t } = await getI18n();
  const a = t.about;
  const team = c.img("about-team");
  const dubai = c.img("about-dubai");
  return (
    <>
      <PageHero
        eyebrow={a.eyebrow}
        title={a.title}
        lead={c.COMPANY.positioning + a.leadSuffix}
        image={c.img("about-hero")}
        breadcrumb={[{ label: t.common.home, href: "/" }, { label: a.metaTitle }]}
      >
        <Button href="#how-we-work" variant="accent" arrow>
          {a.howWeWork}
        </Button>
      </PageHero>

      <Section tone="paper" aria-labelledby="who-title">
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="flex flex-col gap-8 lg:col-span-6 lg:pe-10">
            <SectionHeading eyebrow={a.whoEyebrow} title={a.whoTitle} id="who-title" />
            <p className="text-h3 font-light text-teal-900">{c.COMPANY.intro}</p>
            <p className="text-body-l text-teal-700">{c.COMPANY.statement}</p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-card)] bg-teal-900">
              <Image src={team.src} alt={team.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="stage" aria-label={a.missionVision}>
        <Container>
          <dl className="grid gap-14 md:grid-cols-2 md:gap-10">
            {[
              { label: t.common.mission, text: c.COMPANY.mission },
              { label: t.common.vision, text: c.COMPANY.vision },
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
              eyebrow={a.howWeWork}
              title={a.lifecycleTitle}
              lead={c.SERVICES_INTRO.pillars}
              tone="dark"
              id="lifecycle-title"
            />
          </Reveal>
          <div className="mt-14 md:mt-20">
            <LifecycleDiagram pillars={c.SERVICES} label={a.journey} />
          </div>
        </Container>
      </Section>

      <Section tone="paper-2" aria-labelledby="values-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t.home.valuesEyebrow}
              title={a.valuesTitle}
              lead={t.home.valuesLead}
              id="values-title"
            />
          </Reveal>
          <ValuesGrid values={c.VALUES} className="mt-14 md:mt-20" />
        </Container>
      </Section>

      <Section tone="paper" aria-labelledby="presence-title">
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:order-2 lg:col-span-6">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-card)] bg-teal-900">
              <Image src={dubai.src} alt={dubai.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-8 lg:order-1 lg:col-span-6 lg:pe-10">
            <SectionHeading
              eyebrow={a.whereEyebrow}
              title={a.whereTitle}
              lead={a.whereLead}
              id="presence-title"
            />
            <ul className="border-t border-line">
              {c.COMPANY.markets.map((m) => (
                <li key={m} className="flex items-center gap-4 border-b border-line py-5 text-h3 font-light text-teal-900">
                  <SmileArc strokeWidth={3} className="w-4 text-teal-500" />
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section tone="paper" aria-label={a.partnersLabel} className="pt-0!">
        <LogoMarquee items={c.PARTNERS} label={t.home.partnersMarquee} />
      </Section>

      <CtaBand />
    </>
  );
}
