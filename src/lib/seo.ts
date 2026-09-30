import type { Metadata } from "next";
import type { Pillar } from "@/content/types";

export const SITE_URL = "https://growdigital.com";
export const SITE_NAME = "Grow Digital";

interface PageMetaInput {
  title: string; // without the " · Grow Digital" suffix (the root layout template adds it)
  description: string;
  path: string; // "/about"
  noindex?: boolean;
}

/** Per-page metadata: title, description, canonical URL, Open Graph and Twitter cards. */
export function pageMetadata({ title, description, path, noindex }: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${SITE_NAME}`, description, url, siteName: SITE_NAME, type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE_NAME}`, description },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-teal.png`,
    email: "info@growdigital.com",
    telephone: "+971503122672",
    slogan: "The agile integrator",
    areaServed: ["SA", "AE"],
    sameAs: [
      "https://www.linkedin.com/company/growdigitalmea",
      "https://x.com/growdigitalmea",
      "https://www.instagram.com/growdigitalmea",
      "https://www.facebook.com/growdigitalmea",
      "https://www.youtube.com/channel/UCKR9DevHgPwiMSlnFR-UVeA",
    ],
  };
}

export function serviceJsonLd(pillar: Pillar) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: pillar.name,
    serviceType: pillar.verb,
    description: pillar.oneLiner,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: ["SA", "AE"],
    url: `${SITE_URL}/pillars/${pillar.slug}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: pillar.name,
      itemListElement: pillar.services.flatMap((g) => g.items).map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
    },
  };
}
