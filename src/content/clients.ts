// Clients, key projects and partner customer references.
// Sources: deck slide 32 ("Sample of our logos for consultancy & SW services"), slide 38 ("Key projects"),
// slide 21 (IoT references), slides 40–41 (Inveon and Mobilgi references).
import type { ClientSector, KeyProject, ReferenceGroup } from "./types.ts";

export const CLIENTS_TITLE = "Sample of our clients for consultancy and software services";

export const CLIENT_SECTORS: ClientSector[] = [
  {
    id: "healthcare-insurance",
    name: "Healthcare & Insurance",
    clients: [
      { id: "riyadh-hospital", name: "Riyadh Hospital", logo: "/logos/clients/riyadh-hospital.png" },
      { id: "tmc-health", name: "TMC Health", logo: "/logos/clients/tmc-health.png" },
      { id: "bupa-careconnect", name: "Bupa CareConnect", logo: "/logos/clients/bupa-careconnect.png" },
      { id: "alfagih-hospital", name: "Dr. Mohammad Alfagih Hospital", logo: "/logos/clients/alfagih-hospital.png" },
    ],
  },
  {
    id: "retail-ecommerce",
    name: "Retail & eCommerce",
    clients: [
      { id: "bin-taleb", name: "Bin Taleb", logo: "/logos/clients/bin-taleb.png" },
      { id: "wlmma", name: "Wlmma", logo: "/logos/clients/wlmma.png" },
      { id: "prime-scent", name: "Prime Scent Perfumes", logo: "/logos/clients/prime-scent.png" },
      { id: "anaqeed", name: "Anaqeed", logo: "/logos/clients/anaqeed.png" },
      { id: "bazarluks", name: "Bazarluks", logo: "/logos/clients/bazarluks.png" },
      { id: "uno", name: "UNO", logo: "/logos/clients/uno.png" },
    ],
  },
  {
    id: "government",
    name: "Government",
    clients: [
      { id: "ncm", name: "National Center for Meteorology", logo: "/logos/clients/ncm.png" },
      { id: "riyadh-municipality", name: "Riyadh Region Municipality", logo: "/logos/clients/riyadh-municipality.png" },
    ],
  },
  {
    id: "construction-real-estate",
    name: "Construction & Real Estate",
    clients: [
      { id: "aqarverse", name: "Aqarverse", logo: "/logos/clients/aqarverse.png" },
      { id: "marco", name: "Marco", logo: "/logos/clients/marco.png" },
    ],
  },
];

/** Label shown with the key projects (see spec §12, open item 1). */
export const KEY_PROJECTS_NOTE = "Delivered by our cybersecurity experts and partners.";

export const KEY_PROJECTS: KeyProject[] = [
  {
    id: "ecb",
    name: "European Central Bank",
    logo: "/logos/projects/ecb.png",
    project: "Risk and Information Security Management",
  },
  {
    id: "deutsche-bank",
    name: "Deutsche Bank",
    logo: "/logos/projects/deutsche-bank.png",
    project: "Cloud migration of 40,000 servers",
  },
  {
    id: "db-netz",
    name: "DB Netz AG",
    logo: "/logos/projects/db-netz.png",
    project: "SOC design for OT and IT (Splunk and Elastic)",
  },
  {
    id: "saudia",
    name: "Saudia",
    logo: "/logos/projects/saudia.png",
    project: "Security strategy development and IT digital transformation implementation",
  },
  {
    id: "european-commission",
    name: "European Commission",
    logo: "/logos/projects/european-commission.png",
    project: "Building a blockchain program",
  },
];

export const REFERENCE_GROUPS: ReferenceGroup[] = [
  {
    partnerId: "skysens",
    title: "SkySens and MaestroHub IoT customer references",
    logos: [
      { id: "advantech", name: "Advantech", logo: "/logos/references/advantech.png" },
      { id: "arup", name: "Arup", logo: "/logos/references/arup.png" },
      { id: "vestel", name: "Vestel", logo: "/logos/references/vestel.png" },
      { id: "bridgestone", name: "Bridgestone", logo: "/logos/references/bridgestone.png" },
      { id: "kansai-paint", name: "Kansai Paint", logo: "/logos/references/kansai-paint.png" },
      { id: "bimbo", name: "Bimbo", logo: "/logos/references/bimbo.png" },
      { id: "organik-kimya", name: "Organik Kimya", logo: "/logos/references/organik-kimya.png" },
      { id: "isg", name: "ISG – Istanbul Sabiha Gökçen Airport", logo: "/logos/references/isg.png" },
      { id: "iga", name: "IGA Istanbul Airport", logo: "/logos/references/iga.png" },
    ],
  },
  {
    partnerId: "inveon",
    title: "Inveon customer references",
    logos: [
      { id: "columbia", name: "Columbia", logo: "/logos/references/columbia.png" },
      { id: "hotic", name: "Hotiç", logo: "/logos/references/hotic.png" },
      { id: "watsons", name: "Watsons", logo: "/logos/references/watsons.png" },
      { id: "horizon", name: "Horizon", logo: "/logos/references/horizon.png" },
      { id: "sneaks-up", name: "Sneaks Up", logo: "/logos/references/sneaks-up.png" },
    ],
  },
  {
    partnerId: "mobilgi",
    title: "Mobilgi customer references",
    logos: [
      { id: "ikea", name: "IKEA", logo: "/logos/references/ikea.png" },
      { id: "garanti", name: "Garanti", logo: "/logos/references/garanti.png" },
      { id: "lc-waikiki", name: "LC Waikiki", logo: "/logos/references/lc-waikiki.png" },
      { id: "mudo", name: "Mudo", logo: "/logos/references/mudo.png" },
      { id: "beko", name: "Beko", logo: "/logos/references/beko.png" },
      { id: "bizim", name: "Bizim", logo: "/logos/references/bizim.png" },
      { id: "lego", name: "LEGO", logo: "/logos/references/lego.png" },
      { id: "afia", name: "Afia", logo: "/logos/references/afia.png" },
    ],
  },
];

/** Every client logo, flattened (for marquees and walls). */
