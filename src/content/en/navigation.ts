// Navigation words (English). Structure and service menus come from ../nav.ts.
import { buildNavigation, type NavStrings } from "../nav.ts";
import { SERVICES } from "./services.ts";

const STRINGS: NavStrings = {
  menuTitles: {
    consultancy: "Consultancy & Digital *Transformation*",
    "managed-services": "GrowShield™ Managed *Services*",
    "software-development": "Software *Development*",
    "digital-marketing": "Digital *Marketing*",
  },
  menuIntros: {
    consultancy: "Decide where to invest in digital, then stay with it until the investment pays back. Four practices, each answering a leadership question.",
    "managed-services": "Built on three commitments: protection, stability and proactive support, across ten service areas.",
    "software-development": "The full range of software development: mobile, web, business applications and artificial intelligence.",
    "digital-marketing": "Build presence, generate leads and grow sales. Every program starts with an audit; every month you see what your budget delivered.",
  },
  explore: (p) => `Explore ${p.navLabel.toLowerCase()}`,
  coveragePromo: {
    eyebrow: "GrowShield™",
    title: "Protection. Stability. Proactive support.",
    body: "Full, partial or co-managed coverage, staffed the way that suits you.",
  },
  shortModel: (name) => name.replace(/ Managed Services| Support| Model/g, ""),
  productsPromo: { eyebrow: "Our products", title: "Built for the sectors we know best." },
  packagesPromo: { eyebrow: "Packages", title: "Start with an audit. Grow every month." },
  insights: "Insights",
  company: {
    label: "Company",
    menu: {
      eyebrow: "Company",
      title: "One accountable *team*.",
      intro: "A technology and growth partner established in the UAE, serving the Gulf with a dedicated focus on Saudi Arabia.",
      explore: "Talk to us",
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
    },
  },
  cta: "Talk to us",
  footer: {
    services: "Services",
    company: "Company",
    contact: "Contact",
    follow: "Follow",
    links: [
      { label: "About", href: "/about" },
      { label: "Use cases", href: "/use-cases" },
      { label: "Partners", href: "/partners" },
      { label: "Insights", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  markets: "Kingdom of Saudi Arabia · United Arab Emirates",
  tagline: "It's time to *grow*.",
  copyright: "© 2026 Grow Digital. All rights reserved.",
};

export const { NAV, NAV_CTA, FOOTER_LINKS, CONTACT, COPYRIGHT } = buildNavigation(SERVICES, STRINGS);
