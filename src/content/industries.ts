// Industries we serve. Descriptions summarise services, solutions and use cases from the deck;
// they introduce no new clients, figures or capabilities.
import { img } from "./images.ts";
import type { Industry, IndustryId } from "./types.ts";

export const INDUSTRIES: Industry[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    description:
      "Our ATHAR electronic medical record and Medical Decision & Approval Intelligence Platform, 24/7 digital patient assistants, and integrations that connect HIS, ERP and patient apps.",
    image: img("ind-healthcare"),
  },
  {
    id: "government",
    name: "Smart Cities & Government",
    description:
      "Smart city and government digital transformation advisory, with AI solutions built for smart cities and local government.",
    image: img("ind-government"),
  },
  {
    id: "real-estate",
    name: "Real Estate & Construction",
    description:
      "Consultancy, software and industry-specific AI solutions for real estate and construction businesses.",
    image: img("ind-real-estate"),
  },
  {
    id: "retail",
    name: "Retail & eCommerce",
    description:
      "Omni-channel commerce with InCommerce by Inveon, store operations with OneStore by Mobilgi, and AI models that predict what each customer wants to buy next.",
    image: img("ind-retail"),
  },
  {
    id: "financial-services",
    name: "Financial Services",
    description:
      "Agentic AI that detects abnormal behavior behind fraud and money laundering, and multilingual regulatory advisors that answer in seconds instead of days.",
    image: img("ind-financial-services"),
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Energy",
    description:
      "Industrial IoT with SkySens and MaestroHub that connects shop-floor data to ERP and SCADA in real time, to cut energy cost, downtime and quality problems.",
    image: img("ind-manufacturing"),
  },
  {
    id: "aviation",
    name: "Aviation & Logistics",
    description:
      "AI demand forecasting for inflight catering, and Agile Predictive Monitoring for airports and logistics operations.",
    image: img("ind-aviation"),
  },
];

export function getIndustry(id: IndustryId): Industry | undefined {
  return INDUSTRIES.find((i) => i.id === id);
}
