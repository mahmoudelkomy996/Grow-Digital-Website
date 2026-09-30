// Copy for the homepage 3D growth story (9 chapters: intro, 7 pillars, finale).
// Chapter i spans story progress p ∈ [i/9, (i+1)/9]; the 3D scene is keyed to the same mapping.
import type { StoryChapter } from "./types.ts";

export const STORY: StoryChapter[] = [
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
    href: "/pillars/consult",
  },
  {
    id: "transform", num: "02", name: "Transform", full: "Data, AI & IoT",
    title: "Data into *decisions*.",
    lead: "Predictive models, AI agents and IoT platforms that hold up in production, not just in a demo.",
    chips: ["Data Strategy & Governance", "Generative AI & AI Agents", "Predictive Analytics & ML", "IoT Platforms"],
    href: "/pillars/transform",
  },
  {
    id: "build", num: "03", name: "Build", full: "Software Development & Digital Experience",
    title: "Software people *finish* using.",
    lead: "Web, mobile and custom applications measured on load time and conversion, not screenshots.",
    chips: ["Web & Mobile Apps", "Custom Applications", "UX/UI Design", "API & Integration"],
    href: "/pillars/build",
  },
  {
    id: "operate", num: "04", name: "Operate", full: "Managed Services",
    title: "Systems that never *sleep*.",
    lead: "SLA-based L1–L3 support, cloud operations and monitoring that keep revenue systems running.",
    chips: ["Cloud Managed Services", "Application Managed Services", "Infrastructure Monitoring", "GrowShield™"],
    href: "/pillars/operate",
  },
  {
    id: "secure", num: "05", name: "Secure", full: "Cybersecurity",
    title: "Defense shaped to your *risk*.",
    lead: "Security built around your actual attack surface, with 24/7 vigilance and governance you can audit.",
    chips: ["Strategy & Roadmap", "Assessment & Audit", "Governance, Risk & Compliance", "Incident Response"],
    href: "/pillars/secure",
  },
  {
    id: "solve", num: "06", name: "Solve", full: "Digital, Cloud & AI Solutions",
    title: "Products that deliver *value*.",
    lead: "Our own AI platforms, plus partner solutions we exclusively represent in KSA and the UAE.",
    chips: ["Grow Bot", "Medical Decision Intelligence", "ATHAR EMR", "InCommerce by Inveon", "OneStore by Mobilgi"],
    href: "/pillars/solve",
  },
  {
    id: "grow", num: "07", name: "Grow", full: "Marketing & Growth",
    title: "Growth you can *measure*.",
    lead: "Strategy, performance marketing and GrowthLab analytics pulled together, with no siloed tactics.",
    chips: ["Digital Marketing Strategy", "Performance Marketing", "GrowthLab Analytics", "Go-to-Market Strategy"],
    href: "/pillars/grow",
  },
  {
    id: "finale", num: "", name: "", full: "",
    title: "Consult. Transform. Build. Operate. Secure. *Grow*.",
    lead: "Supported by our own digital and AI solutions, for enterprises across KSA and the UAE.",
    chips: [],
    href: "/contact",
  },
];
