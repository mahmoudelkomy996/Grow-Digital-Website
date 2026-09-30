// Partners. Source: deck slides 13–14 (Data & AI), 24 (IoT), 30 (cloud services), 39–41 (solution partners).
// Logos follow the path convention in the implementation plan; partners without a logo render as a wordmark.
import type { Partner } from "./types.ts";

/** Deck slide 39, lightly edited. Applies to every partner with `exclusive: true`. */
export const EXCLUSIVE_STATEMENT =
  "Grow Digital is the exclusive representative and delivery arm for the following solution providers in the Kingdom of Saudi Arabia and the UAE.";

/** Deck slide 13. Applies to the "data-ai" group. */
export const DATA_AI_STATEMENT =
  "Grow Digital runs Data and AI delivery with our global partners Navinspire and GTech.";

export const PARTNER_GROUPS: { id: Partner["group"]; title: string; lead: string }[] = [
  { id: "solution", title: "Solution partners", lead: EXCLUSIVE_STATEMENT },
  { id: "data-ai", title: "Data & AI partners", lead: DATA_AI_STATEMENT },
  {
    id: "cloud",
    title: "Cloud platforms",
    lead: "We help organizations adopt and run the leading cloud platforms, from migration and infrastructure design to security, analytics and AI.",
  },
];

export const PARTNERS: Partner[] = [
  // ── Solution partners (exclusive in KSA and the UAE) ───────────────────
  {
    id: "inveon",
    name: "Inveon",
    logo: "/logos/partners/inveon.png",
    group: "solution",
    exclusive: true,
    description:
      "Maker of InCommerce, an agile way to build, launch and expand your e-commerce business across different channels, marketplaces and partners.",
  },
  {
    id: "mobilgi",
    name: "Mobilgi",
    logo: "/logos/partners/mobilgi.png",
    group: "solution",
    exclusive: true,
    description:
      "Maker of OneStore, the visual merchandising and collaboration platform that connects your store, field team and headquarters.",
  },
  {
    id: "maestrohub",
    name: "MaestroHub",
    logo: "/logos/partners/maestrohub.png",
    group: "solution",
    exclusive: true,
    description:
      "Industrial IoT platform that connects shop-floor data directly into ERP and SCADA in real time.",
  },
  {
    id: "skysens",
    name: "SkySens",
    logo: "/logos/partners/skysens.png",
    group: "solution",
    exclusive: true,
    description:
      "End-to-end IoT solutions: long-range wireless networks, predictive analytics, and data integration that connects the shop floor to the systems that run the business.",
  },

  // ── Data & AI partners (global) ────────────────────────────────────────
  {
    id: "navinspire",
    name: "Navinspire",
    group: "data-ai",
    description:
      "Global partner for Data & AI delivery, and provider of the RAG-DATALAKE platform (Navinspire IA).",
  },
  {
    id: "gtech",
    name: "GTech",
    group: "data-ai",
    description:
      "Global partner for Data & AI delivery, with consultancy for hybrid data lakes that combine real-time and historical analytics.",
  },

  // ── Cloud platforms (deck slide 30) ────────────────────────────────────
  {
    id: "google-cloud",
    name: "Google Cloud",
    group: "cloud",
    description:
      "Cloud migration, infrastructure design, security implementation, big data analytics, and AI/ML solutions on Google Cloud Platform (GCP).",
  },
  {
    id: "microsoft-azure",
    name: "Microsoft Azure",
    group: "cloud",
    description: "Azure cloud solutions, with a focus on scalability, security, and performance optimization.",
  },
  {
    id: "oracle-cloud",
    name: "Oracle Cloud",
    group: "cloud",
    description:
      "Oracle Cloud services, including database management, application development, and enterprise resource planning (ERP) solutions.",
  },
  {
    id: "ibm-cloud",
    name: "IBM Cloud",
    group: "cloud",
    description: "Adoption of IBM Cloud services, with an emphasis on hybrid cloud solutions and AI integration.",
  },
];

export function getPartner(id: string): Partner | undefined {
  return PARTNERS.find((p) => p.id === id);
}

export function getPartners(ids: string[]): Partner[] {
  return ids.flatMap((id) => getPartner(id) ?? []);
}

export function partnersInGroup(group: Partner["group"]): Partner[] {
  return PARTNERS.filter((p) => p.group === group);
}
