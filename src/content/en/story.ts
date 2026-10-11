// Copy for the homepage 3D growth story.
// The tree scene runs a fixed 9-beat timeline (s = p * 9: seed, shoot, data, modules, dial, shield,
// fruit, canopy, finale). The four service pillars are laid over it in lifecycle order; each chapter
// owns the scene beats in its `span`:
//   We advise  (Consultancy)        s 1-3  seed opens, first shoot, data streams reach the decision node
//   We build   (Software)           s 3-4  modules assemble along the branch
//   We operate (Managed Services)   s 4-6  24-hour dial, then the GrowShield™ canopy shell
//   We market  (Digital Marketing)  s 6-8  results ripen as fruit, the canopy fills in
import type { GrowthChapter } from "../types.ts";

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
