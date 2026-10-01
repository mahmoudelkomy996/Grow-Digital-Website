import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PILLARS, getPillar } from "@/content";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { PillarNav } from "@/components/sections/PillarNav";
import { PILLARS_WITH_PARTNER_EXTRAS, PillarExtras } from "@/components/pillar/PillarExtras";
import {
  PillarDeepDives,
  PillarIntro,
  PillarPartners,
  PillarServices,
  PillarUseCases,
} from "@/components/pillar/PillarSections";

export const dynamicParams = false;

export function generateStaticParams() {
  return PILLARS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/pillars/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pillar = getPillar(slug);
  if (!pillar) return {};
  return pageMetadata({
    title: `${pillar.verb} — ${pillar.name}`,
    description: pillar.oneLiner,
    path: `/pillars/${pillar.slug}`,
  });
}

export default async function PillarPage({ params }: PageProps<"/pillars/[slug]">) {
  const { slug } = await params;
  const pillar = getPillar(slug);
  if (!pillar) notFound();

  return (
    <>
      <JsonLd data={serviceJsonLd(pillar)} />
      <PageHero
        num={pillar.num}
        eyebrow={pillar.verb}
        kicker={pillar.name}
        title={pillar.headline}
        lead={pillar.oneLiner}
        image={pillar.hero}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Pillars", href: "/#pillars" },
          { label: pillar.verb },
        ]}
      >
        <Button href="#services" variant="accent" arrow>
          See the services
        </Button>
        <Button href="/contact" variant="ghost-dark">
          Talk to us
        </Button>
      </PageHero>
      <PillarIntro pillar={pillar} />
      <PillarServices pillar={pillar} />
      <PillarDeepDives pillar={pillar} />
      <PillarExtras pillar={pillar} />
      <PillarUseCases pillar={pillar} />
      {PILLARS_WITH_PARTNER_EXTRAS.has(pillar.slug) ? null : <PillarPartners pillar={pillar} />}
      <PillarNav current={pillar.slug} />
      <CtaBand />
    </>
  );
}
