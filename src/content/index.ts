// Single entry point for all site content. Pages import from "@/content".
export type * from "./types.ts";

export { COMPANY } from "./company.ts";
export { SOLUTIONS } from "./solutions.ts";
export { USE_CASES } from "./use-cases.ts";
export {
  PARTNERS,
  PARTNER_GROUPS,
  partnersInGroup,
} from "./partners.ts";
export {
  CLIENT_SECTORS,
  CLIENTS_TITLE,
  KEY_PROJECTS,
  KEY_PROJECTS_NOTE,
  REFERENCE_GROUPS,
} from "./clients.ts";
export { VALUES } from "./values.ts";
export { INDUSTRIES } from "./industries.ts";
export { METRICS } from "./metrics.ts";
export { STORY } from "./story.ts";
export type { GrowthChapter } from "./story.ts";
export { IMAGES } from "./images.ts";
export type { ImageId, ImageSpec, Aspect } from "./images.ts";
export { SERVICES, SERVICES_INTRO, getService } from "./services.ts";
export type { ServicePillar, ServiceSlug, ServiceDetail } from "./services.ts";
