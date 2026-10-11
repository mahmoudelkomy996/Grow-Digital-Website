// Content model for the whole site. Pages render only from these typed modules.

export type IndustryId =
  | "healthcare"
  | "government"
  | "real-estate"
  | "retail"
  | "financial-services"
  | "manufacturing"
  | "aviation";

export interface ImageRef {
  /** Path under /public, e.g. "/images/pillars/consult-hero.jpg" */
  src: string;
  alt: string;
}

export interface Company {
  name: string;
  tagline: string; // "It's time to grow."
  positioning: string; // "The agile integrator"
  statement: string; // "We help organizations CONSULT, TRANSFORM, ..."
  intro: string; // the integrator paragraph
  proof: string; // "We run the systems our clients' revenue depends on..."
  mission: string;
  vision: string;
  email: string;
  phone: string;
  phoneHref: string; // tel: link value
  markets: string[];
  social: { label: string; href: string }[];
}

export interface Solution {
  id: string;
  name: string; // "Grow Bot"
  by: string; // "Grow Digital" | "Inveon" | "Mobilgi"
  kind: "own" | "partner";
  category: string; // "Enterprise AI Assistant & Conversational AI Platform"
  description: string;
  features: string[];
  image: ImageRef;
  partnerId?: string;
}

export interface UseCaseResult {
  value: string; // "71%"
  label: string; // "increase in campaign conversion rates"
}

export interface UseCase {
  id: string;
  title: string;
  industry: IndustryId;
  service: ServiceSlug;
  category: "AI" | "IoT";
  summary: string; // one sentence for cards
  project: string; // full project description
  results: UseCaseResult[];
  image: ImageRef;
  featured?: boolean;
}

export interface LogoItem {
  id: string;
  name: string;
  /** Path under /public/logos. Omit to render a text wordmark. */
  logo?: string;
  /** Optical size multiplier for logo walls (default 1) */
  scale?: number;
}

export interface Partner extends LogoItem {
  group: "solution" | "data-ai" | "cloud";
  description: string;
  exclusive?: boolean; // exclusive representative in KSA & UAE
}

export interface ClientSector {
  id: string;
  name: string; // "Healthcare & Insurance"
  clients: LogoItem[];
}

export interface KeyProject extends LogoItem {
  project: string; // "Cloud migration of 40,000 servers"
}

export interface ReferenceGroup {
  partnerId: string;
  title: string; // "Inveon customer references"
  logos: LogoItem[];
}

export interface Value {
  id: string;
  name: string;
  description: string;
}

export interface Industry {
  id: IndustryId;
  name: string;
  description: string;
  image: ImageRef;
}

export interface Metric {
  value: string; // "71%"
  label: string;
  source: string; // "Vehicle purchase prediction · Automotive retail"
}

// ── Service pillars ─────────────────────────────────────────────────────

export type ServiceSlug = "consultancy" | "managed-services" | "software-development" | "digital-marketing";

export interface ServiceDetail {
  id: string; // anchor id on the pillar page
  name: string;
  /** One-line summary for menus and cards */
  summary: string;
  /** Full description paragraphs */
  body: string[];
  /** "What we deliver" | "What is included" | "What we assess" */
  listTitle: string;
  list: string[];
  /** Additional titled lists (e.g. AI governance checks, what we assess + what we deliver) */
  extras?: { title: string; intro?: string; items: string[] }[];
  outcome?: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  /** The leadership question the practice answers (consultancy) */
  question?: string;
  intro?: string;
  services: ServiceDetail[];
}

export interface ModelRow {
  name: string;
  text: string;
}

export interface Product {
  name: string;
  text: string;
  toConfirm?: boolean;
}

export interface Package {
  name: string;
  bestFor: string;
  delivers: string;
}

export interface ServicePillar {
  slug: ServiceSlug;
  num: "01" | "02" | "03" | "04";
  /** Short label for the header */
  navLabel: string;
  name: string;
  /** "We advise" … — the role of the pillar in the journey */
  role: string;
  /** Short line under the name in menus and cards */
  tagline: string;
  /** Page H1, one word in *asterisks* */
  headline: string;
  intro: string[];
  hero: ImageRef;
  secondary: ImageRef;
  groups: ServiceGroup[];
  coverage?: { title: string; intro: string; rows: ModelRow[] }[];
  products?: { intro: string; items: Product[] };
  packages?: { intro: string; items: Package[]; note: string };
  /** Aliases used by shared components (blog labels): verb = navLabel, oneLiner = tagline */
  verb: string;
  oneLiner: string;
}

// ── Homepage growth story ───────────────────────────────────────────────

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

// ── Navigation ──────────────────────────────────────────────────────────

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
