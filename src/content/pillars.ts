// The seven pillars (CONSULT → GROW).
// - Service names are verbatim from the "Services & Solutions Portfolio" (pillar 6 renamed
//   "Digital, Cloud & AI Solutions"). Sub-lists in the portfolio become titled groups.
// - Deep dives come from GrowDigital_Deck_v2_Final.pptx, lightly edited for the web; every claim
//   and figure is kept as stated in the deck.
// - `headline` and `featured` are read from the homepage story (story.ts) so they never drift.
import { img } from "./images.ts";
import { STORY } from "./story.ts";
import type { Pillar, PillarSlug, StoryChapter } from "./types.ts";

function chapter(id: PillarSlug): StoryChapter {
  const c = STORY.find((s) => s.id === id);
  if (!c) throw new Error(`story.ts has no chapter for pillar "${id}"`);
  return c;
}

/** Headline (with its *accent* word) and featured chips, shared with the 3D story. */
function fromStory(id: PillarSlug): Pick<Pillar, "headline" | "featured"> {
  const c = chapter(id);
  return { headline: c.title, featured: [...c.chips] };
}

export const PILLARS: Pillar[] = [
  // ── 01 CONSULT ─────────────────────────────────────────────────────────
  {
    slug: "consult",
    num: "01",
    verb: "Consult",
    name: "Consulting & Advisory",
    ...fromStory("consult"),
    oneLiner: "From strategy to execution, with full governance and measurable impact.",
    intro: [
      "From strategy to execution, with full governance and measurable impact.",
      "We set direction before investment: an executive-aligned roadmap, independent quality assurance, a program office that keeps multi-vendor delivery on time and on budget, and the change management that gets new systems adopted.",
    ],
    hero: img("consult-hero"),
    secondary: img("consult-detail"),
    services: [
      {
        items: [
          "Digital Transformation Strategy",
          "IT Strategy & Roadmap",
          "Enterprise Architecture Advisory",
          "ERP & Business Applications Advisory",
          "Technology & Vendor Selection",
          "IT Operating Model & Governance",
          "PMO & Program Management Advisory",
          "Business Process Assessment & Optimization",
          "AI & Digital Readiness Assessment",
          "Cloud Strategy & Assessment",
          "Cybersecurity Strategy & Advisory",
          "Healthcare Digital Transformation Advisory",
          "Smart City & Government Digital Transformation Advisory",
          "Technology Due Diligence & Assessment",
          "IT Cost Optimization & Value Realization",
        ],
      },
    ],
    deepDives: [
      {
        id: "advisory",
        title: "Advisory Services",
        objective: "Define strategic direction and transformation roadmap before execution.",
        scope: [
          "Digital transformation strategy & roadmap",
          "Technology landscape assessment",
          "Enterprise architecture advisory",
          "Vendor evaluation & selection",
          "Target operating model design",
          "ROI & investment prioritization",
        ],
        value: [
          "Clear executive-aligned roadmap",
          "Reduced investment risk",
          "Improved decision-making framework",
          "Future-ready digital architecture",
        ],
      },
      {
        id: "quality-assurance",
        title: "Quality Assurance",
        objective: "Ensure controlled, compliant, and risk-aware program delivery.",
        scope: [
          "Independent project & vendor audits",
          "Implementation quality reviews",
          "Risk & compliance monitoring",
          "Governance validation",
          "System readiness & performance benchmarking",
        ],
        value: [
          "Reduced implementation risk",
          "Vendor accountability",
          "Improved governance visibility",
          "Early detection of critical gaps",
        ],
      },
      {
        id: "pmo",
        title: "Program & Project Management Office (PMO)",
        objective: "Translate strategy into structured and measurable execution.",
        scope: [
          "PMO setup & governance structure",
          "Multi-vendor coordination",
          "Budget & timeline control",
          "Risk & issue management",
          "Executive KPI reporting",
          "Change management alignment",
        ],
        value: [
          "On-time & on-budget delivery",
          "Structured execution model",
          "Full executive transparency",
          "Controlled transformation environment",
        ],
      },
      {
        id: "business-consultancy",
        title: "Business Consultancy",
        objective: "Optimize business operations and performance beyond technology.",
        scope: [
          "Business process re-engineering",
          "Operational performance assessment",
          "KPI framework design",
          "Cost optimization initiatives",
          "Revenue cycle improvement",
          "AI & automation use-case identification",
        ],
        value: [
          "Improved operational efficiency",
          "Measurable ROI impact",
          "Optimized resource utilization",
          "Sustainable performance growth",
        ],
      },
      {
        id: "digital-transformation",
        title: "Digital Transformation",
        objective: "Design and govern transformation programs that deliver measurable, adopted change.",
        scope: [
          "Digital transformation program design",
          "Change management & stakeholder alignment",
          "Process digitization & automation",
          "Technology adoption planning",
          "Innovation pipeline management",
          "Transformation governance & tracking",
        ],
        value: [
          "Faster, structured transformation delivery",
          "Higher user adoption, less resistance",
          "Reduced execution risk",
          "Measurable transformation KPIs",
        ],
      },
      {
        id: "data-analytics-advisory",
        title: "Data & Analytics Advisory",
        objective: "Establish trusted, well-governed data that is ready for decision-making.",
        scope: [
          "Data strategy and governance framework",
          "Data quality and architecture assessment",
          "BI and reporting enablement",
          "Analytics use-case identification",
          "Data platform and tooling selection",
          "Data literacy and training programs",
        ],
        value: [
          "Trusted, decision-ready data",
          "Faster and more confident reporting",
          "Reduced data risk and duplication",
          "Clear data governance ownership",
        ],
      },
      {
        id: "ai-lab",
        title: "AI Lab (ImpactLab)",
        objective: "Identify, prioritize and de-risk AI use cases before investing in delivery.",
        scope: [
          "AI maturity assessment for leadership",
          "Ideation workshops to identify and prioritize use cases",
          "AI strategy and roadmap definition",
          "Use-case feasibility and ROI scoring",
          "Data and platform readiness review",
          "Ethical and governance framework setup",
        ],
        value: [
          "Clear AI adoption roadmap",
          "Prioritized use-case backlog",
          "Leadership alignment on AI strategy",
          "Reduced execution risk on AI investments",
        ],
      },
      {
        id: "change-management",
        title: "Change Management & Training",
        objective: "Drive adoption and lasting behavior change on every new system.",
        scope: [
          "Change readiness assessment",
          "Stakeholder engagement planning",
          "Training needs and program design",
          "Adoption tracking and reinforcement",
          "Resistance management",
          "Change champion network setup",
        ],
        value: [
          "Higher adoption and lower resistance",
          "Faster time-to-value on new systems",
          "Sustained behavior change",
          "Stronger internal capability",
        ],
      },
    ],
    partnerIds: [],
    useCaseIds: ["inflight-catering", "energy-cost-optimization"],
  },

  // ── 02 TRANSFORM ───────────────────────────────────────────────────────
  {
    slug: "transform",
    num: "02",
    verb: "Transform",
    name: "Data, AI & IoT",
    ...fromStory("transform"),
    oneLiner: "Data, AI and IoT that hold up in production, not just in a demo.",
    intro: [
      "Grow Digital runs Data and AI delivery with our global partners Navinspire and GTech. Our data scientists and AI engineers build predictive models and decision systems that hold up in production — not just in a demo.",
      "The result: faster decisions, lower operating cost, and fewer people needed to babysit a dashboard.",
      "On the shop floor, we run industrial IoT with our partners SkySens and MaestroHub, connecting shop-floor data to the systems that run the business.",
    ],
    hero: img("transform-hero"),
    secondary: img("transform-detail"),
    services: [
      {
        items: [
          "Impact Lab – Ideation & Innovation Workshops",
          "Data Strategy & Assessment",
          "Data Management & Governance",
          "Data Integration Services",
          "Data Lake & Modern Data Platform Services",
          "Data Quality & Master Data Management",
          "Reporting, Analytics & Business Intelligence",
          "AI Strategy & Readiness",
          "AI Use Case Discovery & Prioritization",
          "Generative AI & AI Agent Solutions",
          "Predictive Analytics & Machine Learning",
          "Executive Intelligence & Decision Support",
          "IoT Strategy & Consulting",
          "IoT Platform & Solution Implementation",
          "IoT Data Integration & Analytics",
        ],
      },
      {
        title: "Industry-Specific AI Solutions",
        items: [
          "Healthcare",
          "Smart Cities",
          "Local Government",
          "Real Estate",
          "Construction",
          "Retail",
          "Financial Services",
          "Other industries",
        ],
      },
    ],
    deepDives: [
      {
        id: "data-management",
        title: "Data Management Services",
        body: [
          "Comprehensive solutions for collecting, storing, and protecting data. Data Warehousing (DWH) expertise lets organizations consolidate data from various sources, ensuring quality and consistency.",
          "The services support fast data processing and modern data management, with controlled, secure processing and regular audits to prevent unauthorized access and data breaches.",
        ],
      },
      {
        id: "data-integration",
        title: "Data Integration Services",
        body: [
          "Unifying data from multiple sources into a cohesive, accessible structure for analysis. Integration streamlines data flow, improves decision-making, and keeps data consistent and accurate across the business — critical for enhancing operational efficiency and making informed, data-driven decisions.",
          "These approaches improve data accessibility, consistency, and reporting.",
        ],
        bullets: [
          "Data Mining to extract valuable insights",
          "Data Warehousing to consolidate and standardize data from various sources",
          "Master Data Management (MDM) to ensure accuracy and quality in key data",
        ],
      },
      {
        id: "data-lake",
        title: "Data Lake Services",
        body: [
          "Store large volumes and diverse types of data, and derive value from them through various analytical methods. GTech's consultancy helps create hybrid data lakes that integrate multiple technologies for real-time and historical data analytics.",
          "A key advantage: no data modeling is needed during storage. Data models are created during discovery and exploration, giving the flexibility to generate insights across different domains.",
        ],
        partnerIds: ["gtech"],
      },
      {
        id: "reporting-bi",
        title: "Reporting and Business Intelligence",
        body: [
          "An end-to-end service that collects, processes, analyzes, and visualizes large datasets to support strategic, data-driven decisions, with safe storage in the cloud or on-premise. Self-service analytical features serve managers, data scientists, analysts, and consultants, and the tools manage complex data from sources such as ERPs, CRMs, and APIs.",
          "Our methodology incorporates in-memory analytics, live analytical reporting, and OLAP tools for complex queries — supporting decision-making, enhancing business processes, and helping identify trends and patterns in data to improve performance and strategic planning.",
        ],
        bullets: ["Quick analysis", "Easy-to-understand visuals", "Employee satisfaction", "Safe forecasts"],
      },
      {
        id: "ai-advanced-analytics",
        title: "AI and Advanced Analytics",
        body: [
          "Turn complex data into actionable insights. Machine learning, deep learning, and predictive analytics enable smarter decisions based on data: analyzing large datasets, automating processes, and providing real-time insights that go beyond traditional reporting.",
          "Modern frameworks ensure efficient data processing, whether it comes from sensors, smart devices, or other sources, so it is easier to integrate and act on data-driven insights, improve decision-making, optimize processes, and stay ahead.",
        ],
      },
      {
        id: "impactlab",
        title: "ImpactLab",
        body: [
          "Our AI value proposition runs in three steps: an AI lab (ImpactLab), a platform, and implementation.",
          "The platform is RAG-DATALAKE from Navinspire IA: a low code/no code platform with technological sovereignty, advanced automation, simplified industrialization, extended compatibility, and security and integration.",
        ],
        scope: [
          "AI maturity assessment",
          "AI & Gen AI foundation for leaders",
          "Ideation workshop (ImpactLab) to identify and prioritize the AI use cases",
          "Data preparation & engineering",
          "AI workflow development",
          "Integration with other back-office systems",
          "Change management and user training",
          "AI operations & lifecycle management",
        ],
        partnerIds: ["navinspire"],
      },
      {
        id: "industry-ai",
        title: "Industry-Specific AI Solutions",
        body: ["AI solutions shaped for specific industries:"],
        bullets: [
          "Healthcare",
          "Smart Cities",
          "Local Government",
          "Real Estate",
          "Construction",
          "Retail",
          "Financial Services",
          "Other industries",
        ],
      },
      {
        id: "industrial-iot",
        title: "Industrial IoT Solutions",
        body: [
          "Grow Digital runs industrial IoT with our partner SkySens: long-range wireless networks, predictive analytics, and data integration that connects the shop floor to the systems that run the business.",
        ],
        bullets: [
          "Energy monitoring and efficiency",
          "Predictive maintenance and asset performance",
          "Environmental, sustainability and carbon footprint monitoring",
          "Operational excellence and passenger comfort",
        ],
        partnerIds: ["skysens"],
      },
      {
        id: "manufacturing-iot",
        title: "Manufacturing IoT Solutions",
        body: [
          "Grow Digital runs an Industrial IoT platform with our partner MaestroHub, connecting shop-floor data directly into ERP and SCADA in real time. Manufacturers act on what the floor is telling them the same day, not the same quarter.",
        ],
        bullets: [
          "Energy cost optimization: real-time monitoring and mapping of energy usage to production output",
          "Reducing downtime: dynamic resource deployment using SCADA and maintenance data to optimize repair times and skill-based technician assignments",
          "Production efficiency: IIoT with data contextualization for role-based insights, anomaly detection and production optimization",
          "Improving product quality: real-time monitoring of reactor parameters and process adjustments using advanced analytics",
        ],
        partnerIds: ["maestrohub"],
      },
    ],
    partnerIds: ["navinspire", "gtech", "skysens", "maestrohub"],
    useCaseIds: [
      "inflight-catering",
      "vehicle-purchase-prediction",
      "banking-regulatory-chatbot",
      "healthcare-assistant",
      "fraud-aml-agentic-ai",
      "clinical-decision-support",
      "maintenance-scheduling",
      "skills-gap-management",
      "energy-cost-optimization",
      "reducing-downtime",
      "production-efficiency",
      "product-quality",
    ],
  },

  // ── 03 BUILD ───────────────────────────────────────────────────────────
  {
    slug: "build",
    num: "03",
    verb: "Build",
    name: "Software Development & Digital Experience",
    ...fromStory("build"),
    oneLiner: "Web, mobile and custom software, measured on load time and conversion.",
    intro: [
      "Web, mobile and custom applications, and the integrations between them, taken end to end: ideation, build, launch, and support after launch.",
    ],
    hero: img("build-hero"),
    secondary: img("build-detail"),
    services: [
      {
        items: [
          "Mobile Application Development",
          "Web Application Development",
          "Custom Application Development",
          "UX/UI Design",
          "Application Modernization",
          "API & Integration Development",
          "AI-Enabled Application Development",
          "Application Testing & Quality Assurance",
          "Application Support & Enhancement",
        ],
      },
    ],
    deepDives: [
      {
        id: "mobile-web",
        title: "Mobile/Web Development",
        body: [
          "Grow Digital builds mobile and web platforms that work on the device the customer actually owns — phone, tablet, or desktop. We build new or fix what's already breaking, and we're measured on load time and conversion, not on how the site looks in a screenshot.",
        ],
      },
      {
        id: "ux-ui",
        title: "UX/UI Design",
        body: [
          "Grow Digital designs interfaces people finish using without giving up halfway through. Research, wireframes, and testing come before a single pixel gets polished, because a beautiful screen nobody completes is a wasted build.",
        ],
      },
      {
        id: "application-development",
        title: "Application Development",
        body: [
          "Grow Digital builds custom applications end to end — ideation, build, launch, and support after launch. MERN, Java, Python: whatever the stack, the interface has to work the same way on web and mobile, because your customer doesn't care which platform they open.",
        ],
      },
      {
        id: "integration",
        title: "Integration Services",
        body: [
          "Grow Digital connects systems that were never built to talk to each other. We've wired payment gateways into multiple applications so the money moves without a manual step in between.",
        ],
        bullets: [
          "Healthcare Information Systems (HIS) to ERP",
          "Patient apps to HIS",
          "Oracle Fusion to NCR POS",
          "Payment gateways into multiple applications",
        ],
      },
    ],
    partnerIds: [],
    useCaseIds: [],
  },

  // ── 04 OPERATE ─────────────────────────────────────────────────────────
  {
    slug: "operate",
    num: "04",
    verb: "Operate",
    name: "Managed Services",
    ...fromStory("operate"),
    oneLiner: "SLA-based support that keeps revenue systems stable and available.",
    intro: [
      "SLA-based managed services with L1, L2 and L3 coverage for ERP, HIS, IoT and AI systems, plus cloud and infrastructure monitoring.",
      "The objective: system stability, continuous performance, and proactive operational support.",
    ],
    hero: img("operate-hero"),
    secondary: img("operate-detail"),
    services: [
      {
        items: [
          "Cloud Managed Services",
          "Application Managed Services",
          "Infrastructure Monitoring & Support",
          "Database Management & Support",
          "ERP/Application Support",
          "Service Management & Operational Support",
        ],
      },
      {
        title: "GrowShield Managed Services",
        items: [
          "Managed Security Monitoring",
          "Security Operations Support",
          "Threat Monitoring & Response",
          "Vulnerability Management",
          "Security Reporting & Advisory",
        ],
      },
    ],
    deepDives: [
      {
        id: "cloud-services",
        title: "Cloud Services",
        body: [
          "We help organizations adopt and run the leading cloud platforms, from migration and infrastructure design to security, analytics and AI.",
        ],
        bullets: [
          "Google Cloud Platform (GCP): cloud migration, infrastructure design, security implementation, big data analytics, and AI/ML solutions",
          "Microsoft Azure: Azure cloud solutions focused on scalability, security, and performance optimization",
          "Oracle Cloud: database management, application development, and enterprise resource planning (ERP) solutions",
          "IBM Cloud: IBM Cloud adoption, with an emphasis on hybrid cloud solutions and AI integration",
        ],
        partnerIds: ["google-cloud", "microsoft-azure", "oracle-cloud", "ibm-cloud"],
      },
      {
        id: "growshield",
        title: "GrowShield™ Managed Services",
        objective: "Ensure system stability, continuous performance, and proactive operational support.",
        scope: [
          "Application & system support (ERP, HIS, IoT, AI)",
          "L1, L2, L3 support coverage",
          "Incident & problem management",
          "Performance monitoring & optimization",
          "Patch management & upgrades",
          "SLA-based managed services",
          "Cloud & infrastructure monitoring",
        ],
        value: [
          "Reduced downtime & operational risk",
          "Improved system availability",
          "Predictable operational costs",
          "Proactive issue resolution",
          "Enhanced user satisfaction",
          "Long-term platform sustainability",
        ],
      },
    ],
    partnerIds: ["google-cloud", "microsoft-azure", "oracle-cloud", "ibm-cloud"],
    useCaseIds: ["reducing-downtime", "maintenance-scheduling"],
  },

  // ── 05 SECURE ──────────────────────────────────────────────────────────
  {
    slug: "secure",
    num: "05",
    verb: "Secure",
    name: "Cybersecurity",
    ...fromStory("secure"),
    oneLiner: "A security stack built around your actual risk profile, not a template.",
    intro: [
      "Our expert cybersecurity team is committed to understanding the unique challenges your company faces, and provides tailored solutions across a wide range of services.",
    ],
    hero: img("secure-hero"),
    secondary: img("secure-detail"),
    services: [
      {
        items: [
          "Cybersecurity Strategy & Roadmap",
          "Cybersecurity Assessment & Audit",
          "Cybersecurity Governance, Risk & Compliance",
          "Research & Security Advisory",
          "Vulnerability Assessment",
          "Security Architecture Review",
          "Risk Assessment",
          "Security Policies & Procedures",
          "Security Awareness & Training",
          "Cybersecurity Compliance Readiness",
          "Incident Response Advisory",
        ],
      },
    ],
    deepDives: [
      {
        id: "vapt",
        title: "Vulnerability Assessments and Penetration Testing",
        body: [
          "Rigorous assessments identify and address potential weaknesses in your systems, ensuring that your infrastructure is protected from potential threats.",
        ],
      },
      {
        id: "managed-security",
        title: "Managed Security Services",
        body: [
          "Our 24/7 monitoring and response services provide real-time threat detection and incident response, so you can focus on your core business while we keep a close eye on your security posture.",
        ],
      },
      {
        id: "cloud-security",
        title: "Cybersecurity for Cloud Environments",
        body: ["Security services for cloud environments, including but not limited to:"],
        bullets: [
          "Cloud security assessment",
          "Cloud security architecture & design",
          "Identity & access management (IAM)",
        ],
      },
      {
        id: "awareness-training",
        title: "Security Awareness Training",
        body: [
          "We give your employees the knowledge and skills necessary to identify and mitigate cyber threats. Our training programs promote a cybersecurity-conscious culture within your organization.",
        ],
      },
      {
        id: "expertise",
        title: "Comprehensive Expertise",
        body: [
          "Our cybersecurity professionals include some of the brightest minds in the industry. This diverse skill set enables us to provide comprehensive solutions that address all aspects of cybersecurity, leaving no stone unturned in securing your digital footprint.",
          "Along with our resources and partners, our journey has been adorned with accolades and industry recognition, which has solidified our position as cybersecurity market leaders.",
        ],
        bullets: ["Vulnerability assessments", "Penetration testing", "Strategic incident response planning"],
      },
    ],
    partnerIds: [],
    useCaseIds: [],
  },

  // ── 06 SOLVE ───────────────────────────────────────────────────────────
  {
    slug: "solve",
    num: "06",
    verb: "Solve",
    name: "Digital, Cloud & AI Solutions",
    ...fromStory("solve"),
    oneLiner: "Our own digital and AI products, plus partner platforms we exclusively represent.",
    intro: [
      "Our own digital and AI solutions, alongside the strategic partner solutions we deliver.",
      "Grow Digital is the exclusive representative and delivery arm for Inveon, Mobilgi, MaestroHub and SkySens in the Kingdom of Saudi Arabia and the UAE.",
    ],
    hero: img("solve-hero"),
    secondary: img("solve-detail"),
    services: [
      {
        title: "Grow Digital Solutions",
        items: [
          "Grow Bot by Grow Digital – Enterprise AI Assistant & Conversational AI Platform",
          "Medical Decision & Approval Intelligence Platform by Grow Digital – AI-enabled healthcare decision and approval automation",
          "ATHAR Electronic Medical Record by Grow Digital – Digital healthcare and patient record platform",
        ],
      },
      {
        title: "Partner Solutions",
        items: [
          "InCommerce by Inveon – Digital Commerce Platform",
          "OneStore by Mobilgi – Enterprise Collaboration Platform",
        ],
      },
    ],
    deepDives: [
      {
        id: "incommerce",
        title: "InCommerce by Inveon",
        body: [
          "Inveon InCommerce is an agile way to build, launch and expand your e-commerce business across different channels, marketplaces and partners.",
        ],
        bullets: [
          "Omni-channel commerce platform",
          "Marketplace integrator",
          "App-commerce",
          "Order management system",
          "Loyalty module",
          "Real-time promotions",
        ],
        image: img("sol-incommerce"),
        partnerIds: ["inveon"],
      },
      {
        id: "onestore",
        title: "OneStore by Mobilgi",
        body: ["Retail store operations: Mobilgi OneStore is a visual merchandising solution."],
        bullets: [
          "Provides the most comprehensive toolkit for all users, store staff and managers, in a single easy-to-use software package",
          "Acts as the connective tissue between your store, field team and headquarters",
        ],
        image: img("sol-onestore"),
        partnerIds: ["mobilgi"],
      },
    ],
    partnerIds: ["inveon", "mobilgi", "maestrohub", "skysens"],
    useCaseIds: ["healthcare-assistant", "clinical-decision-support"],
  },

  // ── 07 GROW ────────────────────────────────────────────────────────────
  {
    slug: "grow",
    num: "07",
    verb: "Grow",
    name: "Marketing & Growth",
    ...fromStory("grow"),
    oneLiner: "Every growth lever pulled together, with no siloed tactics.",
    intro: [
      "Our Marketing Services business unit brings digital marketing, business development and marketing research together.",
      "GrowthLab adds the data analytics, and a team of growth management experts adds Inveon's know-how, ecosystem and benchmarking capability.",
    ],
    hero: img("grow-hero"),
    secondary: img("grow-detail"),
    services: [
      {
        items: [
          "Digital Marketing Strategy",
          "Social Media Marketing",
          "Content Strategy & Development",
          "Performance Marketing",
          "Campaign Management",
          "Search & Digital Visibility",
          "Lead Generation",
          "Business Development Services",
          "Market Research & Competitive Analysis",
          "Go-to-Market Strategy",
          "Growth Lab – Data Analytics",
          "Customer & Campaign Analytics",
          "Marketing Performance Dashboards",
          "Growth Insights & Optimization",
        ],
      },
    ],
    deepDives: [
      {
        id: "digital-marketing",
        title: "Digital Marketing",
        body: ["From marketing planning through execution, with CRM access and project management built in."],
        scope: [
          "Marketing planning",
          "Social media management",
          "Portal management",
          "SEO",
          "Blogs/content management",
          "Influencers' campaigns",
          "Database acquisition",
          "SMS push",
          "Event management",
          "Media advertisement",
          "Graphic design & video editing",
          "CRM access",
          "Project management",
        ],
      },
      {
        id: "business-development",
        title: "Business Development",
        body: [
          "Grow Digital assists businesses in developing effective strategies for growth and expansion, leveraging market insights and industry expertise.",
        ],
      },
      {
        id: "growthlab-data",
        title: "GrowthLab – Data Analytics",
        objective: "A data strategy built to match your EPG business plan — not bolted on after the fact.",
        body: [
          "Our objective is to empower your business by maximizing the value of your EPG data while maintaining complete control. As your growth partner, we are committed to supporting your vision for data standardization and integration.",
        ],
        scope: [
          "Data governance strategy & framework development, tailored to your business needs",
          "Sanitization of past data: sanitizing and standardizing legacy data to bring it in line with the current framework",
          "Standardization & integration of ongoing data inflow, to manage the continuous flow of data into your systems",
          "Control framework & ongoing monitoring, to safeguard data quality and security",
        ],
      },
      {
        id: "growth-management",
        title: "Growth Management",
        body: [
          "A team of growth management experts boosts your online growth and revenue through Inveon's extensive know-how, ecosystem and benchmarking capability.",
        ],
        bullets: [
          "SEO: optimizing your SEO to give your brand greater searchability and visibility",
          "UI/UX: brand-specific designs that maximize time spent on-site and increase conversion rates",
          "Growth partnerships: managing your partnership network to ensure growth, improve processes and increase returns",
          "Performance marketing: maximizing returns and increasing brand awareness through online channels",
          "Data analytics: effective analysis of data to identify issues and provide powerful insights",
        ],
        partnerIds: ["inveon"],
      },
      {
        id: "growthlab-customer-success",
        title: "GrowthLab: Reinventing Customer Success",
        objective: "Every growth lever pulled together — no siloed tactics, no budget wasted chasing the wrong channel.",
        body: ["GrowthLab spans strategy, channels and content, and data and analytics."],
        bullets: [
          "Global market expansion planning",
          "Participating in channel prioritization decisions",
          "Marketing budget allocation for the best return on investment",
          "Designing unified commerce flows",
          "Omnichannel marketing implementation",
          "Using the customer experience journey before and after purchase",
          "Directing brands with quantitative UI/UX metrics",
          "Regular pain point detection across the customer experience journey",
          "Internal anomaly detection and suggestion tools",
          "Benchmarking and instant best-practice implementation",
        ],
      },
    ],
    partnerIds: ["inveon"],
    useCaseIds: ["vehicle-purchase-prediction"],
  },
];

export function getPillar(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}

export function pillarHref(slug: PillarSlug): string {
  return `/pillars/${slug}`;
}

// ── Pillar-specific extras (rendered outside the deep-dive loop) ─────────

export interface Highlight {
  title: string;
  text: string;
}

/** TRANSFORM extra: Agile Predictive Monitoring (deck slides 20–21, 23). */
export const AGPM = {
  title: "Agile Predictive Monitoring (AGPM) for smarter infrastructure",
  partnerIds: ["skysens"],
  benefits: [
    {
      title: "Low-cost digitalization",
      text: "Agile Predictive Monitoring platforms enable cost-effective AI deployment using affordable IoT devices and built-in AI, eliminating the need for third-party services and potentially reducing costs by up to tenfold.",
    },
    {
      title: "Suitable for lean enterprises",
      text: "Customizable no-code interfaces and diverse sensors streamline operations, tackle challenges, and lower costs, aligning with lean enterprise practices.",
    },
    {
      title: "Native AI implementation",
      text: "Quick integration of operational parameters with AI capabilities such as anomaly detection, at a low cost, simplifying data acquisition and architecture processes.",
    },
    {
      title: "Different industries",
      text: "Applications in sectors like manufacturing, logistics, energy, industrial enterprises, fuel stations, airports, and smart facilities such as smart hospitals and smart schools.",
    },
  ] satisfies Highlight[],
  /** Platform qualities (deck slide 23, IoT value proposition) */
  platform: ["Flexibility", "User centricity", "Scalability", "Adaptability", "Inclusivity"],
};

/** SECURE extra: "What's special about us" (deck slide 36). */
export const SECURE_SPECIAL = {
  title: "What's special about us",
  points: [
    {
      title: "Custom-built defense",
      text: "We build the security stack around your actual risk profile, not a template. You get a defense that matches your threat model, not a generic checklist.",
    },
    {
      title: "Tailored to your risk profile",
      text: "Retail, healthcare, and finance don't face the same threats. Your defense is scoped to your industry and your actual attack surface, not a one-size template.",
    },
    {
      title: "24/7 real-time vigilance",
      text: "Round-the-clock monitoring catches threats before they reach your systems, so your team can focus on the business instead of watching a dashboard.",
    },
  ] satisfies Highlight[],
};
