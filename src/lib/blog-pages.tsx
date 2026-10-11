// Shared rendering + metadata for the blog listing routes (/blog, /blog/page/[n], /blog/category/[c](/page/[n])).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ServiceSlug } from "@/content";
import { getService } from "@/content";
import { getAllPosts, getPostsByCategory, paginate } from "@/lib/blog";
import { blogJsonLd, pageMetadata } from "@/lib/seo";
import { BLOG_LOCALES } from "@/i18n/config";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { BlogIndex } from "@/components/blog/BlogIndex";

const BLOG_DESCRIPTION =
  "Insights from Grow Digital on digital transformation, data and AI, IoT, cloud, cybersecurity, e-commerce and marketing for enterprises in KSA and the UAE.";

function resolve(category: string | undefined, pageParam: string | undefined) {
  const page = pageParam === undefined ? 1 : Number(pageParam);
  if (!Number.isInteger(page) || page < 1) return null;
  const pillar = category ? getService(category) : undefined;
  if (category && !pillar) return null;
  const all = pillar ? getPostsByCategory(pillar.slug) : getAllPosts();
  const result = paginate(all, page);
  if (page > result.totalPages || !all.length) return null;
  const base = pillar ? `/blog/category/${pillar.slug}` : "/blog";
  const path = page === 1 ? base : `${base}/page/${page}`;
  return { ...result, pillar, base, path };
}

export function blogListingMetadata(category?: string, pageParam?: string): Metadata {
  const r = resolve(category, pageParam);
  if (!r) return {};
  const title = `${r.pillar ? `${r.pillar.verb} insights` : "Insights"}${r.page > 1 ? ` — page ${r.page}` : ""}`;
  const description = r.pillar
    ? `Articles on ${r.pillar.name.toLowerCase()} from Grow Digital: ${r.pillar.oneLiner}`
    : BLOG_DESCRIPTION;
  const meta = pageMetadata({ title, description, path: r.path });
  return { ...meta, alternates: { ...meta.alternates, types: { "application/rss+xml": "/blog/rss.xml" } } };
}

export function BlogListingPage({ category, page: pageParam }: { category?: string; page?: string }) {
  const r = resolve(category, pageParam);
  if (!r) notFound();
  const { pillar } = r;
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Insights", href: pillar || r.page > 1 ? "/blog" : undefined },
    ...(pillar ? [{ label: pillar.verb, href: r.page > 1 ? r.base : undefined }] : []),
    ...(r.page > 1 ? [{ label: `Page ${r.page}` }] : []),
  ];
  return (
    <>
      <JsonLd data={blogJsonLd(r.items, r.path)} />
      <PageHero
        eyebrow={pillar ? `Insights · ${pillar.verb}` : "Insights"}
        num={pillar?.num}
        title={pillar ? `${pillar.name} *insights*.` : "Ideas that help businesses *grow*."}
        lead={
          pillar
            ? pillar.oneLiner
            : "Practical thinking on digital transformation, data and AI, cloud, cybersecurity and growth, for enterprises across KSA and the UAE."
        }
        breadcrumb={crumbs}
      />
      <BlogIndex posts={r.items} page={r.page} totalPages={r.totalPages} base={r.base} category={pillar?.slug as ServiceSlug | undefined} />
      <CtaBand title="Turn the ideas into *results*." />
    </>
  );
}

/** Static params helpers */
export function blogPageParams(category?: ServiceSlug) {
  const all = category ? getPostsByCategory(category) : getAllPosts();
  const { totalPages } = paginate(all, 1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => String(i + 2));
}

/**
 * Static params for a blog route, for the locales that have the blog only. The child segment returns the
 * [lang] param itself: the parent's params are not passed down to these generateStaticParams.
 */
export function inBlogLocales<T extends object>(params: T[]): (T & { lang: string })[] {
  return BLOG_LOCALES.flatMap((lang) => params.map((p) => ({ lang, ...p })));
}
