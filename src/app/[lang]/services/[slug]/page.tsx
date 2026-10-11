import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES, getService } from "@/content";
import { getPostsByCategory } from "@/lib/blog";
import { pageMetadata, servicePillarJsonLd } from "@/lib/seo";
import { plain } from "@/lib/accent";
import { BLOG_LOCALES } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { LatestPosts } from "@/components/blog/LatestPosts";
import { ServiceDetails, ServiceExtras, ServiceIntro, ServiceNav, ServiceOverview } from "@/components/services/ServicePage";

export const dynamicParams = false;

// Slugs are shared by every locale (the [lang] layout supplies the locales).
export function generateStaticParams() {
  return SERVICES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { locale, c } = await getI18n();
  const p = getService(slug, c);
  if (!p) return {};
  return pageMetadata({ title: p.name, description: `${p.intro[0]} ${plain(p.tagline)}`.slice(0, 158), path: `/services/${p.slug}`, locale });
}

export default async function ServicePillarPage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { slug } = await params;
  const { locale, c, t } = await getI18n();
  const p = getService(slug, c);
  if (!p) notFound();

  return (
    <>
      <JsonLd data={servicePillarJsonLd(p, locale)} />
      <PageHero
        num={p.num}
        eyebrow={p.role}
        kicker={p.name}
        title={p.headline}
        lead={p.tagline}
        image={p.hero}
        breadcrumb={[{ label: t.common.home, href: "/" }, { label: t.service.breadcrumb, href: "/#pillars" }, { label: p.navLabel }]}
      >
        <Button href="#services" variant="accent" arrow>
          {t.service.seeServices}
        </Button>
        <Button href="/contact" variant="ghost-dark">
          {t.common.talkToUs}
        </Button>
      </PageHero>

      <ServiceIntro pillar={p} />
      <ServiceOverview pillar={p} />
      <ServiceDetails pillar={p} />
      <ServiceExtras pillar={p} />

      {BLOG_LOCALES.includes(locale) ? (
        <LatestPosts
          posts={getPostsByCategory(p.slug)}
          eyebrow={t.service.insightsEyebrow(p.navLabel)}
          title={t.service.insightsTitle}
          href={`/blog/category/${p.slug}`}
          linkLabel={t.service.allInsights(p.navLabel)}
          tone="paper"
          id="service-insights-title"
        />
      ) : null}

      <ServiceNav current={p} />
      <CtaBand />
    </>
  );
}
