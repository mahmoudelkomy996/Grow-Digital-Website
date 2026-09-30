// Image manifest. Every photograph on the site is AI-generated with Magnific
// (Seedream 5 Pro, 2K) from these prompts plus IMAGE_STYLE, then saved to `src`.
import type { ImageRef } from "./types.ts";

export const IMAGE_STYLE =
  "editorial corporate photography, cinematic, colour graded with deep teal shadows (#083B3B) and soft warm cream highlights (#F6F5F0), muted desaturated palette, soft natural light, shallow depth of field, shot on 35mm, premium and calm, photorealistic, modern Gulf (Saudi Arabia / UAE) setting, no text, no letters, no logos, no watermarks, no UI text";

export type Aspect = "16:9" | "4:3" | "3:2" | "4:5" | "1:1" | "21:9";

export interface ImageSpec extends ImageRef {
  aspect: Aspect;
  prompt: string;
}

const spec = (src: string, aspect: Aspect, alt: string, prompt: string): ImageSpec => ({ src, aspect, alt, prompt });

export const IMAGES = {
  // ── Pillars ────────────────────────────────────────────────────────────
  "consult-hero": spec("/images/pillars/consult-hero.jpg", "16:9",
    "Leadership team reviewing a transformation roadmap in a boardroom above Riyadh at dusk",
    "Saudi executive leadership team in a strategy workshop inside a glass-walled boardroom high above Riyadh at dusk, a leader in white thobe and ghutra gestures at a wall covered with a hand-drawn roadmap of milestones and sticky notes, colleagues including a woman in a dark abaya and hijab listen, city lights outside"),
  "consult-detail": spec("/images/pillars/consult-detail.jpg", "4:3",
    "Hands annotating a printed transformation roadmap on a walnut table",
    "close-up of two hands annotating a printed transformation roadmap and architecture diagram with a fine pen on a dark walnut table, reading glasses and a closed laptop nearby, soft window light"),
  "transform-hero": spec("/images/pillars/transform-hero.jpg", "16:9",
    "Data scientist in front of a large display of a neural network visualization",
    "Emirati female data scientist in an elegant black abaya and hijab standing in front of a large curved wall display showing an abstract glowing teal neural network and data point cloud, dark modern AI lab, reflections on the floor"),
  "transform-detail": spec("/images/pillars/transform-detail.jpg", "4:3",
    "IoT sensors with status lights mounted on steel pipes in a modern industrial plant",
    "small wireless industrial IoT sensors with tiny status lights mounted on polished steel pipes in a modern petrochemical plant, engineer holding a tablet softly out of focus in the background, dusk light"),
  "build-hero": spec("/images/pillars/build-hero.jpg", "16:9",
    "Product team collaborating on mobile app wireframes in a bright studio",
    "product team of software developers and UX designers collaborating around a large screen showing abstract mobile app wireframes and colour blocks in a bright modern Dubai tech studio, one young Saudi man in a casual shirt and a woman in hijab pointing, plants and concrete walls"),
  "build-detail": spec("/images/pillars/build-detail.jpg", "4:3",
    "Developer's desk with a laptop showing code and a smartphone prototype",
    "developer's desk at night with a laptop showing blurred lines of code in teal tones and a smartphone standing beside it with an abstract app prototype, mechanical keyboard, warm desk lamp"),
  "operate-hero": spec("/images/pillars/operate-hero.jpg", "16:9",
    "Engineers monitoring systems in a network operations center at night",
    "network operations centre at night, engineers in headsets monitoring a wall of large screens with abstract teal dashboards and graphs, calm focused atmosphere, deep teal ambient light"),
  "operate-detail": spec("/images/pillars/operate-detail.jpg", "4:3",
    "Long aisle of server racks in a modern cloud data center",
    "long symmetrical aisle of server racks in a modern cloud data centre, tiny blue-green status lights, cool teal light, polished floor reflections, one engineer walking far away"),
  "secure-hero": spec("/images/pillars/secure-hero.jpg", "16:9",
    "Cybersecurity analyst working in a dark security operations center",
    "cybersecurity analyst, Saudi man in his thirties, focused in a dark security operations centre, face lit by teal screens showing abstract threat maps, shallow depth of field"),
  "secure-detail": spec("/images/pillars/secure-detail.jpg", "4:3",
    "Hardware security key plugged into a laptop beside a fingerprint reader",
    "macro photograph of a hardware security key plugged into a sleek laptop and a fingerprint reader on a dark desk, teal rim light, minimal composition"),
  "solve-hero": spec("/images/pillars/solve-hero.jpg", "16:9",
    "Doctor and administrator reviewing a digital patient record in a modern hospital",
    "Saudi doctor in a white coat and a hospital administrator woman in hijab reviewing a digital patient record on a tablet in a bright modern hospital corridor, glass and light wood, calm"),
  "solve-detail": spec("/images/pillars/solve-detail.jpg", "4:3",
    "Store associate using a tablet for visual merchandising in a premium store",
    "store associate using a tablet to check visual merchandising in a premium fashion store in a Riyadh mall, neatly styled clothing rails, soft warm light"),
  "grow-hero": spec("/images/pillars/grow-hero.jpg", "16:9",
    "Marketing team reviewing campaign performance on a large screen",
    "marketing team in a creative agency office reviewing campaign performance charts on a large screen, abstract graphs in teal and lime, a woman in hijab presenting, colleagues with laptops, bright daylight"),
  "grow-detail": spec("/images/pillars/grow-detail.jpg", "4:3",
    "Marketer's hands on a laptop showing an analytics dashboard beside a coffee",
    "close-up of a marketer's hands on a laptop showing an abstract analytics dashboard with rising charts, a cup of Arabic coffee and a notebook on a light oak desk, morning light"),

  // ── About ──────────────────────────────────────────────────────────────
  "about-hero": spec("/images/about/about-hero.jpg", "16:9",
    "Riyadh skyline at blue hour",
    "Riyadh city skyline at blue hour seen from a high vantage point, modern towers and highways with light trails, calm teal atmosphere"),
  "about-team": spec("/images/about/about-team.jpg", "3:2",
    "Consultants walking and talking through a modern office atrium",
    "diverse team of Gulf consultants walking and talking through a modern office atrium, a man in thobe and ghutra, a woman in a tailored abaya, a man in a suit, natural daylight, candid"),
  "about-dubai": spec("/images/about/about-dubai.jpg", "3:2",
    "Dubai business district at sunrise",
    "Dubai business district skyline at sunrise from a high vantage point, soft haze, calm teal and cream tones"),

  // ── Use cases ──────────────────────────────────────────────────────────
  "uc-inflight-catering": spec("/images/use-cases/inflight-catering.jpg", "3:2",
    "Cabin crew member arranging juices, water, dates and Arabic coffee on a galley trolley",
    "cabin crew member preparing neatly stocked meal and beverage trolleys in a modern aircraft galley, soft teal cabin lighting"),
  "uc-vehicle-purchase": spec("/images/use-cases/vehicle-purchase.jpg", "3:2",
    "Customer talking with a sales advisor beside an SUV in a car showroom",
    "customer and sales advisor talking beside a new premium SUV in a minimalist car showroom in Riyadh, polished floor, soft light"),
  "uc-banking-chatbot": spec("/images/use-cases/banking-chatbot.jpg", "3:2",
    "Man in a thobe using a banking assistant on a smartphone in a bank lobby",
    "person using a virtual banking assistant chat on a smartphone in a modern bank lobby, screen glow, blurred marble interior"),
  "uc-healthcare-assistant": spec("/images/use-cases/healthcare-assistant.jpg", "3:2",
    "Patient in a thobe messaging a hospital assistant on a smartphone in a waiting area",
    "patient messaging a hospital digital assistant on a smartphone in a calm modern hospital waiting area, soft daylight"),
  "uc-fraud-detection": spec("/images/use-cases/fraud-detection.jpg", "3:2",
    "Financial analyst reviewing a transaction network on several monitors",
    "financial crime analyst reviewing an abstract transaction network graph across several monitors in a dim bank operations room"),
  "uc-clinical-decision": spec("/images/use-cases/clinical-decision.jpg", "3:2",
    "Physician reviewing MRI scans on a tablet beside a stethoscope",
    "physician reviewing medical imaging and patient records on a tablet in a modern clinic office, stethoscope on the desk"),
  "uc-maintenance-scheduling": spec("/images/use-cases/maintenance-scheduling.jpg", "3:2",
    "Two technicians in hard hats checking plant equipment with a tablet",
    "two maintenance technicians in hard hats checking industrial equipment with a tablet at a modern facility, dusk light"),
  "uc-skills-gap": spec("/images/use-cases/skills-gap.jpg", "3:2",
    "Employees in a training session at a corporate learning center",
    "employees in a workshop training session at a modern corporate learning centre, facilitator at a whiteboard, engaged participants"),
  "uc-energy-optimization": spec("/images/use-cases/energy-optimization.jpg", "3:2",
    "Steam, pipes and pressure gauges in a chemical plant at dusk",
    "steam pipes, gauges and valves in a chemical manufacturing plant at dusk, soft steam, teal light"),
  "uc-downtime": spec("/images/use-cases/reducing-downtime.jpg", "3:2",
    "Technician checking a machine control panel with a tablet on a production line",
    "technician inspecting a machine on a clean factory production line with a tablet, shallow depth of field"),
  "uc-production-efficiency": spec("/images/use-cases/production-efficiency.jpg", "3:2",
    "Robotic arms assembling washing machine housings on an automated line",
    "automated manufacturing line with robotic arms assembling home appliances, orderly and clean, cool teal light"),
  "uc-product-quality": spec("/images/use-cases/product-quality.jpg", "3:2",
    "Scientist in gloves inspecting sample vials in a quality control lab",
    "quality control laboratory in a chemical plant, scientist in a lab coat checking liquid samples in glass vials, clean white and teal tones"),

  // ── Solutions ──────────────────────────────────────────────────────────
  "sol-growbot": spec("/images/solutions/grow-bot.jpg", "4:3",
    "Professional using a conversational AI assistant on a laptop",
    "professional woman in a modern office using a conversational AI assistant on a laptop, soft teal glow from the screen on her face, abstract chat bubbles of light, no readable text"),
  "sol-medical-decision": spec("/images/solutions/medical-decision.jpg", "4:3",
    "Approvals officer and doctor reviewing medical scans on screens",
    "healthcare insurance approvals officer and a doctor reviewing medical cases together on large screens in a calm healthcare administration office"),
  "sol-athar": spec("/images/solutions/athar-emr.jpg", "4:3",
    "Nurse updating an electronic medical record on a tablet at a bedside",
    "nurse in hijab updating an electronic medical record on a tablet at a patient's bedside in a modern hospital room, soft daylight"),
  "sol-incommerce": spec("/images/solutions/incommerce.jpg", "4:3",
    "Wrapped online orders on a packing table beside a smartphone showing a storefront",
    "premium fashion e-commerce fulfilment area with neatly wrapped parcels on a table and a smartphone showing an abstract storefront, soft light"),
  "sol-onestore": spec("/images/solutions/onestore.jpg", "4:3",
    "Store manager and staff member reviewing tasks on a tablet in a fashion store",
    "store manager and a staff member reviewing store tasks on a tablet in a modern fashion retail store, mannequins and clothing rails behind"),

  // ── Industries ─────────────────────────────────────────────────────────
  "ind-healthcare": spec("/images/industries/healthcare.jpg", "4:5",
    "Modern hospital atrium",
    "bright modern hospital atrium in the Gulf with plants, glass and light wood, a few medical staff walking"),
  "ind-government": spec("/images/industries/government.jpg", "4:5",
    "Riyadh boulevard at night with streetlights and light trails",
    "smart city boulevard in Riyadh at night with modern buildings, streetlights and soft light trails"),
  "ind-real-estate": spec("/images/industries/real-estate.jpg", "4:5",
    "Skyscraper construction with cranes at golden hour",
    "skyscraper under construction with tower cranes at golden hour in Riyadh, dramatic sky"),
  "ind-retail": spec("/images/industries/retail.jpg", "4:5",
    "Luxury mall storefronts with lit window displays",
    "luxury shopping mall interior in Dubai, elegant storefronts, marble floors, soft light"),
  "ind-financial-services": spec("/images/industries/financial-services.jpg", "4:5",
    "Glass towers of a financial district",
    "glass towers of a financial district looking up, reflections of clouds, cool teal tones"),
  "ind-manufacturing": spec("/images/industries/manufacturing.jpg", "4:5",
    "Industrial plant at dusk",
    "modern industrial manufacturing plant at dusk with lit structures and pipes, calm sky"),
  "ind-aviation": spec("/images/industries/aviation.jpg", "4:5",
    "Aircraft at an airport gate seen through terminal windows",
    "modern airport terminal with a passenger aircraft at the gate seen through tall glass windows at dusk"),

  // ── Misc ───────────────────────────────────────────────────────────────
  "contact-hero": spec("/images/misc/contact.jpg", "3:2",
    "Reception lounge of a modern office with a city view",
    "reception lounge of a modern corporate office with lounge chairs, plants and a panoramic city view, welcoming and calm"),
  "cta-growth": spec("/images/misc/cta-growth.jpg", "21:9",
    "Young palm sapling in the desert at sunrise with a city skyline in the distance",
    "a young palm sapling growing from desert sand at sunrise, a modern city skyline faint in the distance, wide cinematic composition, hopeful"),
} satisfies Record<string, ImageSpec>;

export type ImageId = keyof typeof IMAGES;

/** ImageRef for content modules */
export function img(id: ImageId): ImageRef {
  const { src, alt } = IMAGES[id];
  return { src, alt };
}
