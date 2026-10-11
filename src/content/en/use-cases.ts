// Use cases: 8 AI (deck slides 16–19) and 4 IoT (deck slide 25).
// Figures are exactly as stated in the deck; qualitative results use words, never invented numbers.
import { img } from "../images.ts";
import type { UseCase } from "../types.ts";

export const USE_CASES: UseCase[] = [
  // ── AI ─────────────────────────────────────────────────────────────────
  {
    id: "inflight-catering",
    title: "Inflight catering optimization",
    industry: "aviation",
    service: "software-development",
    category: "AI",
    summary:
      "Better demand forecasting and product loading for a low-cost carrier's onboard food and beverages, to minimize waste.",
    project:
      "A low-cost carrier partnered with us to optimize its onboard food and beverage product management through the Waste Optimization Project. The project focused on improving demand forecasting and product loading processes to minimize waste and increase operational efficiency.",
    results: [
      { value: "Up to 20%", label: "savings in operational costs, by reducing unnecessary product loading" },
      { value: "+32%", label: "revenue per passenger, from improved product availability and planning" },
      { value: "+30%", label: "profitability per passenger, from enhanced operational efficiency" },
      { value: "−7%", label: "food waste, supporting sustainability goals" },
    ],
    image: img("uc-inflight-catering"),
    featured: true,
  },
  {
    id: "vehicle-purchase-prediction",
    title: "Vehicle purchase prediction",
    industry: "retail",
    service: "software-development",
    category: "AI",
    summary:
      "AI models that predict what each customer wants to buy next, so campaigns reach the right product, customer and moment.",
    project:
      "A data-driven approach to boosting customer loyalty. The project's AI and machine learning models predict what each customer actually wants to buy next. Campaigns get built around that prediction instead of a demographic guess — right product, right customer, right moment.",
    results: [
      { value: "71%", label: "increase in campaign conversion rates from personalized campaigns" },
      { value: "10x", label: "increase in purchase rates for segment-targeted campaigns during pilot studies" },
      { value: "+30%", label: "positive feedback rates in customer satisfaction surveys" },
    ],
    image: img("uc-vehicle-purchase"),
    featured: true,
  },
  {
    id: "banking-regulatory-chatbot",
    title: "Banking regulatory chatbot",
    industry: "financial-services",
    service: "software-development",
    category: "AI",
    summary:
      "A multilingual virtual advisor that guides businesses and individuals through KYC/AML procedures and regulatory questions.",
    project:
      "A virtual advisor guiding businesses and individuals on KYC/AML procedures, international transfers, regulatory thresholds and central bank forms, in Arabic, French, English, Japanese, Chinese, Italian, German and more.",
    results: [
      { value: "Days → seconds", label: "response times, reduced from several days to a few seconds, regardless of the user's country of origin" },
      { value: "Multilingual", label: "Arabic, French, English, Japanese, Chinese, Italian, German and more" },
    ],
    image: img("uc-banking-chatbot"),
  },
  {
    id: "healthcare-assistant",
    title: "24/7 digital healthcare assistant",
    industry: "healthcare",
    service: "software-development",
    category: "AI",
    summary:
      "A WhatsApp chatbot that answers patients instantly, day and night, and handles bookings and requests.",
    project:
      "A WhatsApp chatbot for patients' interactions with the hospital, 24/7: instant, accurate responses to patient inquiries at any time, appointment and booking management, and patient requests such as sick leave and access to medical reports.",
    results: [
      { value: "30%", label: "cost reduction compared to a call center" },
      { value: "50%", label: "faster appointment booking turnaround" },
    ],
    image: img("uc-healthcare-assistant"),
    featured: true,
  },
  {
    id: "fraud-aml-agentic-ai",
    title: "Agentic AI against financial fraud and money laundering",
    industry: "financial-services",
    service: "software-development",
    category: "AI",
    summary:
      "AI agents that compare every transaction with a historical normal profile and raise a red flag the moment behavior deviates.",
    project:
      "Detection of abnormal behaviors through continuous analysis of transaction habits: every transfer, delay and payment instrument (cards, mobile banking, forex) is compared against a historical \"normal\" profile using AI models. Real-time alerts follow: as soon as a significant deviation is detected, such as an unusually large overseas purchase or a series of micro-transfers, the AI agent raises a red flag and auto-generates a pre-filled investigation dossier.",
    results: [
      { value: "Faster", label: "alerts, with reduced lag between an anomaly occurring and the alert" },
      { value: "Fewer", label: "false positives, thanks to probabilistic scoring that combines business rules and generative detection" },
    ],
    image: img("uc-fraud-detection"),
  },
  {
    id: "clinical-decision-support",
    title: "Agentic AI for clinical decision support",
    industry: "healthcare",
    service: "software-development",
    category: "AI",
    summary:
      "A cloud-based AI product that improves clinical decisions, medical coding accuracy and claims auditing for healthcare providers.",
    project:
      "An AI-enabled, cloud-based product that improves clinical decision-making, enhances the accuracy of medical coding, and streamlines claims auditing and related administrative processes for different healthcare providers.",
    results: [
      { value: "Better", label: "clinical decision-making, with AI-driven, evidence-based guidance that improves the timeliness and quality of patient care" },
      { value: "More accurate", label: "medical coding" },
      { value: "Streamlined", label: "claims auditing and compliance" },
      { value: "Stronger", label: "data security and regulatory compliance" },
    ],
    image: img("uc-clinical-decision"),
  },
  {
    id: "maintenance-scheduling",
    title: "AI-powered maintenance scheduling",
    industry: "manufacturing",
    service: "software-development",
    category: "AI",
    summary:
      "Human task optimization: AI plans maintenance around asset health, available technicians, skills and work priorities.",
    project:
      "Human task optimization: AI automatically plans daily and weekly maintenance schedules based on asset health, available technicians, skills and work priorities.",
    results: [
      { value: "Higher", label: "technician productivity" },
      { value: "Less", label: "overtime and idle time" },
      { value: "Faster", label: "maintenance response" },
      { value: "Fewer", label: "emergency repairs" },
    ],
    image: img("uc-maintenance-scheduling"),
  },
  {
    id: "skills-gap-management",
    title: "AI-based competency & skill gap management",
    industry: "manufacturing",
    service: "software-development",
    category: "AI",
    summary:
      "AI that maps workforce competencies, finds the gaps and recommends the training paths that close them.",
    project:
      "AI analyzes current workforce competencies, identifies gaps, recommends training paths, and tracks employee readiness for promotion or job rotation.",
    results: [
      { value: "Faster", label: "skill development" },
      { value: "More effective", label: "training investments" },
      { value: "Better", label: "job satisfaction and retention" },
      { value: "Safer", label: "and more capable workforce" },
    ],
    image: img("uc-skills-gap"),
  },

  // ── IoT ────────────────────────────────────────────────────────────────
  {
    id: "energy-cost-optimization",
    title: "Energy cost optimization",
    industry: "manufacturing",
    service: "software-development",
    category: "IoT",
    summary: "Real-time monitoring and mapping of energy usage to production output.",
    project:
      "Real-time monitoring and mapping of energy usage to production output. By connecting its SCADA and ERP to MaestroHub, a chemical manufacturer saved $45K annually by reducing steam consumption by 8 tonnes per day, achieving ROI in less than three months.",
    results: [
      { value: "$45K", label: "annual savings" },
      { value: "8 tonnes", label: "less steam consumed per day" },
      { value: "< 3 months", label: "to return on investment" },
    ],
    image: img("uc-energy-optimization"),
  },
  {
    id: "reducing-downtime",
    title: "Reducing downtime",
    industry: "manufacturing",
    service: "software-development",
    category: "IoT",
    summary:
      "Dynamic resource deployment that uses SCADA and maintenance data to optimize repair times and skill-based technician assignments.",
    project:
      "Dynamic resource deployment using data from SCADA and maintenance systems to optimize repair times and skill-based technician assignments. By connecting SCADA, maintenance and skill sets to MaestroHub, maintenance optimization led to a 1% capacity increase for a manufacturer within one month.",
    results: [{ value: "+1%", label: "capacity within one month" }],
    image: img("uc-downtime"),
  },
  {
    id: "production-efficiency",
    title: "Production efficiency",
    industry: "manufacturing",
    service: "software-development",
    category: "IoT",
    summary:
      "IIoT with data contextualization that gives every role its own insights, enabling proactive anomaly detection and production optimization.",
    project:
      "Integration of IIoT with data contextualization to provide role-based insights, enabling proactive actions like anomaly detection and production optimization. A durable goods OEM improved production capacity by 30% within a month through real-time virtual twins and dashboards.",
    results: [{ value: "+30%", label: "production capacity within a month" }],
    image: img("uc-production-efficiency"),
  },
  {
    id: "product-quality",
    title: "Improving product quality",
    industry: "manufacturing",
    service: "software-development",
    category: "IoT",
    summary: "Real-time monitoring of reactor parameters, with process adjustments driven by advanced analytics.",
    project:
      "Real-time monitoring of reactor parameters and process adjustments using advanced analytics. By connecting SCADA, LIMS, recipes and CIP details to MaestroHub, condition-based monitoring reduced quality problems by 50% within two months.",
    results: [{ value: "−50%", label: "quality problems within two months" }],
    image: img("uc-product-quality"),
    featured: true,
  },
];

/** Use cases for the given ids, in the order given; unknown ids are skipped. */

