// Company-wide copy: positioning, mission, vision, contact and social links.
// Source: GrowDigital_Deck_v2_Final.pptx (slides 1–2) and the services portfolio.
import type { Company } from "../types.ts";

export const COMPANY: Company = {
  name: "Grow Digital",
  tagline: "It's time to grow.",
  positioning: "The agile integrator",
  statement:
    "We advise, we build, we market and we operate: four pillars covering the full journey from the first idea to daily operations.",
  intro:
    "Grow Digital is a business integrator, not another vendor in the stack. One accountable team designs, builds, operates, and markets your systems — so you stop managing five contracts and start managing one outcome.",
  // Supporting line under the home integrator statement ("A business integrator, not another vendor in the stack.").
  // The "We run the systems…" line is the mission (see below), so it is not repeated here.
  proof: "One accountable team designs, builds, operates, and markets your systems — so you stop managing five contracts and start managing one outcome.",
  // The deck places the MISSION label under this line (slide 2).
  mission:
    "We run the systems our clients' revenue depends on — accountable for the number at quarter-end, not just the ticket count.",
  // The deck places the VISION label under this line (slide 2).
  vision:
    "We are the integrator KSA and UAE enterprises call first — end-to-end, from optimizing what exists to replacing what doesn't work.",
  email: "info@growdigital.com",
  phone: "+971 50 3122672",
  phoneHref: "tel:+971503122672",
  markets: ["Kingdom of Saudi Arabia", "United Arab Emirates"],
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/growdigitalmea" },
    { label: "X", href: "https://x.com/growdigitalmea" },
    { label: "Instagram", href: "https://www.instagram.com/growdigitalmea" },
    { label: "Facebook", href: "https://www.facebook.com/growdigitalmea" },
    { label: "YouTube", href: "https://www.youtube.com/channel/UCKR9DevHgPwiMSlnFR-UVeA" },
  ],
};
