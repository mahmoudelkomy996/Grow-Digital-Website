import type { Metadata } from "next";
import { METRICS, SERVICES, SERVICES_INTRO, VALUES } from "@/content";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";
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

const base = pageMetadata({
  title: "The agile integrator",
  description:
    "One accountable team to consult, transform, build, operate, secure and grow the systems your revenue depends on, for enterprises across KSA and the UAE.",
  path: "/",
});

export const metadata: Metadata = { ...base, title: { absolute: "Grow Digital — The agile integrator" } };

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Preloader />
      <GrowthStory />
      <IntegratorStatement />
      <MetricBand metrics={METRICS} eyebrow="Impact, in numbers" />

      <Section tone="paper" id="pillars" aria-labelledby="pillars-title" className="scroll-mt-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our services"
              title="Four pillars. One accountable *team*."
              lead={SERVICES_INTRO.pillars}
              id="pillars-title"
            />
          </Reveal>
          <ServicePillarGrid pillars={SERVICES} className="mt-14 md:mt-20" />
        </Container>
      </Section>

      <FeaturedUseCases />
      <SolutionsShowcase />
      <IndustryTiles />
      <PartnersAndClients />
      <LatestPosts posts={getAllPosts()} title="Ideas from the *field*." />

      <Section tone="paper" aria-labelledby="values-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our values"
              title="How we *work*, every day."
              lead="Seven values that shape how one team delivers, across roles and locations."
              id="values-title"
            />
          </Reveal>
          <ValuesGrid values={VALUES} className="mt-14 md:mt-20" />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
