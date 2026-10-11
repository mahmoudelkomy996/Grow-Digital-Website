// Site navigation builder: header (one dropdown per service pillar), mobile menu and footer.
// Service menus are derived from the locale's service pillars so the menu and the pages never drift apart;
// each locale (en/navigation.ts, ar/navigation.ts) supplies only the words.
import type { FooterColumn, NavItem, NavLink, NavMenu, NavMenuGroup, ServicePillar, ServiceSlug } from "./types.ts";

export interface NavStrings {
  /** Panel titles per pillar; one word in *asterisks* gets the serif accent */
  menuTitles: Record<ServiceSlug, string>;
  menuIntros: Record<ServiceSlug, string>;
  /** "Explore consultancy" */
  explore: (p: ServicePillar) => string;
  coveragePromo: { eyebrow: string; title: string; body: string };
  /** Shortens a coverage-model name for the promo line ("Full Managed Services" → "Full") */
  shortModel: (name: string) => string;
  productsPromo: { eyebrow: string; title: string };
  packagesPromo: { eyebrow: string; title: string };
  insights: string;
  company: { label: string; menu: Omit<NavMenu, "id" | "explore"> & { explore: string } };
  cta: string;
  footer: { services: string; company: string; contact: string; follow: string; links: NavLink[] };
  markets: string;
  tagline: string;
  copyright: string;
}

export const CONTACT = {
  email: "info@growdigital.com",
  emailHref: "mailto:info@growdigital.com",
  phone: "+971 50 3122672",
  phoneHref: "tel:+971503122672",
} as const;

const SOCIAL: NavLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/growdigitalmea", external: true },
  { label: "X", href: "https://x.com/growdigitalmea", external: true },
  { label: "Instagram", href: "https://www.instagram.com/growdigitalmea", external: true },
  { label: "Facebook", href: "https://www.facebook.com/growdigitalmea", external: true },
  { label: "YouTube", href: "https://www.youtube.com/@growdigitalmea", external: true },
];

const href = (p: ServicePillar, anchor?: string) => `/services/${p.slug}${anchor ? `#${anchor}` : ""}`;

function serviceMenu(p: ServicePillar, t: NavStrings): NavMenu {
  const multi = p.groups.length > 1;
  const groups: NavMenuGroup[] = p.groups.map((g) => ({
    title: multi ? g.name : undefined,
    question: g.question,
    links: g.services.map((sv) => ({ label: sv.name, href: href(p, sv.id), summary: multi ? undefined : sv.summary })),
  }));
  let promo: NavMenu["promo"];
  if (p.coverage)
    promo = {
      ...t.coveragePromo,
      items: p.coverage.map((c) => ({ name: c.title, text: c.rows.map((r) => t.shortModel(r.name)).join(" · "), href: href(p, "models") })),
    };
  if (p.products)
    promo = { ...t.productsPromo, items: p.products.items.map((x) => ({ name: x.name, text: x.text.replace(/[.。]$/, ""), href: href(p, "products") })) };
  if (p.packages)
    promo = { ...t.packagesPromo, items: p.packages.items.map((x) => ({ name: x.name, text: x.bestFor, href: href(p, "packages") })) };
  return {
    id: p.slug,
    num: p.num,
    eyebrow: `${p.num} · ${p.name}`,
    title: t.menuTitles[p.slug],
    intro: t.menuIntros[p.slug],
    explore: { label: t.explore(p), href: href(p) },
    groups,
    promo,
  };
}

export function buildNavigation(services: ServicePillar[], t: NavStrings) {
  const NAV: NavItem[] = [
    ...services.map((p) => ({ label: p.navLabel, href: href(p), menu: serviceMenu(p, t) })),
    { label: t.insights, href: "/blog" },
    { label: t.company.label, href: "/about", menu: { ...t.company.menu, id: "company", explore: { label: t.company.menu.explore, href: "/contact" } } },
  ];
  const NAV_CTA: NavLink = { label: t.cta, href: "/contact" };
  const FOOTER_LINKS: FooterColumn[] = [
    { title: t.footer.services, links: services.map((p) => ({ label: p.name, href: href(p), prefix: p.num })) },
    { title: t.footer.company, links: t.footer.links },
    {
      title: t.footer.contact,
      links: [
        { label: CONTACT.email, href: CONTACT.emailHref },
        { label: CONTACT.phone, href: CONTACT.phoneHref },
      ],
    },
    { title: t.footer.follow, links: SOCIAL },
  ];
  return { NAV, NAV_CTA, FOOTER_LINKS, CONTACT: { ...CONTACT, markets: t.markets, tagline: t.tagline }, COPYRIGHT: t.copyright };
}
