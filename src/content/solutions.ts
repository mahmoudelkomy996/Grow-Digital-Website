// SOLVE: our own products plus the partner platforms we exclusively represent in KSA and the UAE.
// Own products: the portfolio gives one line each, so descriptions stay strictly within that line
// (spec §12, open item 5). Partner platforms: deck slides 40–41.
import { img } from "./images.ts";
import type { Solution } from "./types.ts";

export const SOLUTIONS: Solution[] = [
  // ── Grow Digital products (services document, Oct 2026) ───────────────
  {
    id: "grow-bot",
    name: "Grow Bot",
    by: "Grow Digital",
    kind: "own",
    category: "WhatsApp chatbot",
    description: "A WhatsApp chatbot that lets customers and patients reach your services in the channel they already use.",
    features: ["Built on WhatsApp", "For customers and patients", "Arabic and English"],
    image: img("sol-growbot"),
  },
  {
    id: "athar-emr",
    name: "Athar",
    by: "Grow Digital",
    kind: "own",
    category: "Electronic medical record (EMR)",
    description: "An electronic medical record (EMR) system for healthcare providers.",
    features: ["Electronic medical record", "For healthcare providers"],
    image: img("sol-athar"),
  },
  {
    id: "medical-decision",
    name: "Medical Decision Support System",
    by: "Grow Digital",
    kind: "own",
    category: "Clinical decision support",
    description: "A decision support platform for healthcare providers.",
    features: ["Decision support", "For healthcare providers"],
    image: img("sol-medical-decision"),
  },
  {
    id: "patient-app",
    name: "Patient Mobile App",
    by: "Grow Digital",
    kind: "own",
    category: "Patient mobile application",
    description: "A mobile application that connects patients with their healthcare provider.",
    features: ["Mobile application", "Connects patients and providers"],
    image: img("uc-healthcare-assistant"),
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

