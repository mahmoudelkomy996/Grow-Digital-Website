// The four service pillars. Source: "Grow Digital – Services Listing and Descriptions" (October 2026),
// docs/content/services-listing-2026-10.txt. Copy is verbatim from the document, lightly trimmed for the web.
import { img } from "./images.ts";
import type { ImageRef } from "./types.ts";

export type ServiceSlug = "consultancy" | "managed-services" | "software-development" | "digital-marketing";

export interface ServiceDetail {
  id: string; // anchor id on the pillar page
  name: string;
  /** One-line summary for menus and cards */
  summary: string;
  /** Full description paragraphs */
  body: string[];
  listTitle: "What we deliver" | "What is included" | "What we assess";
  list: string[];
  /** Additional titled lists (e.g. AI governance checks, what we assess + what we deliver) */
  extras?: { title: string; intro?: string; items: string[] }[];
  outcome?: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  /** The leadership question the practice answers (consultancy) */
  question?: string;
  intro?: string;
  services: ServiceDetail[];
}

export interface ModelRow {
  name: string;
  text: string;
}

export interface Product {
  name: string;
  text: string;
  toConfirm?: boolean;
}

export interface Package {
  name: string;
  bestFor: string;
  delivers: string;
}

export interface ServicePillar {
  slug: ServiceSlug;
  num: "01" | "02" | "03" | "04";
  /** Short label for the header */
  navLabel: string;
  name: string;
  /** "We advise" … — the role of the pillar in the journey */
  role: string;
  /** Short line under the name in menus and cards */
  tagline: string;
  /** Page H1, one word in *asterisks* */
  headline: string;
  intro: string[];
  hero: ImageRef;
  secondary: ImageRef;
  groups: ServiceGroup[];
  coverage?: { title: string; intro: string; rows: ModelRow[] }[];
  products?: { intro: string; items: Product[] };
  packages?: { intro: string; items: Package[]; note: string };
  /** Aliases used by shared components (blog labels): verb = navLabel, oneLiner = tagline */
  verb: string;
  oneLiner: string;
}

export const SERVICES_INTRO = {
  lead: "Grow Digital is a technology and growth partner established in the UAE, serving organizations across the Gulf with a dedicated focus on the Kingdom of Saudi Arabia.",
  pillars: "Our services are organized into four pillars. Together they cover the full journey from the first idea to daily operations: we advise, we build, we market and we operate.",
};

const s = (
  id: string,
  name: string,
  summary: string,
  body: string[],
  listTitle: ServiceDetail["listTitle"],
  list: string[],
  outcome?: string,
  extras?: ServiceDetail["extras"],
): ServiceDetail => ({ id, name, summary, body, listTitle, list, outcome, extras });

const SERVICE_DATA: Omit<ServicePillar, "verb" | "oneLiner">[] = [
  // ── 01 Consultancy and Digital Transformation ──────────────────────────
  {
    slug: "consultancy",
    num: "01",
    navLabel: "Consultancy",
    name: "Consultancy & Digital Transformation",
    role: "We advise",
    tagline: "Where to invest in digital, and in what order.",
    headline: "Direction you can take to the *board*.",
    intro: [
      "Grow Digital helps organizations across the Gulf decide where to invest in digital, then stays with them until that investment pays back.",
      "Our consultants work side by side with our software, marketing and managed services teams, so every recommendation is tested against what can actually be delivered. You get a direction you can explain to your board, a plan your teams can follow, and results you can measure.",
      "Our consulting services are organized into four practices. Each practice answers a different leadership question.",
    ],
    hero: img("consult-hero"),
    secondary: img("consult-detail"),
    groups: [
      {
        id: "strategy-and-transformation",
        name: "Strategy & Transformation",
        question: "Where should we invest, and in what order?",
        intro: "For leaders who need a clear direction before they commit budget.",
        services: [
          s("digital-transformation", "Digital Transformation", "Business priorities turned into a practical transformation program.",
            ["We turn business priorities into a practical transformation program. We assess where you stand today, define the target operating model, and build a prioritized roadmap with quick wins, owners and measurable outcomes."],
            "What we deliver",
            ["Current state and digital maturity assessment", "Transformation strategy and prioritized roadmap", "Operating model, governance and KPI framework", "Quick wins and hands-on support during execution"],
            "One agreed plan that links every digital initiative to a business result."),
          s("data-and-ai-strategy", "Data & AI Strategy", "Where data and AI will create real value, and what it takes.",
            ["We help leadership decide where data and AI will create real value, and what it takes to get there. That covers data foundations, governance, skills and a portfolio of use cases, each with its own business case."],
            "What we deliver",
            ["AI and data readiness assessment", "Use case portfolio and prioritization", "Data governance and responsible AI guidelines", "Roadmap and business case"],
            "AI investment focused on the few use cases that matter most, with the risks understood upfront."),
          s("ai-lab", "AI Ideation Workshop (AI Lab)", "From AI awareness to validated use cases and a pilot plan.",
            ["The AI Lab is a facilitated workshop where your business and technology leaders discover, shape and prioritize AI opportunities for your own organization. Your team moves from awareness to a shortlist of validated use cases and a plan for the first pilot."],
            "What we deliver",
            ["AI awareness session for executives and teams", "Use case ideation by function or process", "Scoring of ideas by value, feasibility and risk", "Outline of a prototype or proof of concept", "Pilot plan with owners and success measures"],
            "A shortlist of AI use cases your own team believes in, and a pilot that is ready to start.",
            [{
              title: "AI governance built into the methodology",
              intro: "Governance is part of how we take each use case from idea to live operation. It is built into the implementation methodology from the first step, so every use case passes through eight checks in order.",
              items: [
                "Use case classification: each use case classified by purpose and level of risk",
                "Data assessment: the data is available, of sufficient quality and approved for this use",
                "Clinical risk: for healthcare use cases, the potential impact on patient safety and care decisions",
                "Privacy: how personal data is used and protected, in line with applicable regulations",
                "Cybersecurity: the security controls needed around the model, the data and the integrations",
                "Human oversight: who reviews AI outputs and who remains accountable for decisions",
                "Validation: accuracy, reliability and fairness tested before go-live",
                "Monitoring: performance tracked after go-live, with action when results drift",
              ],
            }]),
          s("digital-product-and-growth-strategy", "Digital Product & Growth Strategy", "Product, business model and path to market for digital businesses.",
            ["For technology, proptech and entertainment businesses, we shape the digital product, the business model and the path to market. Your platform launches with a clear proposition and a plan to grow users and revenue."],
            "What we deliver",
            ["Market and customer analysis", "Product proposition and business model", "Go-to-market and growth plan", "Product roadmap and KPIs"],
            "A product that enters the market with a reason to win and a plan to scale."),
        ],
      },
      {
        id: "governance-and-delivery",
        name: "Governance & Delivery",
        question: "How do we keep delivery under control and bring our people with us?",
        intro: "For organizations with programs under way that need control, assurance and adoption.",
        services: [
          s("pmo", "Project Management Office (PMO)", "Control over projects, vendors and benefits.",
            ["We set up and run Project Management Offices that give leadership control over projects, vendors and benefits. We can establish your PMO, operate it on your behalf, or manage a single strategic program such as an ERP or hospital information system implementation."],
            "What we deliver",
            ["PMO setup: governance, processes, templates and tools", "Portfolio and program management", "Vendor and contract follow-up", "Executive dashboards and status reporting", "Risk, issue and change control"],
            "Leadership sees the true status of every project and can act before delays become losses."),
          s("project-quality-assurance", "Project Quality Assurance", "Independent assurance on projects delivered by vendors or internal teams.",
            ["We provide independent assurance on projects delivered by vendors or internal teams. You know whether a project is on track, and what to correct before problems become costly."],
            "What we deliver",
            ["Project health checks and stage-gate reviews", "Review of vendor deliverables against the contract and requirements", "Testing and go-live readiness assessment", "Recommendations and follow-up of corrective actions"],
            "An objective view of project health from a team that sits on your side of the table."),
          s("change-management", "Change Management", "The human side of change, so new systems are adopted.",
            ["Transformation succeeds when people adopt it. We plan and manage the human side of change, so new systems, processes and structures are understood, accepted and used."],
            "What we deliver",
            ["Change impact and readiness assessment", "Stakeholder engagement and communication plan", "Training plan and support for its delivery", "A network of change champions", "Adoption tracking after go-live"],
            "Teams that use what was built, and a return on the investment behind it."),
          s("capability-building", "Capability Building & Talent Development", "The skills and leadership to sustain transformation.",
            ["We help you build the skills and leadership needed to sustain transformation long after the consultants leave. Our support runs from capability assessment through to mentoring and hiring."],
            "What we deliver",
            ["Capability and skills gap assessment", "Identification of high-potential talent", "Mentoring for leaders and teams", "Support for hiring strategy and role definition"],
            "An organization that can carry its own transformation forward."),
        ],
      },
      {
        id: "operations-and-technology",
        name: "Operations & Technology",
        question: "How do we run technology better, safer and at lower cost?",
        intro: "For IT and operations leaders who need technology to run better, safer and at lower cost.",
        services: [
          s("it-operating-model", "IT Operating Model & Shared Services", "How IT is organized, governed and delivered.",
            ["We redesign how IT is organized, governed and delivered, including shared services across group companies. The aim is less duplication, better service quality and tighter cost control."],
            "What we deliver",
            ["IT organization, roles and governance design", "Shared services model and centralization strategy", "IT service management practices", "Transition plan"],
            "An IT function that is structured around the business it serves."),
          s("erp-and-business-systems", "ERP & Business Systems Advisory", "Selection, implementation and optimization of ERP, CRM and HR.",
            ["We guide the selection, implementation and optimization of core business systems such as ERP, CRM and HR. We act on your side from requirements through to go-live."],
            "What we deliver",
            ["Business requirements and process design", "Request for proposal preparation and vendor evaluation", "Implementation oversight", "Stabilization and optimization of existing systems"],
            "The right system, chosen for the right reasons, and delivered to what was agreed."),
          s("process-improvement-and-automation", "Process Improvement & Automation", "Simpler, automated priority processes.",
            ["We simplify and automate priority business processes. That removes manual work, shortens cycle times and improves control."],
            "What we deliver",
            ["Process mapping and analysis", "Process redesign and standardization", "Identification of automation opportunities", "Policies, procedures and KPIs"],
            "Leaner processes your teams can follow and your managers can measure."),
          s("vendor-and-contract-optimization", "Vendor & Contract Optimization", "Lower technology spend and better-governed vendors.",
            ["We review your technology vendors, contracts and licenses to reduce cost and remove overlap. We also strengthen service levels and the way vendors are governed."],
            "What we deliver",
            ["Vendor landscape and spend analysis", "License and contract optimization", "Service level framework", "Vendor governance model"],
            "Lower technology spend and vendors who are held to clear commitments."),
          s("cybersecurity-consultancy", "Cybersecurity Consultancy", "Know your exposure, test your defenses, prepare for incidents.",
            ["Our cybersecurity specialists help you understand your exposure, test your defenses and prepare for incidents. We also build a security-aware workforce, because many incidents start with people, not technology."],
            "What we deliver",
            ["Vulnerability assessments", "Penetration testing", "Strategic incident response planning", "Cybersecurity awareness programs for employees and executives"],
            "Known risks, tested defenses and employees who recognize a threat when they see one."),
        ],
      },
      {
        id: "industry-advisory",
        name: "Industry Advisory",
        question: "What does good look like in our sector?",
        intro: "For organizations that want advisors who already understand their sector.",
        services: [
          s("healthcare-it-consultancy", "Healthcare IT Consultancy", "Systems and processes that connect care, administration and revenue.",
            ["We advise hospitals and healthcare providers on the systems and processes that connect clinical care, administration and revenue. Our consultants combine knowledge of healthcare operations with technology expertise."],
            "What we deliver",
            ["Assessment, selection and implementation oversight of hospital information systems", "Revenue cycle and payer integration, including readiness for NPHIES", "Patient experience: mobile applications, chatbots and portals", "Improvement of clinical and operational workflows", "Healthcare data, AI and regulatory alignment"],
            "Systems that support clinicians, protect revenue and improve the patient journey."),
          s("healthcare-ai-readiness", "Healthcare AI & Data Readiness Assessment", "Is your data ready for AI? The first step before an AI program.",
            ["Before a healthcare provider invests in AI, it needs to know whether its data and systems can support it. This focused assessment, designed for healthcare organizations in Saudi Arabia, reviews your foundations and identifies the AI use cases worth pursuing first. It is the natural first step before a larger AI program."],
            "What we assess",
            [
              "Interoperability: how well clinical, administrative and payer systems exchange information",
              "APIs: availability, standards and security of the interfaces AI solutions will depend on",
              "Data quality: completeness, accuracy and consistency of clinical and operational data",
              "Clinical terminology: use of standard coding and terminology across your systems",
              "Cybersecurity: protection of patient data and the controls needed around AI",
              "Governance: data ownership, policies and alignment with the Kingdom's data and AI regulations",
              "Priority AI use cases: the strongest opportunities, ranked by feasibility and risk",
            ],
            "A clear view of what is ready, what must be fixed first and which AI projects to start with.",
            [{ title: "What we deliver", items: ["Readiness report with findings for each area", "Gap analysis and remediation plan", "Shortlist of priority AI use cases", "Roadmap to your first AI project"] }]),
          s("real-estate-and-proptech", "Real Estate & PropTech Advisory", "Digitizing the full property cycle.",
            ["We help developers, contractors and proptech companies digitize the full property cycle. That runs from sales and customer management to construction controls, handover and community services."],
            "What we deliver",
            ["Digital strategy for developers and contractors", "ERP, CRM and project controls advisory", "Customer journey, sales and community platforms", "PropTech product and platform strategy"],
            "Faster sales cycles, tighter project control and a better experience for buyers and residents."),
          s("smart-city-and-digital-government", "Smart City & Digital Government Advisory", "Better citizen services and transformation programs that stay on track.",
            ["We support municipalities and government entities in improving citizen services, running transformation programs and building national capabilities."],
            "What we deliver",
            ["Design of digital services and citizen experience", "Smart city platform strategy", "Program management for government initiatives", "Capability development programs"],
            "Services citizens find easy to use, delivered through programs that stay on track."),
        ],
      },
    ],
  },

  // ── 02 Managed Services (GrowShield™) ──────────────────────────────────
  {
    slug: "managed-services",
    num: "02",
    navLabel: "Managed Services",
    name: "Managed Services",
    role: "We operate",
    tagline: "GrowShield™: protection, stability and proactive support.",
    headline: "IT operations you can *hand over*.",
    intro: [
      "GrowShield™ Managed Services is Grow Digital's managed services offering. It is built on three commitments: protection, stability and proactive support.",
      "You can hand over your IT operations in full, or in part. Under full coverage, we operate your entire IT environment as your IT operations partner. Under partial coverage, we take responsibility for selected systems, service areas or support levels, and work alongside your IT team and vendors for the rest.",
      "In both cases, the service provides seamless IT operations, improved system performance and optimized cost, so your team can focus on business growth.",
    ],
    hero: img("operate-hero"),
    secondary: img("operate-detail"),
    groups: [
      {
        id: "service-areas",
        name: "Service areas",
        intro: "GrowShield™ is organized into ten service areas that together cover the full IT landscape. You choose the areas you need.",
        services: [
          s("service-desk", "Service Desk & End-user Support", "A single point of contact for IT support.",
            ["Your users get a single point of contact for IT support. We handle incidents and requests quickly, so your people stay productive."],
            "What is included", ["Single point of contact for all users", "Incident and service request handling", "User onboarding and offboarding", "Device and workplace application support", "Knowledge base for common issues"]),
          s("business-applications", "Business Applications", "ERP, CRM, HR, industry and custom apps, kept current.",
            ["We keep the applications your business runs on available, up to date and aligned with the way you work. The service covers ERP, CRM, HR, industry and custom applications."],
            "What is included", ["Application monitoring", "Functional and technical support", "Patching and upgrades", "Minor enhancements", "Integrations and release management"]),
          s("oracle", "Oracle Applications & Technology", "The full Oracle landscape, from applications to engineered systems.",
            ["Our Oracle specialists support the full Oracle landscape, from business applications to databases and engineered systems."],
            "What is included", ["Support of E-Business Suite, Fusion Applications, Database, Exadata, Fusion Middleware, Analytics and EPM", "Administration, patching and upgrades", "Performance tuning", "Cloning and migration", "Backup and recovery", "High availability and disaster recovery"]),
          s("databases", "Databases & Data Platforms", "Data that stays available, fast and recoverable.",
            ["We administer the database technologies you use and keep your data available, fast and recoverable."],
            "What is included", ["Database administration", "Performance and query tuning", "Backup and recovery", "High availability", "Regular health checks", "Support of data warehouse and reporting platforms"]),
          s("infrastructure", "Infrastructure & Data Center", "The servers, storage and operating systems everything depends on.",
            ["We operate the servers, storage and operating systems that every other system depends on."],
            "What is included", ["Administration of servers, storage, virtualization and operating systems", "Monitoring and patching", "Backup", "Capacity planning", "Coordination of hardware vendors"]),
          s("cloud-operations", "Cloud Operations", "Public, private and hybrid cloud, with cost and governance under control.",
            ["We run your public, private and hybrid cloud environments, and keep their cost and governance under control."],
            "What is included", ["Cloud administration", "Cost optimization", "Cloud governance", "Migration support", "Resilience"]),
          s("network", "Network & Connectivity", "Sites, users and systems connected and protected.",
            ["We keep your sites, users and systems connected and protected."],
            "What is included", ["Local and wide area networks and wireless", "Firewalls and remote access", "Monitoring", "Configuration and troubleshooting", "Coordination of connectivity providers"]),
          s("cybersecurity-operations", "Cybersecurity Operations", "Monitoring, vulnerabilities and incident response.",
            ["We watch over your environment, close vulnerabilities and respond when an incident occurs."],
            "What is included", ["Security monitoring", "Vulnerability and patch management", "Identity and access management", "Endpoint protection", "Incident response", "Compliance reporting"]),
          s("websites-portals-apps", "Websites, Portals & Mobile Applications", "Digital channels online, secure and current.",
            ["We keep your digital channels online, secure and current."],
            "What is included", ["Hosting operations", "Availability monitoring", "Technical and security updates", "Content support", "App store releases"]),
          s("vendor-and-asset-management", "IT Vendor & Asset Management", "Contracts, licenses and renewals under control.",
            ["We manage your technology vendors and assets on your behalf, so that contracts, licenses and renewals stay under control."],
            "What is included", ["Coordination of third-party vendors", "Tracking of licenses, support contracts and renewals", "IT asset register"]),
        ],
      },
    ],
    coverage: [
      {
        title: "Coverage models",
        intro: "GrowShield™ can cover your IT systems fully or partially.",
        rows: [
          { name: "Full Managed Services", text: "Grow Digital operates and supports the entire IT environment and is accountable for all service levels." },
          { name: "Partial Managed Services", text: "Grow Digital is responsible for selected systems or service areas. Your IT team or other vendors keep the rest." },
          { name: "Co-managed Services", text: "Responsibility is shared within the same systems. For example, Grow Digital provides specialist or after-hours support behind your own service desk." },
        ],
      },
      {
        title: "Resourcing models",
        intro: "Choose how the team behind the service is staffed.",
        rows: [
          { name: "Dedicated Managed Services", text: "A full-time support team assigned to your organization." },
          { name: "Shared Managed Services", text: "A cost-effective model in which a shared team supports several customers." },
          { name: "On-Demand Support", text: "Pay-as-you-go support for ad hoc services and escalations." },
          { name: "Hybrid Model", text: "A combination of dedicated and shared services for cost efficiency." },
        ],
      },
    ],
  },

  // ── 03 Software Development ────────────────────────────────────────────
  {
    slug: "software-development",
    num: "03",
    navLabel: "Software",
    name: "Software Development",
    role: "We build",
    tagline: "Mobile, web, business applications and AI.",
    headline: "Software people *finish* using.",
    intro: [
      "Grow Digital covers the full range of software development: mobile, web, business applications and artificial intelligence.",
      "All four are delivered through the same disciplined approach, from discovery and design, through iterative build and quality assurance, to go-live and support. A solution that combines several of them is designed and delivered as one.",
    ],
    hero: img("build-hero"),
    secondary: img("build-detail"),
    groups: [
      {
        id: "development-services",
        name: "Development services",
        services: [
          s("mobile-development", "Mobile Development", "iOS and Android apps customers and employees want to use.",
            [
              "We design and build mobile applications for iOS and Android that customers and employees want to use. Depending on your requirement, we develop native applications for the best performance and device integration, or cross-platform applications that share one code base to reduce cost and time to market.",
              "Every application is designed for Arabic and English, including right-to-left layouts, and is connected securely to your back-end systems.",
            ],
            "What we deliver", ["User experience and interface design for mobile, tested with real users", "Native applications for iOS and Android", "Cross-platform applications built on one code base", "Arabic and English interfaces, including right-to-left layouts", "Secure integration with your back-end systems", "Publication on the app stores", "Monitoring and improvement after launch"]),
          s("web-development", "Web Development", "Websites, portals, e-commerce and content platforms.",
            ["We design and build websites, portals, e-commerce and content platforms that are fast, secure and easy to manage. Every site works on any device, is built to be found by search engines and is accessible to all users."],
            "What we deliver", ["Corporate websites and landing pages", "Customer, partner and employee portals", "E-commerce platforms", "Content management platforms", "Responsive design for every device", "Search optimization, accessibility and security built in", "Arabic and English content"]),
          s("application-development", "Application Development", "Custom business applications that fit the way you work.",
            [
              "We build custom business applications that fit the way you work. These include workflow and approval systems, operational platforms, management dashboards and integrations between existing systems such as ERP, CRM and core business applications.",
              "We start from the business process, design the solution with the people who will use it, and deliver in short iterations, so you see working software early.",
            ],
            "What we deliver", ["Business analysis, process design and functional specification", "Custom web-based and cloud-based business applications", "Workflow automation, approval cycles and business rules engines", "Integration with ERP, CRM, government platforms and legacy systems through secure interfaces", "Data migration, reporting and management dashboards", "Role-based access, audit trail and deployment in the cloud or on your premises", "Modernization of legacy applications"]),
          s("artificial-intelligence", "Artificial Intelligence", "AI where it delivers a measurable business result.",
            [
              "We apply artificial intelligence where it delivers a measurable business result, such as faster decisions, lower processing cost or better customer service. Our AI solutions range from assistants and chatbots built on large language models, to document processing, prediction and recommendation models.",
              "Every AI solution is designed with human oversight, traceable outputs and data protection built in, so that it can be trusted and audited.",
            ],
            "What we deliver", ["Assessment of AI use cases and their business case", "Generative AI assistants and chatbots in Arabic and English, grounded in your own knowledge and documents", "Intelligent document processing: extraction, classification and summarization", "Predictive, scoring and recommendation models built on your data", "Integration of AI into existing applications and workflows", "Model evaluation, monitoring and governance, with human confirmation for decisions that matter", "Data residency and privacy by design, in line with the applicable data protection law"]),
        ],
      },
    ],
    products: {
      intro: "Alongside custom development, we build our own products for the sectors we know best.",
      items: [
        { name: "Grow Bot", text: "A WhatsApp chatbot that lets customers and patients reach your services in the channel they already use." },
        { name: "Athar", text: "An electronic medical record (EMR) system for healthcare providers." },
        { name: "Medical Decision Support System", text: "A decision support platform for healthcare providers.", toConfirm: true },
        { name: "Patient Mobile App", text: "A mobile application that connects patients with their healthcare provider.", toConfirm: true },
      ],
    },
  },

  // ── 04 Digital Marketing ───────────────────────────────────────────────
  {
    slug: "digital-marketing",
    num: "04",
    navLabel: "Digital Marketing",
    name: "Digital Marketing",
    role: "We market",
    tagline: "Presence, leads and sales growth.",
    headline: "Growth you can *measure*.",
    intro: [
      "We help businesses across the Gulf build their presence, generate leads and grow sales. Every program starts with a marketing audit and a plan, and every month ends with a clear report on what your budget delivered.",
      "Our services are available in three packages, so the level of service matches your stage of growth and your budget.",
    ],
    hero: img("grow-hero"),
    secondary: img("grow-detail"),
    groups: [
      {
        id: "marketing-services",
        name: "Marketing services",
        services: [
          s("strategy-and-planning", "Strategy & Planning", "The plan the whole program follows.",
            ["We start by understanding your market, your customers and your current results. Then we build the plan that the whole program follows."],
            "What is included", ["Marketing audit and strategy", "Quarterly and annual marketing plans", "Monthly content calendar", "Competitor monitoring", "Campaign concepts"]),
          s("social-media-management", "Social Media Management", "Your brand active, consistent and responsive, every day.",
            ["We manage your social media platforms day to day, so your brand stays active, consistent and responsive."],
            "What is included", ["Management of your social media platforms", "Regular posts and stories", "Community management and replies to your audience"]),
          s("content-and-creative", "Content & Creative", "Design, copy, video and photography, in Arabic and English.",
            ["We produce the content that carries your brand: designs, copy, videos and photography, in Arabic and English."],
            "What is included", ["Graphic design for posts and advertisements", "Copywriting in Arabic and English", "Short videos and reels", "Photo and video shoots", "Campaign key visuals"]),
          s("paid-media", "Paid Media", "Campaigns tested continuously for return.",
            ["We plan, run and optimize paid campaigns on the platforms your customers use. We test continuously to improve the return on your media budget."],
            "What is included", ["Paid media management across platforms", "Always-on and seasonal campaigns", "Audience and creative testing"]),
          s("search-and-website", "Search & Website", "Help customers find you, and act when they arrive.",
            ["We help customers find you, and act when they arrive."],
            "What is included", ["On-page and technical search engine optimization", "Search-optimized articles", "Landing pages", "Conversion rate optimization"]),
          s("email-messaging-automation", "Email, Messaging & Automation", "Timely messages and automated follow-up.",
            ["We keep your leads and customers engaged with timely, relevant messages, and we automate the follow-up."],
            "What is included", ["Email and messaging campaigns", "Lead nurturing journeys", "Lead scoring", "Integration with your CRM"]),
          s("influencer-marketing", "Influencer Marketing", "The right voices, from brief to results.",
            ["We match your brand with the right voices and manage the campaign from brief to results."],
            "What is included", ["Influencer selection", "Campaign management", "Reporting on campaign results"]),
          s("analytics-and-reporting", "Analytics & Reporting", "Tracking, a live dashboard and agreed KPIs.",
            ["You see what your budget delivered. We set up tracking, give you a live dashboard and report on the KPIs we agreed."],
            "What is included", ["Tracking setup, conversion tracking and attribution", "Live dashboard", "Weekly progress and monthly performance reports", "Quarterly strategy review"]),
        ],
      },
    ],
    packages: {
      intro: "Three packages, so the level of service matches your stage of growth and your budget.",
      items: [
        { name: "Starter", bestFor: "Businesses building a consistent digital presence", delivers: "The essentials: managed social media, core content, basic paid promotion and a monthly report." },
        { name: "Growth", bestFor: "Businesses that want measurable growth in leads and sales", delivers: "Everything in Starter, plus multi-platform paid media, SEO, video content, email campaigns and a dedicated Growth Advisor." },
        { name: "Premium", bestFor: "Businesses that need a complete marketing function", delivers: "Everything in Growth, plus a dedicated team, always-on campaigns, marketing automation, influencer management and advanced analytics." },
      ],
      note: "You can move to a larger package as your business grows.",
    },
  },
];

export const SERVICES: ServicePillar[] = SERVICE_DATA.map((p) => ({ ...p, verb: p.navLabel, oneLiner: p.tagline }));

export function getService(slug: string): ServicePillar | undefined {
  return SERVICES.find((p) => p.slug === slug);
}

export function serviceCount(p: ServicePillar) {
  return p.groups.reduce((n, g) => n + g.services.length, 0);
}
