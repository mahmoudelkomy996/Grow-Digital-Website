// Content model for the whole site. Pages render only from these typed modules.

import type { ServiceSlug } from "./services.ts";

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
