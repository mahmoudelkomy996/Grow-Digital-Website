import type { Metadata } from "next";
import type { ReactNode } from "react";
import { existsSync } from "node:fs";
import path from "node:path";
import { Check, X } from "lucide-react";
import type {
  DeepDive,
  ImageRef,
  LogoItem,
  Metric,
  Pillar,
  ServiceGroup,
  Solution,
  UseCase,
  Value,
} from "@/content/types";
import { NAV_PILLARS } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading, Headline } from "@/components/ui/SectionHeading";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SmileArc } from "@/components/ui/SmileArc";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LogoTile } from "@/components/ui/LogoTile";
import { Disclosure } from "@/components/ui/Disclosure";
import { Logo } from "@/components/ui/Logo";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { PillarCard } from "@/components/sections/PillarCard";
import { PillarGrid } from "@/components/sections/PillarGrid";
import { UseCaseCard } from "@/components/sections/UseCaseCard";
import { SolutionCard } from "@/components/sections/SolutionCard";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { LogoWall } from "@/components/sections/LogoWall";
import { MetricBand } from "@/components/sections/MetricBand";
import { ScopeValue } from "@/components/sections/ScopeValue";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { PillarNav } from "@/components/sections/PillarNav";
import { ValuesGrid } from "@/components/sections/ValuesGrid";

export const metadata: Metadata = {
  title: "Design system",
  description: "The living style guide for growdigital.com: tokens, typography, motif and components.",
  robots: { index: false, follow: false },
};

/* ───────────────────────────── Fixtures (local; not the content index) ───────────────────────────── */

/** Neutral teal placeholder used until the photography set lands on disk. */
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><defs><radialGradient id="g" cx="70%" cy="20%" r="90%"><stop offset="0" stop-color="#1E7773"/><stop offset=".55" stop-color="#083B3B"/><stop offset="1" stop-color="#041F1F"/></radialGradient></defs><rect width="1600" height="1000" fill="url(#g)"/><path d="M620 430 C 620 560, 700 620, 800 620 C 900 620, 980 560, 980 430" fill="none" stroke="#7FE0C8" stroke-opacity=".35" stroke-width="22" stroke-linecap="round"/></svg>`,
  );

const onDisk = (src: string) => existsSync(path.join(process.cwd(), "public", src));
const photo = (src: string, alt: string): ImageRef => (onDisk(src) ? { src, alt } : { src: PLACEHOLDER, alt });
const logo = (id: string, name: string, src?: string, scale?: number): LogoItem => ({
  id,
  name,
  logo: src && onDisk(src) ? src : undefined,
  scale,
});

const PILLAR_ONE_LINERS: Record<string, string> = {
  consult: "Strategy, architecture and governance that turn transformation into an executive-aligned roadmap.",
  transform: "Predictive models, AI agents and IoT platforms that hold up in production, not just in a demo.",
  build: "Web, mobile and custom applications measured on load time and conversion, not screenshots.",
  operate: "SLA-based L1–L3 support, cloud operations and monitoring that keep revenue systems running.",
  secure: "Security built around your actual attack surface, with 24/7 vigilance and governance you can audit.",
  solve: "Our own AI platforms, plus partner solutions we exclusively represent in KSA and the UAE.",
  grow: "Strategy, performance marketing and GrowthLab analytics pulled together, with no siloed tactics.",
};

const SAMPLE_PILLARS: Pillar[] = NAV_PILLARS.map((p) => ({
  slug: p.slug,
  num: p.num as Pillar["num"],
  verb: p.name,
  name: p.full,
  headline: `${p.name} *sample*.`,
  oneLiner: PILLAR_ONE_LINERS[p.slug],
  intro: [],
  hero: photo(`/images/pillars/${p.slug}-hero.jpg`, `${p.name} hero`),
  secondary: photo(`/images/pillars/${p.slug}-detail.jpg`, `${p.name} detail`),
  services: [],
  featured: p.featured,
  deepDives: [],
  partnerIds: [],
  useCaseIds: [],
}));

const SAMPLE_USE_CASES: UseCase[] = [
  {
    id: "vehicle-purchase",
    title: "Vehicle purchase prediction",
    industry: "retail",
    pillar: "transform",
    category: "AI",
    summary: "Models predict what each customer wants to buy next, so campaigns target the right product at the right moment.",
    project:
      "The project's AI and machine learning models predict what each customer actually wants to buy next. Campaigns are built around that prediction instead of a demographic guess: right product, right customer, right moment.",
    results: [
      { value: "71%", label: "increase in campaign conversion rates" },
      { value: "10x", label: "purchase rates in pilot studies" },
      { value: "30%", label: "more positive customer feedback" },
    ],
    image: photo("/images/use-cases/vehicle-purchase.jpg", "Customer and advisor in a premium car showroom"),
  },
  {
    id: "banking-chatbot",
    title: "Banking regulatory chatbot",
    industry: "financial-services",
    pillar: "transform",
    category: "AI",
    summary: "A multilingual virtual advisor guiding businesses and individuals through KYC/AML and transfer rules.",
    project:
      "A virtual advisor guiding businesses and individuals on KYC/AML procedures, international transfers, regulatory thresholds and central bank forms, in Arabic, French, English, Japanese, Chinese, Italian and German.",
    results: [{ value: "Seconds", label: "response time, down from several days" }],
    image: photo("/images/use-cases/banking-chatbot.jpg", "Banking advisor using a chat assistant"),
  },
  {
    id: "production-efficiency",
    title: "Production efficiency",
    industry: "manufacturing",
    pillar: "transform",
    category: "IoT",
    summary: "IIoT with data contextualization gives role-based insights for proactive production optimization.",
    project:
      "Integration of IIoT with data contextualization provides role-based insights, enabling proactive actions like anomaly detection and production optimization. A durable goods OEM used real-time virtual twins and dashboards.",
    results: [{ value: "+30%", label: "production capacity within one month" }],
    image: photo("/images/use-cases/production-efficiency.jpg", "Production line with digital monitoring"),
  },
];

const SAMPLE_SOLUTIONS: Solution[] = [
  {
    id: "growbot",
    name: "Grow Bot",
    by: "Grow Digital",
    kind: "own",
    category: "Enterprise AI Assistant & Conversational AI Platform",
    description: "An enterprise AI assistant that answers customers and employees across the channels they already use.",
    features: ["Conversational AI", "Enterprise knowledge", "Multilingual"],
    image: photo("/images/solutions/growbot.jpg", "Grow Bot conversational assistant"),
  },
  {
    id: "incommerce",
    name: "InCommerce",
    by: "Inveon",
    kind: "partner",
    category: "Omni-channel commerce platform",
    description:
      "An agile way to build, launch and expand your eCommerce business across different channels, marketplaces and partners.",
    features: [
      "Omni-channel commerce platform",
      "Marketplace integrator",
      "App-Commerce",
      "Order management system",
      "Loyalty module",
      "Real-time promotions",
    ],
    image: photo("/images/solutions/incommerce.jpg", "Shopper using a commerce app"),
    partnerId: "inveon",
  },
];

const SAMPLE_DEEP_DIVES: DeepDive[] = [
  {
    id: "advisory",
    title: "Advisory services",
    objective: "Define strategic direction and a transformation roadmap before execution.",
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
    image: photo("/images/pillars/consult-detail.jpg", "Hands annotating a printed transformation roadmap"),
  },
  {
    id: "growshield",
    title: "GrowShield™ managed services",
    objective: "Keep the systems your revenue depends on available, patched and monitored.",
    scope: [
      "Application & system support (ERP, HIS, IoT, AI)",
      "L1, L2, L3 support coverage",
      "Incident & problem management",
      "SLA-based managed services",
    ],
    value: ["Reduced downtime & operational risk", "Improved system availability", "Predictable operational costs"],
    image: photo("/images/pillars/operate-detail.jpg", "Server racks in a modern data centre"),
  },
];

const SAMPLE_SERVICES: ServiceGroup[] = [
  {
    items: [
      "Digital Transformation Strategy",
      "IT Strategy & Roadmap",
      "Enterprise Architecture Advisory",
      "PMO & Program Management",
      "Quality Assurance",
      "Business Consultancy",
    ],
  },
  {
    title: "A deeper look",
    items: [
      "Vulnerability Assessment & Penetration Testing",
      "24/7 Managed Security Services",
      "Cloud Security Architecture & Design",
      "Security Awareness Training",
    ],
  },
];

const SAMPLE_METRICS: Metric[] = [
  { value: "71%", label: "increase in campaign conversion rates", source: "Vehicle purchase prediction" },
  { value: "20%", label: "operating cost savings, up to", source: "Inflight catering" },
  { value: "+30%", label: "production capacity in one month", source: "Production efficiency · IoT" },
  { value: "−50%", label: "quality problems in two months", source: "Product quality · IoT" },
  { value: "Seconds", label: "response time, not days", source: "Banking regulatory chatbot" },
];

const SAMPLE_VALUES: Value[] = [
  { id: "ownership", name: "Ownership", description: "We take responsibility for outcomes, not just tasks." },
  { id: "integrity", name: "Integrity", description: "We do what is right and communicate honestly." },
  { id: "impact", name: "Client Impact", description: "We focus on creating real, measurable business value." },
  { id: "one-team", name: "One Team", description: "We work as one team, across roles and locations." },
  { id: "growing", name: "Keep Growing", description: "We stay curious and keep developing our capabilities." },
  { id: "happen", name: "Make It Happen", description: "We move from ideas to action, with speed and discipline." },
  { id: "respect", name: "Respect", description: "We treat everyone with respect and value different views." },
];

const SAMPLE_LOGOS: LogoItem[] = [
  logo("inveon", "Inveon", "/logos/partners/inveon.png"),
  logo("mobilgi", "Mobilgi", "/logos/partners/mobilgi.png"),
  logo("maestrohub", "MaestroHub", "/logos/partners/maestrohub.png"),
  logo("skysens", "SkySens", "/logos/partners/skysens.png"),
  logo("navinspire", "Navinspire"),
  logo("gtech", "GTech"),
  logo("gcp", "Google Cloud"),
  logo("azure", "Microsoft Azure"),
  logo("oracle", "Oracle Cloud"),
  logo("ibm", "IBM Cloud"),
];

const SAMPLE_WALL: LogoItem[] = [
  { id: "gd", name: "Grow Digital", logo: "/brand/logo-teal.png", scale: 0.8 },
  ...SAMPLE_LOGOS.slice(0, 9),
];

/* ───────────────────────────── Tokens and contrast ───────────────────────────── */

const TOKENS = [
  { name: "teal-950", hex: "#041F1F", role: "Deepest surfaces, footer" },
  { name: "teal-900", hex: "#083B3B", role: "Logo, dark bands, primary buttons" },
  { name: "teal-800", hex: "#0D4B4A", role: "Dark raised surfaces" },
  { name: "teal-700", hex: "#145E5C", role: "Secondary text on paper" },
  { name: "teal-600", hex: "#1E7773", role: "Links and eyebrows on paper" },
  { name: "teal-500", hex: "#2E948E", role: "Focus rings, bullets (non-text)" },
  { name: "teal-400", hex: "#58B0A9", role: "Muted text on dark" },
  { name: "teal-300", hex: "#8FCDC6", role: "Secondary text on dark" },
  { name: "teal-200", hex: "#C2E5E0", role: "Lead text on dark" },
  { name: "teal-100", hex: "#E2F2EF", role: "Body text on dark" },
  { name: "teal-50", hex: "#F1F8F6", role: "Subtle fills, hover" },
  { name: "stage", hex: "#052626", role: "3D stage, impact band" },
  { name: "paper", hex: "#F6F5F0", role: "Page background" },
  { name: "paper-2", hex: "#EDEBE3", role: "Alternate sections" },
  { name: "line", hex: "#D9D6CC", role: "Hairlines on paper" },
  { name: "ink", hex: "#0E1C1C", role: "Body text on paper" },
  { name: "mint", hex: "#7FE0C8", role: "Accent word and links on dark" },
  { name: "lime", hex: "#C8F169", role: "CTAs, numbers, active: dark only" },
  { name: "danger", hex: "#C2412D", role: "Form errors" },
] as const;

type TokenName = (typeof TOKENS)[number]["name"];
const HEX = Object.fromEntries(TOKENS.map((t) => [t.name, t.hex])) as Record<TokenName, string>;

/** WCAG 2.2 relative luminance and contrast ratio. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

type PairKind = "text" | "large" | "ui";
const PAIRS: { fg: TokenName; bg: TokenName; use: string; kind: PairKind }[] = [
  { fg: "ink", bg: "paper", use: "Body text", kind: "text" },
  { fg: "teal-900", bg: "paper", use: "Headings, ghost buttons", kind: "text" },
  { fg: "teal-800", bg: "paper", use: "Chips, card copy", kind: "text" },
  { fg: "teal-700", bg: "paper", use: "Secondary text, leads", kind: "text" },
  { fg: "teal-600", bg: "paper", use: "Eyebrows, links, accent word", kind: "text" },
  { fg: "teal-700", bg: "paper-2", use: "Text and eyebrows on paper-2", kind: "text" },
  { fg: "teal-900", bg: "teal-50", use: "Card hover state", kind: "text" },
  { fg: "danger", bg: "paper", use: "Form errors", kind: "text" },
  { fg: "teal-500", bg: "paper", use: "Focus ring, bullets (non-text)", kind: "ui" },
  { fg: "paper", bg: "teal-900", use: "Headings, primary button", kind: "text" },
  { fg: "teal-100", bg: "teal-900", use: "Body text on dark", kind: "text" },
  { fg: "teal-200", bg: "teal-900", use: "Leads on dark", kind: "text" },
  { fg: "teal-300", bg: "teal-900", use: "Secondary text on dark", kind: "text" },
  { fg: "teal-400", bg: "teal-900", use: "Muted labels on dark", kind: "text" },
  { fg: "mint", bg: "teal-900", use: "Accent word, links on dark", kind: "text" },
  { fg: "lime", bg: "teal-900", use: "Eyebrows, numbers, focus", kind: "text" },
  { fg: "lime", bg: "stage", use: "Impact figures", kind: "text" },
  { fg: "teal-400", bg: "stage", use: "Metric sources", kind: "text" },
  { fg: "teal-950", bg: "lime", use: "Accent button label", kind: "text" },
  { fg: "teal-400", bg: "teal-950", use: "Footer headings", kind: "text" },
  { fg: "teal-100", bg: "teal-950", use: "Footer links", kind: "text" },
];
const FORBIDDEN: { fg: TokenName; bg: TokenName; use: string }[] = [
  { fg: "lime", bg: "paper", use: "Lime is never text on paper" },
  { fg: "teal-400", bg: "paper", use: "Muted teal fails on paper" },
  { fg: "teal-600", bg: "paper-2", use: "Use teal-700 on paper-2" },
];

function grade(ratio: number, kind: PairKind) {
  if (kind === "ui") return ratio >= 3 ? "3:1 UI" : "Fail";
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3 && kind === "large") return "AA large";
  return "Fail";
}

/* ───────────────────────────── Page scaffolding ───────────────────────────── */

const TOC = [
  ["colour", "Colour"],
  ["type", "Typography"],
  ["accent", "Eyebrow & accent"],
  ["motif", "Smile arc"],
  ["buttons", "Buttons"],
  ["chips", "Chips & links"],
  ["cards", "Cards"],
  ["sections", "Sections"],
  ["logos", "Logos"],
  ["disclosure", "Disclosure & breadcrumb"],
] as const;

function Block({ id, num, title, lead, children }: { id: string; num: string; title: string; lead?: string; children: ReactNode }) {
  const label = TOC.find(([tocId]) => tocId === id)?.[1] ?? id;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-line pt-14 pb-20 md:pt-16 md:pb-28">
      <SectionHeading id={`${id}-title`} eyebrow={label} num={num} title={title} lead={lead} className="mb-12" />
      {children}
    </section>
  );
}

/** A labelled specimen frame. */
function Specimen({
  label,
  tone = "paper",
  className,
  children,
}: {
  label: string;
  tone?: "paper" | "paper-2" | "dark" | "stage";
  className?: string;
  children: ReactNode;
}) {
  const dark = tone === "dark" || tone === "stage";
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border",
        dark ? "surface-dark border-teal-800 text-teal-100" : "border-line text-ink",
        { paper: "bg-paper", "paper-2": "bg-paper-2", dark: "bg-teal-900", stage: "bg-stage" }[tone],
        className,
      )}
    >
      <figcaption
        className={cn(
          "eyebrow border-b px-5 py-3",
          dark ? "border-teal-300/15 text-teal-300" : tone === "paper-2" ? "border-line text-teal-700" : "border-line text-teal-600",
        )}
      >
        {label}
      </figcaption>
      <div className="p-5 md:p-8">{children}</div>
    </figure>
  );
}

const TYPE_SCALE = [
  { token: "text-display", size: "56 → 120px · 300", sample: "It's time to *grow*.", className: "text-display font-light" },
  { token: "text-h1", size: "44 → 80px · 300", sample: "Direction before *investment*.", className: "text-h1 font-light" },
  { token: "text-h2", size: "32 → 56px · 300", sample: "Data into *decisions*.", className: "text-h2 font-light" },
  { token: "text-h3", size: "22 → 28px · 400", sample: "Software people finish using.", className: "text-h3" },
  {
    token: "text-body-l",
    size: "19px · 400",
    sample: "One accountable team designs, builds, operates and markets your systems.",
    className: "text-body-l",
  },
  {
    token: "text-body",
    size: "17px · 400",
    sample: "So you stop managing five contracts and start managing one outcome.",
    className: "text-body",
  },
  {
    token: "text-small",
    size: "14px · 400",
    sample: "Kingdom of Saudi Arabia · United Arab Emirates",
    className: "text-small",
  },
  { token: "eyebrow", size: "12px mono · +0.16em", sample: "01 — Consult", className: "eyebrow text-teal-600" },
];

const BUTTON_STATES: { label: string; demo?: "hover" | "focus"; disabled?: boolean }[] = [
  { label: "Default" },
  { label: "Hover", demo: "hover" },
  { label: "Focus", demo: "focus" },
  { label: "Disabled", disabled: true },
];

function ButtonMatrix({ variants, dark = false }: { variants: ButtonVariant[]; dark?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className={cn("eyebrow", dark ? "text-teal-300" : "text-teal-700")}>
            <th scope="col" className="pb-4 font-normal">
              Variant
            </th>
            {BUTTON_STATES.map((s) => (
              <th key={s.label} scope="col" className="pb-4 font-normal">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v} className={cn("border-t", dark ? "border-teal-300/15" : "border-line")}>
              <th scope="row" className={cn("py-4 pr-4 font-mono text-[0.75rem] font-normal", dark ? "text-teal-200" : "text-teal-800")}>
                {v}
              </th>
              {BUTTON_STATES.map((s) => (
                <td key={s.label} className="py-4 pr-4">
                  <Button variant={v} arrow data-demo={s.demo} disabled={s.disabled} tabIndex={-1}>
                    {v === "link" ? "Read more" : "Talk to us"}
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */

export default function DesignSystemPage() {
  return (
    <>
      <PageHero
        eyebrow="Internal · Living style guide"
        title="One system, grown from the *logo*."
        lead="Tokens, typography, the smile-arc motif and every shared component, rendered from the same code the site ships with."
        image={photo("/images/about/about-hero.jpg", "Riyadh skyline at blue hour")}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Design system" }]}
      >
        <Button href="#colour" variant="accent" size="lg" arrow>
          Browse tokens
        </Button>
        <Button href="#sections" variant="ghost-dark" size="lg">
          Components
        </Button>
      </PageHero>

      <div className="bg-paper">
        <Container className="grid gap-x-12 pt-10 xl:grid-cols-[13rem_minmax(0,1fr)]">
          {/* Index */}
          <nav aria-label="Design system sections" className="hidden xl:block">
            <ol className="sticky top-28 flex flex-col gap-1 pt-16">
              {TOC.map(([id, label], i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="group/toc flex items-baseline gap-3 rounded-sm py-1 text-small text-teal-700 transition-colors hover:text-teal-900"
                  >
                    <span className="eyebrow text-teal-600 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="transition-transform duration-300 group-hover/toc:translate-x-0.5">{label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0">
            {/* 01 Colour */}
            <Block
              id="colour"
              num="01"
              title="Colour, anchored on the logo *teal*."
              lead="Paper base, deep-teal bands and a single lime accent that lives on dark surfaces only. Ratios below are computed from the token hex values at build time."
            >
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {TOKENS.map((t) => (
                  <li key={t.name} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper">
                    <div
                      className="flex aspect-[5/3] items-end p-3"
                      style={{ backgroundColor: t.hex, color: contrast(t.hex, HEX.ink) > contrast(t.hex, HEX.paper) ? HEX.ink : HEX.paper }}
                    >
                      <span className="font-mono text-[0.6875rem] tracking-wide uppercase">{t.hex}</span>
                    </div>
                    <div className="border-t border-line p-3">
                      <p className="font-mono text-[0.8125rem] text-teal-900">{t.name}</p>
                      <p className="mt-1 text-[0.8125rem] leading-snug text-teal-700">{t.role}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <h3 className="mt-16 text-h3 text-teal-900">Approved text and background pairs</h3>
              <p className="mt-2 max-w-2xl text-teal-700">
                WCAG 2.2: 4.5:1 for text, 3:1 for large text and UI components. Every pairing used on the site is listed here.
              </p>
              <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-line">
                <table className="w-full min-w-[40rem] border-collapse text-left text-small">
                  <thead className="bg-paper-2">
                    <tr className="eyebrow text-teal-700">
                      <th scope="col" className="px-4 py-3 font-normal">Sample</th>
                      <th scope="col" className="px-4 py-3 font-normal">Text / surface</th>
                      <th scope="col" className="px-4 py-3 font-normal">Use</th>
                      <th scope="col" className="px-4 py-3 text-right font-normal">Ratio</th>
                      <th scope="col" className="px-4 py-3 text-right font-normal">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAIRS.map((p) => {
                      const ratio = contrast(HEX[p.fg], HEX[p.bg]);
                      const g = grade(ratio, p.kind);
                      return (
                        <tr key={`${p.fg}-${p.bg}`} className="border-t border-line">
                          <td className="px-4 py-2.5">
                            <span
                              className="inline-grid h-10 w-16 place-items-center rounded-[var(--radius-control)] text-[1.0625rem] font-medium"
                              style={{ color: HEX[p.fg], backgroundColor: HEX[p.bg], boxShadow: `inset 0 0 0 1px ${HEX.line}` }}
                            >
                              Aa
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[0.75rem] text-teal-900">
                            {p.fg} <span className="text-teal-700">on</span> {p.bg}
                          </td>
                          <td className="px-4 py-2.5 text-teal-700">{p.use}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-[0.8125rem] text-teal-900 tabular-nums">
                            {ratio.toFixed(2)}:1
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide uppercase",
                                g === "Fail" ? "bg-danger/10 text-danger" : "bg-teal-900 text-paper",
                              )}
                            >
                              {g === "Fail" ? <X aria-hidden strokeWidth={1.5} className="size-3" /> : <Check aria-hidden strokeWidth={1.5} className="size-3" />}
                              {g}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <h3 className="mt-14 text-h3 text-teal-900">Do not use</h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {FORBIDDEN.map((p) => (
                  <li key={`${p.fg}-${p.bg}`} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line p-4">
                    <span
                      className="relative inline-grid h-12 w-16 shrink-0 place-items-center rounded-[var(--radius-control)] text-[1.0625rem] font-medium"
                      style={{ color: HEX[p.fg], backgroundColor: HEX[p.bg], boxShadow: `inset 0 0 0 1px ${HEX.line}` }}
                    >
                      Aa
                    </span>
                    <span className="flex flex-col">
                      <span className="font-mono text-[0.75rem] text-teal-900">
                        {p.fg} on {p.bg} · <span className="text-danger">{contrast(HEX[p.fg], HEX[p.bg]).toFixed(2)}:1</span>
                      </span>
                      <span className="text-small text-teal-700">{p.use}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Block>

            {/* 02 Typography */}
            <Block
              id="type"
              num="02"
              title="A round sans with one *serif* word."
              lead="Outfit (300/400/500) for display and UI, Instrument Serif italic for the single accent word, JetBrains Mono for eyebrows, numbers and indices. Sizes are fluid between 375 and 1440px."
            >
              <ul className="border-b border-line">
                {TYPE_SCALE.map((t) => (
                  <li key={t.token} className="grid gap-3 border-t border-line py-7 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[0.8125rem] text-teal-900">{t.token}</span>
                      <span className="font-mono text-[0.75rem] text-teal-700">{t.size}</span>
                    </div>
                    <p className={cn("min-w-0 break-words text-teal-900", t.className)}>
                      <Headline text={t.sample} />
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["Outfit", "Display & UI", "font-sans font-light", "Aa Gg 07"],
                  ["Instrument Serif", "Accent, italic", "accent-word", "grow"],
                  ["JetBrains Mono", "Eyebrows & numbers", "font-mono", "01 — 07"],
                ].map(([name, use, cls, sample]) => (
                  <div key={name} className="rounded-[var(--radius-card)] border border-line p-6">
                    <p className={cn("text-[3.5rem] leading-none text-teal-900", cls)}>{sample}</p>
                    <p className="mt-6 text-teal-900">{name}</p>
                    <p className="text-small text-teal-700">{use}</p>
                  </div>
                ))}
              </div>
            </Block>

            {/* 03 Eyebrow & accent */}
            <Block
              id="accent"
              num="03"
              title="Numbered eyebrows, one *accent*."
              lead="Every section opens with a mono eyebrow, numbered when it belongs to a sequence. Each headline carries at most one serif-italic accent word, written as *word* in content."
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <Specimen label="On paper">
                  <SectionHeading
                    eyebrow="Transform"
                    num="02"
                    title="Data into *decisions*."
                    lead="Accent in teal-600, eyebrow in teal-600, lead in teal-700."
                    size="h2"
                  />
                </Specimen>
                <Specimen label="On dark" tone="dark">
                  <SectionHeading
                    eyebrow="Transform"
                    num="02"
                    title="Data into *decisions*."
                    lead="Accent in mint, eyebrow in lime, lead in teal-200."
                    size="h2"
                    tone="dark"
                  />
                </Specimen>
                <Specimen label="Accent with smile underline · heroes and CTAs" tone="stage">
                  <p className="text-h1 font-light text-paper">
                    <Headline text="Let's *grow* together." tone="dark" arc />
                  </p>
                </Specimen>
                <Specimen label="Eyebrow variants" tone="paper-2">
                  <div className="flex flex-col gap-4">
                    <Eyebrow>The agile integrator</Eyebrow>
                    <Eyebrow num="05">Secure</Eyebrow>
                    <p className="eyebrow text-teal-700">On paper-2: teal-700</p>
                  </div>
                </Specimen>
              </div>
            </Block>

            {/* 04 Motif */}
            <Block
              id="motif"
              num="04"
              title="The smile under the *g*."
              lead="The round-ended U beneath each g in the logo is the signature motif: underline, divider, bullet and active indicator. One SVG component, always currentColor with round caps."
            >
              <div className="grid gap-3 lg:grid-cols-3">
                <Specimen label="Source" className="lg:col-span-2">
                  <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-end">
                    <Logo className="h-10 text-teal-900 md:h-14" />
                    <SmileArc strokeWidth={5} className="w-20 text-teal-900" title="Smile arc" />
                  </div>
                </Specimen>
                <Specimen label="Stroke weights" tone="dark">
                  <div className="flex items-end justify-between gap-4">
                    {[1, 2, 3.5, 5].map((w) => (
                      <div key={w} className="flex flex-col items-center gap-3">
                        <SmileArc strokeWidth={w} className="w-12 text-lime" />
                        <span className="font-mono text-[0.6875rem] text-teal-300">{w}</span>
                      </div>
                    ))}
                  </div>
                </Specimen>
                <Specimen label="Bullets">
                  <ul className="flex flex-col gap-2.5 text-teal-900">
                    {["Enterprise architecture advisory", "Vendor evaluation & selection", "Target operating model design"].map((s) => (
                      <li key={s} className="flex items-start gap-2.5">
                        <SmileArc strokeWidth={3.5} className="mt-[0.5em] w-3 text-teal-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Specimen>
                <Specimen label="Divider">
                  <div className="flex items-center gap-4 py-6 text-teal-500" role="separator">
                    <span className="h-px flex-1 bg-line" />
                    <SmileArc strokeWidth={2.5} className="w-8" />
                    <span className="h-px flex-1 bg-line" />
                  </div>
                </Specimen>
                <Specimen label="Active indicator">
                  <div className="flex gap-6 text-[0.9375rem] text-teal-900">
                    {["Pillars", "Use cases", "About"].map((l, i) => (
                      <span key={l} className="relative pb-3">
                        {l}
                        {i === 1 ? (
                          <SmileArc stretch strokeWidth={1.5} className="absolute bottom-0 left-1/2 h-1.5 w-5 -translate-x-1/2 text-teal-500" />
                        ) : null}
                      </span>
                    ))}
                  </div>
                </Specimen>
              </div>
            </Block>

            {/* 05 Buttons */}
            <Block
              id="buttons"
              num="05"
              title="Pill buttons, *quiet* states."
              lead="Primary teal on paper, lime accent on dark, outline ghosts for secondary actions and a link style. Hover darkens or fills and nudges the arrow 2px; focus is a 2px ring in teal-500 (paper) or lime (dark)."
            >
              <div className="flex flex-col gap-3">
                <Specimen label="On paper · primary, ghost, link">
                  <ButtonMatrix variants={["primary", "ghost", "link"]} />
                </Specimen>
                <Specimen label="On dark · accent, ghost-dark, link" tone="dark">
                  <ButtonMatrix variants={["accent", "ghost-dark", "link"]} dark />
                </Specimen>
                <div className="grid gap-3 md:grid-cols-2">
                  <Specimen label="Sizes · md 44px, lg 56px">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button arrow>Medium</Button>
                      <Button size="lg" arrow>
                        Large
                      </Button>
                      <Button variant="ghost" size="lg">
                        Ghost large
                      </Button>
                    </div>
                  </Specimen>
                  <Specimen label="Live · try hover and Tab" tone="stage">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="accent" size="lg" arrow>
                        Talk to us
                      </Button>
                      <Button variant="ghost-dark" size="lg">
                        info@growdigital.com
                      </Button>
                    </div>
                  </Specimen>
                </div>
              </div>
            </Block>

            {/* 06 Chips & links */}
            <Block id="chips" num="06" title="Chips and *links*." lead="Chips label services, categories and filters. Arrow links close a section with a quiet next step.">
              <div className="grid gap-3 md:grid-cols-2">
                <Specimen label="Chips on paper">
                  <div className="flex flex-wrap gap-2">
                    <Chip>Data Strategy & Governance</Chip>
                    <Chip>IoT Platforms</Chip>
                    <Chip active>Transform</Chip>
                    <Chip size="sm">AI</Chip>
                  </div>
                </Specimen>
                <Specimen label="Chips on dark" tone="dark">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone="dark">Generative AI & AI Agents</Chip>
                    <Chip tone="dark">Predictive Analytics & ML</Chip>
                    <Chip tone="dark" active>
                      Selected
                    </Chip>
                    <Chip tone="dark" size="sm">
                      IoT
                    </Chip>
                  </div>
                </Specimen>
                <Specimen label="Arrow link on paper">
                  <ArrowLink href="/use-cases">All use cases</ArrowLink>
                </Specimen>
                <Specimen label="Arrow link on dark" tone="dark">
                  <ArrowLink href="/partners" tone="dark">
                    Meet our partners
                  </ArrowLink>
                </Specimen>
              </div>
            </Block>

            {/* 07 Cards */}
            <Block
              id="cards"
              num="07"
              title="Cards with *hairlines*, not shadows."
              lead="20px radius, 1px line borders and a 2px lift on hover. Pillar cards link to their page; use case cards can expand in place."
            >
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <PillarCard pillar={SAMPLE_PILLARS[0]} variant="feature" />
                </div>
                <PillarCard pillar={SAMPLE_PILLARS[1]} />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {SAMPLE_USE_CASES.map((u, i) => (
                  <UseCaseCard key={u.id} useCase={u} expandable={i === 0} />
                ))}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {SAMPLE_SOLUTIONS.map((s) => (
                  <SolutionCard key={s.id} solution={s} />
                ))}
              </div>
            </Block>
          </div>
        </Container>
      </div>

      {/* 08 Sections: full-bleed bands, shown at real width */}
      <section id="sections" aria-labelledby="sections-title" className="scroll-mt-20 bg-paper">
        <Container className="border-t border-line pt-14 pb-12 md:pt-16">
          <SectionHeading
            id="sections-title"
            num="08"
            eyebrow="Sections"
            title="Bands that *alternate*."
            lead="Shared sections render full-bleed, exactly as they appear on pages: paper, paper-2, and the teal and stage dark bands."
          />
        </Container>
      </section>

      <Section tone="paper" aria-label="Pillar grid sample">
        <Container>
          <SectionHeading eyebrow="PillarGrid" title="Seven pillars, one *team*." className="mb-12" />
          <PillarGrid pillars={SAMPLE_PILLARS} />
        </Container>
      </Section>

      <MetricBand metrics={SAMPLE_METRICS} eyebrow="MetricBand · Impact" title="Outcomes, *measured*." id="metrics-sample" />

      <Section tone="paper" aria-label="Service grid sample">
        <Container>
          <SectionHeading eyebrow="ServiceGrid" title="Every service, *numbered*." className="mb-12" />
          <ServiceGrid groups={SAMPLE_SERVICES} />
        </Container>
      </Section>

      <Section tone="paper-2" aria-label="Scope and value sample">
        <Container className="flex flex-col gap-24">
          <SectionHeading eyebrow="ScopeValue" title="Deep dives, *side by side*." className="-mb-8" />
          {SAMPLE_DEEP_DIVES.map((d, i) => (
            <Reveal key={d.id}>
              <ScopeValue deepDive={d} index={i} reverse={i % 2 === 1} />
            </Reveal>
          ))}
        </Container>
      </Section>

      <Section tone="paper" aria-label="Values grid sample">
        <Container>
          <SectionHeading eyebrow="ValuesGrid" title="What we *value*." className="mb-12" />
          <ValuesGrid values={SAMPLE_VALUES} />
        </Container>
      </Section>

      <PillarNav current="build" />

      <CtaBand />

      {/* 09 Logos, 10 Disclosure & breadcrumb */}
      <div className="bg-paper">
        <Container>
          <Block
            id="logos"
            num="09"
            title="Logos in *monochrome*."
            lead="Marks render as a teal (paper) or paper (dark) silhouette and reveal their original colours on hover or focus. Missing files fall back to a clean wordmark."
          >
            <div className="grid gap-3 md:grid-cols-4">
              <Specimen label="LogoTile · image">
                <LogoTile item={{ id: "gd", name: "Grow Digital", logo: "/brand/logo-teal.png" }} />
              </Specimen>
              <Specimen label="LogoTile · wordmark">
                <LogoTile item={{ id: "gcp", name: "Google Cloud" }} />
              </Specimen>
              <Specimen label="Image on dark" tone="dark">
                <LogoTile item={{ id: "gd-dark", name: "Grow Digital", logo: "/brand/logo-teal.png" }} tone="dark" />
              </Specimen>
              <Specimen label="Wordmark on dark" tone="dark">
                <LogoTile item={{ id: "azure", name: "Microsoft Azure" }} tone="dark" />
              </Specimen>
            </div>
            <h3 className="mt-14 mb-6 text-h3 text-teal-900">LogoWall</h3>
            <LogoWall items={SAMPLE_WALL} columns={5} />
            <h3 className="mt-14 mb-6 text-h3 text-teal-900">LogoMarquee</h3>
            <LogoMarquee items={SAMPLE_LOGOS} label="Sample partners" />
            <div className="surface-dark mt-3 rounded-[var(--radius-card)] bg-teal-900 py-4">
              <LogoMarquee items={SAMPLE_LOGOS} tone="dark" label="Sample partners on dark" />
            </div>
          </Block>

          <Block
            id="disclosure"
            num="10"
            title="Disclosure and *breadcrumb*."
            lead="Disclosures are real buttons with aria-expanded; closed panels are inert. Breadcrumbs mark the current page with aria-current."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Specimen label="Disclosure on paper">
                <Disclosure summary="What does the PMO cover?" defaultOpen>
                  <p className="text-teal-800">
                    PMO setup and governance structure, multi-vendor coordination, budget and timeline control, risk and
                    issue management, and executive KPI reporting.
                  </p>
                </Disclosure>
                <Disclosure summary="How is quality assured?">
                  <p className="text-teal-800">
                    Independent project and vendor audits, implementation quality reviews and governance validation.
                  </p>
                </Disclosure>
              </Specimen>
              <Specimen label="Disclosure on dark" tone="dark">
                <Disclosure summary="Where do you operate?" tone="dark">
                  <p className="text-teal-200">Kingdom of Saudi Arabia and the United Arab Emirates.</p>
                </Disclosure>
                <Disclosure summary="Who are your data partners?" tone="dark">
                  <p className="text-teal-200">Navinspire and GTech.</p>
                </Disclosure>
              </Specimen>
              <Specimen label="Breadcrumb on paper">
                <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pillars", href: "/#pillars" }, { label: "Transform" }]} />
              </Specimen>
              <Specimen label="Breadcrumb on dark" tone="dark">
                <Breadcrumb
                  tone="dark"
                  items={[{ label: "Home", href: "/" }, { label: "Pillars", href: "/#pillars" }, { label: "Transform" }]}
                />
              </Specimen>
            </div>
          </Block>
        </Container>
      </div>

      <CtaBand
        title="Build with the *system*."
        eyebrow="CtaBand · custom copy"
        lead="Every page ends with a clear next step."
        primary={{ label: "Contact", href: "/contact" }}
        secondary={null}
      />
    </>
  );
}
