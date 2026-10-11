import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES, getService } from "@/content/services";
import { getPostsByCategory } from "@/lib/blog";
import { pageMetadata, servicePillarJsonLd } from "@/lib/seo";
import { plain } from "@/lib/accent";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { LatestPosts } from "@/components/blog/LatestPosts";
import { ServiceDetails, ServiceExtras, ServiceIntro, ServiceNav, ServiceOverview } from "@/components/services/ServicePage";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getService(slug);
  if (!p) return {};
  return pageMetadata({ title: p.name, description: `${p.intro[0]} ${plain(p.tagline)}`.slice(0, 158), path: `/services/${p.slug}` });
}

export default async function ServicePillarPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const p = getService(slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd data={servicePillarJsonLd(p)} />
      <PageHero
        num={p.num}
        eyebrow={p.role}
        kicker={p.name}
        title={p.headline}
        lead={p.tagline}
        image={p.hero}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Services", href: "/#pillars" }, { label: p.navLabel }]}
      >
        <Button href="#services" variant="accent" arrow>
          See the services
        </Button>
        <Button href="/contact" variant="ghost-dark">
          Talk to us
        </Button>
      </PageHero>
      <ServiceIntro pillar={p} />
      <ServiceOverview pillar={p} />
      <ServiceDetails pillar={p} />
      <ServiceExtras pillar={p} />
      <LatestPosts
        posts={getPostsByCategory(p.slug)}
        eyebrow={`Insights · ${p.navLabel}`}
        title="Related *insights*."
        href={`/blog/category/${p.slug}`}
        linkLabel={`All ${p.navLabel} insights`}
        tone="paper"
        id="service-insights-title"
      />
      <ServiceNav current={p} />
      <CtaBand />
    </>
  );
}
