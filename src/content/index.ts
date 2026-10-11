// Single entry point for all site content. Pages import from "@/content".
export type * from "./types.ts";

export { COMPANY } from "./company.ts";
export { PILLARS, getPillar, pillarHref, AGPM, SECURE_SPECIAL } from "./pillars.ts";
export type { Highlight } from "./pillars.ts";
export { SOLUTIONS, getSolution, solutionTitle } from "./solutions.ts";
export { USE_CASES, getUseCases } from "./use-cases.ts";
export {
  PARTNERS,
  PARTNER_GROUPS,
  EXCLUSIVE_STATEMENT,
  DATA_AI_STATEMENT,
  getPartner,
  getPartners,
  partnersInGroup,
} from "./partners.ts";
export {
  CLIENT_SECTORS,
  CLIENTS_TITLE,
  ALL_CLIENTS,
  KEY_PROJECTS,
  KEY_PROJECTS_NOTE,
  REFERENCE_GROUPS,
} from "./clients.ts";
export { VALUES } from "./values.ts";
export { INDUSTRIES, getIndustry } from "./industries.ts";
export { METRICS } from "./metrics.ts";
export { STORY } from "./story.ts";
export { IMAGES, IMAGE_STYLE, img } from "./images.ts";
export type { ImageId, ImageSpec, Aspect } from "./images.ts";
export { SERVICES, SERVICES_INTRO, SERVICE_SLUGS, getService, serviceHref, serviceCount } from "./services.ts";
export type { ServicePillar, ServiceSlug, ServiceDetail } from "./services.ts";
