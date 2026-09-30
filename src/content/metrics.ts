// Impact band: five headline results, each labeled with the use case it comes from (see use-cases.ts).
import type { Metric } from "./types.ts";

export const METRICS: Metric[] = [
  {
    value: "71%",
    label: "increase in campaign conversion rates",
    source: "Vehicle purchase prediction · Automotive retail",
  },
  {
    value: "Up to 20%",
    label: "savings in operational costs",
    source: "Inflight catering optimization · Low-cost airline",
  },
  {
    value: "+30%",
    label: "production capacity within one month",
    source: "Production efficiency · Durable goods manufacturing",
  },
  {
    value: "−50%",
    label: "quality problems within two months",
    source: "Improving product quality · Manufacturing IoT",
  },
  {
    value: "Seconds",
    label: "response times, down from several days",
    source: "Banking regulatory chatbot · Financial services",
  },
];
