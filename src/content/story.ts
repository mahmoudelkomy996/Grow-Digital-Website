// Copy for the homepage 3D growth story.
// The tree scene runs a fixed 9-beat timeline (s = p * 9: seed, shoot, data, modules, dial, shield,
// fruit, canopy, finale). The four service pillars are laid over it in lifecycle order; each chapter
// owns the scene beats in its `span`:
//   We advise  (Consultancy)        s 1-3  seed opens, first shoot, data streams reach the decision node
//   We build   (Software)           s 3-4  modules assemble along the branch
//   We operate (Managed Services)   s 4-6  24-hour dial, then the GrowShield™ canopy shell
//   We market  (Digital Marketing)  s 6-8  results ripen as fruit, the canopy fills in
import type { ServiceSlug } from "./services.ts";
import type { StoryChapter } from "./types.ts";

export interface GrowthChapter {
  id: "intro" | ServiceSlug | "finale";
  /** "We advise" etc.; "" for intro/finale */
  role: string;
  name: string;
  full: string;
  /** Headline with one word wrapped in *asterisks* for the serif accent */
  title: string;
  lead: string;
  /** One caption per scene beat, for chapters that span two beats */
  beats?: string[];
  chips: string[];
  /** Scene beats [from, to) this chapter owns, in story units s = p * 9 */
  span: [number, number];
  href?: string;
}

export const STORY: GrowthChapter[] = [
  {
    id: "intro", role: "", name: "Grow Digital", full: "Technology & growth partner",
    title: "It's time to *grow*.",
    lead: "Four pillars, one accountable team: we advise, build, operate and market the systems your growth depends on.",
    chips: [], span: [0, 1],
  },
  {
    id: "consultancy", role: "We advise", name: "Consultancy", full: "Consultancy & Digital Transformation",
    title: "Direction you can take to the *board*.",
    lead: "Where to invest in digital, and in what order. Strategy, governance and industry advice across 17 services.",
    beats: ["Strategy & transformation", "Data & AI strategy"],
    chips: ["Digital Transformation", "Data & AI Strategy", "Project Management Office (PMO)", "Cybersecurity Consultancy"],
    span: [1, 3], href: "/services/consultancy",
  },
  {
    id: "software-development", role: "We build", name: "Software", full: "Software Development",
    title: "Software people *finish* using.",
    lead: "Mobile, web, business applications and AI, plus our own products for the sectors we know best.",
    chips: ["Mobile Development", "Web Development", "Application Development", "Artificial Intelligence"],
    span: [3, 4], href: "/services/software-development",
  },
  {
    id: "managed-services", role: "We operate", name: "Managed Services", full: "GrowShield™ Managed Services",
    title: "IT operations you can *hand over*.",
    lead: "Protection, stability and proactive support across ten service areas, fully, partially or co-managed.",
    beats: ["Around-the-clock operations", "Protected by GrowShield™"],
    chips: ["Service Desk & End-user Support", "Cloud Operations", "Cybersecurity Operations", "Infrastructure & Data Center"],
    span: [4, 6], href: "/services/managed-services",
  },
  {
    id: "digital-marketing", role: "We market", name: "Digital Marketing", full: "Digital Marketing",
    title: "Growth you can *measure*.",
    lead: "Presence, leads and sales growth, with Starter, Growth and Premium packages to match your stage.",
    beats: ["Leads and sales that ripen", "A presence that keeps growing"],
    chips: ["Paid Media", "Social Media Management", "Search & Website", "Analytics & Reporting"],
    span: [6, 8], href: "/services/digital-marketing",
  },
  {
    id: "finale", role: "", name: "", full: "",
    title: "Advise. Build. Operate. *Market*.",
    lead: "Four pillars and one accountable team for organizations across KSA and the UAE.",
    chips: [], span: [8, 9], href: "/contact",
  },
];

/** @deprecated The 7-pillar story copy; still read by the legacy pillar content (pillars.ts, NAV_PILLARS). */
export const LEGACY_STORY: StoryChapter[] = [
  {
    id: "intro", num: "", name: "Grow Digital", full: "The agile integrator",
    title: "It's time to *grow*.",
    lead: "One accountable team that designs, builds, operates and markets the systems your revenue depends on.",
    chips: [],
  },
  {
    id: "consult", num: "01", name: "Consult", full: "Consulting & Advisory",
    title: "Direction before *investment*.",
    lead: "Strategy, architecture and governance that turn transformation into an executive-aligned roadmap.",
    chips: ["Digital Transformation Strategy", "IT Strategy & Roadmap", "Enterprise Architecture Advisory", "PMO & Program Management"],
    href: "/services/consultancy",
  },
  {
    id: "transform", num: "02", name: "Transform", full: "Data, AI & IoT",
    title: "Data into *decisions*.",
    lead: "Predictive models, AI agents and IoT platforms that hold up in production, not just in a demo.",
    chips: ["Data Strategy & Governance", "Generative AI & AI Agents", "Predictive Analytics & ML", "IoT Platforms"],
    href: "/services/software-development",
  },
  {
    id: "build", num: "03", name: "Build", full: "Software Development & Digital Experience",
    title: "Software people *finish* using.",
    lead: "Web, mobile and custom applications measured on load time and conversion, not screenshots.",
    chips: ["Web & Mobile Apps", "Custom Applications", "UX/UI Design", "API & Integration"],
    href: "/services/software-development",
  },
  {
    id: "operate", num: "04", name: "Operate", full: "Managed Services",
    title: "Systems that never *sleep*.",
    lead: "SLA-based L1–L3 support, cloud operations and monitoring that keep revenue systems running.",
    chips: ["Cloud Managed Services", "Application Managed Services", "Infrastructure Monitoring", "GrowShield™"],
    href: "/services/managed-services",
  },
  {
    id: "secure", num: "05", name: "Secure", full: "Cybersecurity",
    title: "Defense shaped to your *risk*.",
    lead: "Security built around your actual attack surface, with 24/7 vigilance and governance you can audit.",
    chips: ["Strategy & Roadmap", "Assessment & Audit", "Governance, Risk & Compliance", "Incident Response"],
    href: "/services/managed-services",
  },
  {
    id: "solve", num: "06", name: "Solve", full: "Digital, Cloud & AI Solutions",
    title: "Products that deliver *value*.",
    lead: "Our own AI platforms, plus partner solutions we exclusively represent in KSA and the UAE.",
    chips: ["Grow Bot", "Medical Decision Intelligence", "ATHAR EMR", "InCommerce by Inveon", "OneStore by Mobilgi"],
    href: "/services/software-development#products",
  },
  {
    id: "grow", num: "07", name: "Grow", full: "Marketing & Growth",
    title: "Growth you can *measure*.",
    lead: "Strategy, performance marketing and GrowthLab analytics pulled together, with no siloed tactics.",
    chips: ["Digital Marketing Strategy", "Performance Marketing", "GrowthLab Analytics", "Go-to-Market Strategy"],
    href: "/services/digital-marketing",
  },
  {
    id: "finale", num: "", name: "", full: "",
    title: "Consult. Transform. Build. Operate. Secure. *Grow*.",
    lead: "Supported by our own digital and AI solutions, for enterprises across KSA and the UAE.",
    chips: [],
    href: "/contact",
  },
];
