// Content model for the whole site. Pages render only from these typed modules.

export type PillarSlug = "consult" | "transform" | "build" | "operate" | "secure" | "solve" | "grow";

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

export interface ServiceGroup {
  /** Omit for the pillar's main list */
  title?: string;
  items: string[];
}

export interface DeepDive {
  id: string;
  title: string;
  /** One-line objective, e.g. "Define strategic direction and transformation roadmap before execution." */
  objective?: string;
  /** Free paragraphs (used when the deck gives prose instead of scope/value lists) */
  body?: string[];
  scope?: string[];
  value?: string[];
  /** Generic bullet list (features, benefits) when scope/value do not apply */
  bullets?: string[];
  image?: ImageRef;
  partnerIds?: string[];
}

export interface Pillar {
  slug: PillarSlug;
  num: "01" | "02" | "03" | "04" | "05" | "06" | "07";
  verb: string; // "Consult"
  name: string; // "Consulting & Advisory"
  /** Page H1 with one word wrapped in *asterisks* for the serif accent, e.g. "Direction before *investment*." */
  headline: string;
  oneLiner: string;
  intro: string[];
  hero: ImageRef;
  secondary: ImageRef;
  services: ServiceGroup[];
  /** 3–4 service names used on cards, menus and the 3D story chips */
  featured: string[];
  deepDives: DeepDive[];
  partnerIds: string[];
  useCaseIds: string[];
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
  pillar: PillarSlug;
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

export interface StoryChapter {
  id: "intro" | PillarSlug | "finale";
  num: string; // "" for intro/finale
  name: string;
  full: string;
  /** Headline with one word wrapped in *asterisks* for the serif accent */
  title: string;
  lead: string;
  chips: string[];
  href?: string;
}
