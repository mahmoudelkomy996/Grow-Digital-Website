import type { Metadata } from "next";
import type { ServicePillar } from "@/content/services";

export const SITE_URL = "https://growdigital.com";
export const SITE_NAME = "Grow Digital";
export const SITE_DESCRIPTION =
  "Grow Digital is a business integrator for enterprises in KSA and the UAE: one accountable team to consult, transform, build, operate, secure and grow.";
/** Last content update of the static pages (used as sitemap lastModified). */
export const SITE_UPDATED = "2026-10-01";

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path === "/" ? "" : path}`);

interface PageMetaInput {
  title: string; // without the " · Grow Digital" suffix (the root layout template adds it)
  description: string;
  path: string; // "/about"
  noindex?: boolean;
}

/** Per-page metadata: title, description, canonical URL, Open Graph and Twitter cards. */
export function pageMetadata({ title, description, path, noindex }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${SITE_NAME}`, description, url: abs(path), siteName: SITE_NAME, type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE_NAME}`, description },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-teal.png`, width: 1625, height: 318 },
    description: SITE_DESCRIPTION,
    slogan: "The agile integrator",
    email: "info@growdigital.com",
    telephone: "+971503122672",
    areaServed: [
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "Country", name: "United Arab Emirates" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "info@growdigital.com",
        telephone: "+971503122672",
        areaServed: ["SA", "AE"],
        availableLanguage: ["English", "Arabic"],
      },
    ],
    knowsAbout: [
      "Digital transformation",
      "IT strategy",
      "Data and AI",
      "Generative AI",
      "Internet of Things",
      "Software development",
      "Managed services",
      "Cloud",
      "Cybersecurity",
      "Digital marketing",
    ],
    sameAs: [
      "https://www.linkedin.com/company/growdigitalmea",
      "https://x.com/growdigitalmea",
      "https://www.instagram.com/growdigitalmea",
      "https://www.facebook.com/growdigitalmea",
      "https://www.youtube.com/channel/UCKR9DevHgPwiMSlnFR-UVeA",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

/** BreadcrumbList from the same items the visible breadcrumb uses ({ label, href? }; the last item is the page). */
export function breadcrumbJsonLd(items: { label: string; href?: string }[], currentPath?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const href = item.href ?? (i === items.length - 1 ? currentPath : undefined);
      return { "@type": "ListItem", position: i + 1, name: item.label, ...(href ? { item: abs(href.split("#")[0] || "/") } : {}) };
    }),
  };
}

interface PostLd {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  cover?: string;
  category: string;
  wordCount: number;
  author: string;
}

export function blogPostingJsonLd(post: PostLd) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: post.title.slice(0, 110),
    description: post.description,
    image: [abs(post.cover ?? `/blog/${post.slug}/opengraph-image`)],
    datePublished: `${post.date}T08:00:00+03:00`,
    dateModified: `${post.updated}T08:00:00+03:00`,
    articleSection: post.category,
    wordCount: post.wordCount,
    inLanguage: "en",
    author: { "@type": "Organization", name: post.author, url: SITE_URL },
    publisher: { "@id": ORG_ID, "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-teal.png` } },
    isPartOf: { "@type": "Blog", "@id": `${SITE_URL}/blog#blog`, name: `${SITE_NAME} Insights` },
  };
}

export function blogJsonLd(posts: { slug: string; title: string; date: string }[], path = "/blog") {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    url: abs(path),
    name: `${SITE_NAME} Insights`,
    description: "Ideas and practical guidance on digital transformation, data and AI, cloud, cybersecurity and growth in KSA and the UAE.",
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.date })),
  };
}

export function servicePillarJsonLd(p: ServicePillar) {
  const url = `${SITE_URL}/services/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: p.name,
    description: p.intro[0],
    provider: { "@id": ORG_ID, "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: [
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "Country", name: "United Arab Emirates" },
    ],
    url,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: p.name,
      itemListElement: p.groups.map((g) => ({
        "@type": "OfferCatalog",
        name: g.name,
        itemListElement: g.services.map((sv) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: sv.name, description: sv.body[0], url: `${url}#${sv.id}` },
        })),
      })),
    },
  };
}
