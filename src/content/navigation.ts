// Site navigation: header, mega menu, mobile menu and footer.
// Pillar entries are derived from the homepage story so the menu, footer and 3D chapters never drift apart.
// Company facts are hard-coded here on purpose (the chrome must not depend on the content index).
import { STORY } from "./story.ts";
import type { PillarSlug } from "./types.ts";

export interface NavPillar {
  slug: PillarSlug;
  num: string; // "01"
  name: string; // "Consult"
  full: string; // "Consulting & Advisory"
  /** Three featured services shown in the mega menu */
  featured: string[];
  href: string; // "/pillars/consult"
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavItem extends NavLink {
  /** Present on "Pillars" only: opens the mega menu */
  children?: NavPillar[];
}

export interface FooterColumn {
  title: string;
  links: (NavLink & { prefix?: string })[];
}

const PILLAR_IDS = new Set<string>(["consult", "transform", "build", "operate", "secure", "solve", "grow"]);

export const NAV_PILLARS: NavPillar[] = STORY.filter((c) => PILLAR_IDS.has(c.id)).map((c) => ({
  slug: c.id as PillarSlug,
  num: c.num,
  name: c.name,
  full: c.full,
  featured: c.chips.slice(0, 3),
  href: c.href ?? `/pillars/${c.id}`,
}));

export const NAV: NavItem[] = [
  { label: "Pillars", href: "/#pillars", children: NAV_PILLARS },
  { label: "Solutions", href: "/pillars/solve" },
  { label: "Use cases", href: "/use-cases" },
  { label: "Partners", href: "/partners" },
  { label: "Insights", href: "/blog" },
  { label: "About", href: "/about" },
];

export const NAV_CTA: NavLink = { label: "Talk to us", href: "/contact" };

/** Mega menu promo block */
export const NAV_PROMO: NavLink & { eyebrow: string; body: string } = {
  eyebrow: "The growth story",
  label: "See how the pillars connect",
  body: "Seven pillars, one accountable team. Follow a seed as it grows from strategy to measurable growth.",
  href: "/#story",
};

export const CONTACT = {
  email: "info@growdigital.com",
  emailHref: "mailto:info@growdigital.com",
  phone: "+971 50 3122672",
  phoneHref: "tel:+971503122672",
  markets: "Kingdom of Saudi Arabia · United Arab Emirates",
  tagline: "It's time to *grow*.",
} as const;

export const SOCIAL: NavLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/growdigitalmea", external: true },
  { label: "X", href: "https://x.com/growdigitalmea", external: true },
  { label: "Instagram", href: "https://www.instagram.com/growdigitalmea", external: true },
  { label: "Facebook", href: "https://www.facebook.com/growdigitalmea", external: true },
  { label: "YouTube", href: "https://www.youtube.com/@growdigitalmea", external: true },
];

export const FOOTER_LINKS: FooterColumn[] = [
  {
    title: "Pillars",
    links: NAV_PILLARS.map((p) => ({ label: p.name, href: p.href, prefix: p.num })),
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Use cases", href: "/use-cases" },
      { label: "Partners", href: "/partners" },
      { label: "Insights", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: CONTACT.email, href: CONTACT.emailHref },
      { label: CONTACT.phone, href: CONTACT.phoneHref },
    ],
  },
  { title: "Follow", links: SOCIAL },
];

export const COPYRIGHT = "© 2026 Grow Digital. All rights reserved.";
