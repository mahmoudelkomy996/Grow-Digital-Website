import type { Metadata } from "next";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";
import { BLOG_LOCALES } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { LatestPosts } from "@/components/blog/LatestPosts";
import { JsonLd } from "@/components/seo/JsonLd";
import { GrowthStory } from "@/components/story/GrowthStory";
import { Preloader } from "@/components/home/Preloader";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaBand } from "@/components/sections/CtaBand";
import { MetricBand } from "@/components/sections/MetricBand";
import { ServicePillarGrid } from "@/components/services/ServicePillarGrid";
import { ValuesGrid } from "@/components/sections/ValuesGrid";
import { FeaturedUseCases } from "@/components/home/FeaturedUseCases";
import { IndustryTiles } from "@/components/home/IndustryTiles";
import { IntegratorStatement } from "@/components/home/IntegratorStatement";
import { PartnersAndClients } from "@/components/home/PartnersAndClients";
import { SolutionsShowcase } from "@/components/home/SolutionsShowcase";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const base = pageMetadata({ title: t.meta.homeTitle, description: t.meta.homeDescription, path: "/", locale });
  return { ...base, title: { absolute: t.meta.siteTitle } };
}

export default async function Home() {
  const { locale, c, t } = await getI18n();
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd(locale)} />
      <Preloader />
      <GrowthStory story={c.STORY} />
      <IntegratorStatement />
      <MetricBand metrics={c.METRICS} eyebrow={t.home.impact} />

      <Section tone="paper" id="pillars" aria-labelledby="pillars-title" className="scroll-mt-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t.home.pillarsEyebrow}
              title={t.home.pillarsTitle}
              lead={c.SERVICES_INTRO.pillars}
              id="pillars-title"
            />
          </Reveal>
          <ServicePillarGrid pillars={c.SERVICES} className="mt-14 md:mt-20" />
        </Container>
      </Section>

      <FeaturedUseCases />
      <SolutionsShowcase />
      <IndustryTiles />
      <PartnersAndClients />
      {BLOG_LOCALES.includes(locale) ? <LatestPosts posts={getAllPosts()} title={t.home.insightsTitle} /> : null}

      <Section tone="paper" aria-labelledby="values-title">
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t.home.valuesEyebrow} title={t.home.valuesTitle} lead={t.home.valuesLead} id="values-title" />
          </Reveal>
          <ValuesGrid values={c.VALUES} className="mt-14 md:mt-20" />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
