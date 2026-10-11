// Site navigation: header (one dropdown per service pillar), mobile menu and footer.
// Service menus are derived from src/content/services.ts so the menu and the pages never drift apart.
// Company facts are hard-coded here on purpose (the chrome must not depend on the content index).
import { LEGACY_STORY as STORY } from "./story.ts";
import { SERVICES, type ServicePillar } from "./services.ts";
import type { PillarSlug } from "./types.ts";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavMenuLink extends NavLink {
  /** One-line description under the link (single-group menus) */
  summary?: string;
}

export interface NavMenuGroup {
  title?: string;
  /** Consultancy practices: the leadership question each practice answers */
  question?: string;
  links: NavMenuLink[];
}

export interface NavMenu {
  id: string; // "consultancy"
  num?: string; // "01"
  eyebrow: string;
  /** Panel title; one word in *asterisks* gets the serif accent */
  title: string;
  intro: string;
  explore: NavLink;
  groups: NavMenuGroup[];
  promo?: { eyebrow: string; title: string; body?: string; items?: { name: string; text: string; href?: string }[] };
}

export interface NavItem extends NavLink {
  /** Present on items that open a dropdown panel */
  menu?: NavMenu;
}

export interface FooterColumn {
  title: string;
  links: (NavLink & { prefix?: string })[];
}

const href = (p: ServicePillar, anchor?: string) => `/services/${p.slug}${anchor ? `#${anchor}` : ""}`;

function serviceMenu(p: ServicePillar): NavMenu {
  const multi = p.groups.length > 1;
  const groups: NavMenuGroup[] = p.groups.map((g) => ({
    title: multi ? g.name : undefined,
    question: g.question,
    links: g.services.map((sv) => ({ label: sv.name, href: href(p, sv.id), summary: multi ? undefined : sv.summary })),
  }));
  const titles: Record<string, string> = {
    consultancy: "Consultancy & Digital *Transformation*",
    "managed-services": "GrowShield™ Managed *Services*",
    "software-development": "Software *Development*",
    "digital-marketing": "Digital *Marketing*",
  };
  const intros: Record<string, string> = {
    consultancy: "Decide where to invest in digital, then stay with it until the investment pays back. Four practices, each answering a leadership question.",
    "managed-services": "Built on three commitments: protection, stability and proactive support, across ten service areas.",
    "software-development": "The full range of software development: mobile, web, business applications and artificial intelligence.",
    "digital-marketing": "Build presence, generate leads and grow sales. Every program starts with an audit; every month you see what your budget delivered.",
  };
  let promo: NavMenu["promo"];
  if (p.coverage)
    promo = {
      eyebrow: "GrowShield™",
      title: "Protection. Stability. Proactive support.",
      body: "Full, partial or co-managed coverage, staffed the way that suits you.",
      items: p.coverage.map((c) => ({ name: c.title, text: c.rows.map((r) => r.name.replace(/ Managed Services| Support| Model/g, "")).join(" · "), href: href(p, "models") })),
    };
  if (p.products)
    promo = {
      eyebrow: "Our products",
      title: "Built for the sectors we know best.",
      items: p.products.items.map((x) => ({ name: x.name, text: x.text.replace(/\.$/, ""), href: href(p, "products") })),
    };
  if (p.packages)
    promo = {
      eyebrow: "Packages",
      title: "Start with an audit. Grow every month.",
      items: p.packages.items.map((x) => ({ name: x.name, text: x.bestFor, href: href(p, "packages") })),
    };
  return {
    id: p.slug,
    num: p.num,
    eyebrow: `${p.num} · ${p.name}`,
    title: titles[p.slug],
    intro: intros[p.slug],
    explore: { label: `Explore ${p.navLabel.toLowerCase()}`, href: href(p) },
    groups,
    promo,
  };
}

const COMPANY_MENU: NavMenu = {
  id: "company",
  eyebrow: "Company",
  title: "One accountable *team*.",
  intro: "A technology and growth partner established in the UAE, serving the Gulf with a dedicated focus on Saudi Arabia.",
  explore: { label: "Talk to us", href: "/contact" },
  groups: [
    {
      links: [
        { label: "About us", href: "/about", summary: "Mission, vision, values and how we work." },
        { label: "Use cases", href: "/use-cases", summary: "AI and IoT programs with measured results." },
        { label: "Partners & clients", href: "/partners", summary: "Who we deliver with, and for." },
        { label: "Contact", href: "/contact", summary: "info@growdigital.com · +971 50 3122672" },
      ],
    },
  ],
  promo: {
    eyebrow: "How we work",
    title: "We advise, we build, we market and we operate.",
    body: "Four pillars covering the full journey from the first idea to daily operations.",
  },
};

export const NAV: NavItem[] = [
  ...SERVICES.map((p) => ({ label: p.navLabel, href: href(p), menu: serviceMenu(p) })),
  { label: "Insights", href: "/blog" },
  { label: "Company", href: "/about", menu: COMPANY_MENU },
];

export const NAV_CTA: NavLink = { label: "Talk to us", href: "/contact" };

/** Service pillars for compact lists (footer, mobile, cards). */
export const NAV_SERVICES = SERVICES.map((p) => ({ slug: p.slug, num: p.num, name: p.name, label: p.navLabel, tagline: p.tagline, href: href(p) }));

// ── Legacy: the 7-pillar content (design-system samples, PillarNav) still uses these ───────
export interface NavPillar {
  slug: PillarSlug;
  num: string;
  name: string;
  full: string;
  featured: string[];
  href: string;
}
const PILLAR_IDS = new Set<string>(["consult", "transform", "build", "operate", "secure", "solve", "grow"]);
export const NAV_PILLARS: NavPillar[] = STORY.filter((c) => PILLAR_IDS.has(c.id)).map((c) => ({
  slug: c.id as PillarSlug,
  num: c.num,
  name: c.name,
  full: c.full,
  featured: c.chips.slice(0, 3),
  href: c.href ?? "/#pillars",
}));

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
    title: "Services",
    links: NAV_SERVICES.map((p) => ({ label: p.name, href: p.href, prefix: p.num })),
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
