// SOLVE: our own products plus the partner platforms we exclusively represent in KSA and the UAE.
// Own products: the portfolio gives one line each, so descriptions stay strictly within that line
// (spec §12, open item 5). Partner platforms: deck slides 40–41.
import { img } from "./images.ts";
import type { Solution } from "./types.ts";

export const SOLUTIONS: Solution[] = [
  // ── Grow Digital solutions ─────────────────────────────────────────────
  {
    id: "grow-bot",
    name: "Grow Bot",
    by: "Grow Digital",
    kind: "own",
    category: "Enterprise AI Assistant & Conversational AI Platform",
    description:
      "Grow Bot is an enterprise AI assistant and conversational AI platform, built by Grow Digital. It is designed for enterprises in KSA and the UAE.",
    features: ["Enterprise AI assistant", "Conversational AI platform", "Built for enterprises in KSA and the UAE"],
    image: img("sol-growbot"),
  },
  {
    id: "medical-decision",
    name: "Medical Decision & Approval Intelligence Platform",
    by: "Grow Digital",
    kind: "own",
    category: "AI-enabled healthcare decision and approval automation",
    description:
      "The Medical Decision & Approval Intelligence Platform is Grow Digital's solution for AI-enabled healthcare decision and approval automation. It brings AI to healthcare decision and approval workflows.",
    features: ["AI-enabled healthcare decisions", "Approval automation", "Built by Grow Digital"],
    image: img("sol-medical-decision"),
  },
  {
    id: "athar-emr",
    name: "ATHAR Electronic Medical Record",
    by: "Grow Digital",
    kind: "own",
    category: "Digital healthcare and patient record platform",
    description:
      "ATHAR Electronic Medical Record is Grow Digital's digital healthcare and patient record platform. It brings healthcare and patient records into a digital platform.",
    features: ["Electronic medical record", "Patient record platform", "Digital healthcare"],
    image: img("sol-athar"),
  },

  // ── Partner solutions ──────────────────────────────────────────────────
  {
    id: "incommerce",
    name: "InCommerce",
    by: "Inveon",
    kind: "partner",
    category: "Digital Commerce Platform",
    description:
      "Inveon InCommerce is an agile way to build, launch and expand your e-commerce business across different channels, marketplaces and partners.",
    features: [
      "Omni-channel commerce platform",
      "Marketplace integrator",
      "App-commerce",
      "Order management system",
      "Loyalty module",
      "Real-time promotions",
    ],
    image: img("sol-incommerce"),
    partnerId: "inveon",
  },
  {
    id: "onestore",
    name: "OneStore",
    by: "Mobilgi",
    kind: "partner",
    category: "Enterprise Collaboration Platform",
    description: "Mobilgi OneStore is a visual merchandising solution for retail store operations.",
    features: [
      "A visual merchandising solution",
      "The most comprehensive toolkit for all users, store staff and managers, in a single easy-to-use software package",
      "The connective tissue between your store, field team and headquarters",
    ],
    image: img("sol-onestore"),
    partnerId: "mobilgi",
  },
];

/** "Grow Bot by Grow Digital", "InCommerce by Inveon", … */
export function solutionTitle(s: Solution): string {
  return `${s.name} by ${s.by}`;
}

export function getSolution(id: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.id === id);
}
