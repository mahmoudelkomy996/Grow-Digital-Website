// Single entry point for all site content.
// Localized pages and components read a whole bundle with getContent(locale) (or getContent() from
// @/i18n/server, which reads the current locale). The plain named exports below are the English bundle,
// for English-only surfaces (blog, RSS, llms.txt, Open Graph images, sitemap).
import type { Locale } from "../i18n/config.ts";
import * as en from "./en/index.ts";
import * as ar from "./ar/index.ts";
import type { Partner, ServicePillar } from "./types.ts";

export type * from "./types.ts";
export { IMAGES } from "./images.ts";
export type { ImageId, ImageSpec, Aspect } from "./images.ts";

export type Content = typeof en;

const BUNDLES: Record<Locale, Content> = { en, ar };

export function getContent(locale: Locale): Content {
  return BUNDLES[locale];
}

export function getService(slug: string, content: Content = en): ServicePillar | undefined {
  return content.SERVICES.find((p) => p.slug === slug);
}

export function serviceCount(p: ServicePillar) {
  return p.groups.reduce((n, g) => n + g.services.length, 0);
}

export function partnersInGroup(group: Partner["group"], content: Content = en): Partner[] {
  return content.PARTNERS.filter((p) => p.group === group);
}

export const {
  COMPANY,
  SOLUTIONS,
  USE_CASES,
  PARTNERS,
  PARTNER_GROUPS,
  CLIENT_SECTORS,
  CLIENTS_TITLE,
  KEY_PROJECTS,
  KEY_PROJECTS_NOTE,
  REFERENCE_GROUPS,
  VALUES,
  INDUSTRIES,
  METRICS,
  STORY,
  SERVICES,
  SERVICES_INTRO,
} = en;
