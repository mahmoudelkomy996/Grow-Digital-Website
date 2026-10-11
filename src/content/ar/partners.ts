// Arabic mirror of ../en/partners.ts. Partner names, ids, logos and groups are unchanged; only copy is localized.
import type { Partner } from "../types.ts";

/** Applies to every partner with `exclusive: true`. */
const EXCLUSIVE_STATEMENT =
  "Grow Digital هي الممثل الحصري وذراع التنفيذ لمزوّدي الحلول التالية أسماؤهم في المملكة العربية السعودية والإمارات.";

/** Applies to the "data-ai" group. */
const DATA_AI_STATEMENT =
  "تنفّذ Grow Digital مشاريع البيانات والذكاء الاصطناعي مع شريكيها العالميين Navinspire وGTech.";

export const PARTNER_GROUPS: { id: Partner["group"]; title: string; lead: string }[] = [
  { id: "solution", title: "شركاء الحلول", lead: EXCLUSIVE_STATEMENT },
  { id: "data-ai", title: "شركاء البيانات والذكاء الاصطناعي", lead: DATA_AI_STATEMENT },
  {
    id: "cloud",
    title: "المنصات السحابية",
    lead: "نساعد المؤسسات على تبنّي أبرز المنصات السحابية وتشغيلها، من الترحيل وتصميم البنية التحتية إلى الأمن والتحليلات والذكاء الاصطناعي.",
  },
];

export const PARTNERS: Partner[] = [
  // ── Solution partners (exclusive in KSA and the UAE) ───────────────────
  {
    id: "inveon",
    name: "Inveon",
    logo: "/logos/partners/inveon.png",
    group: "solution",
    exclusive: true,
    description:
      "مطوّر InCommerce، الطريقة المرنة لبناء أعمال التجارة الإلكترونية وإطلاقها وتوسيعها عبر مختلف القنوات والأسواق الإلكترونية والشركاء.",
  },
  {
    id: "mobilgi",
    name: "Mobilgi",
    logo: "/logos/partners/mobilgi.png",
    group: "solution",
    exclusive: true,
    description:
      "مطوّر OneStore، منصة العرض المرئي للمنتجات والتعاون التي تربط متجرك بفريقك الميداني والمقر الرئيسي.",
  },
  {
    id: "maestrohub",
    name: "MaestroHub",
    logo: "/logos/partners/maestrohub.png",
    group: "solution",
    exclusive: true,
    description:
      "منصة IoT صناعية تربط بيانات خطوط الإنتاج مباشرة بأنظمة ERP وSCADA في الوقت الفعلي.",
  },
  {
    id: "skysens",
    name: "SkySens",
    logo: "/logos/partners/skysens.png",
    group: "solution",
    exclusive: true,
    description:
      "حلول IoT متكاملة: شبكات لاسلكية بعيدة المدى، وتحليلات تنبؤية، وتكامل للبيانات يربط أرض المصنع بالأنظمة التي تدير الأعمال.",
  },

  // ── Data & AI partners (global) ────────────────────────────────────────
  {
    id: "navinspire",
    name: "Navinspire",
    group: "data-ai",
    description:
      "شريك عالمي في تنفيذ مشاريع البيانات والذكاء الاصطناعي، ومزوّد منصة RAG-DATALAKE (Navinspire IA).",
  },
  {
    id: "gtech",
    name: "GTech",
    group: "data-ai",
    description:
      "شريك عالمي في تنفيذ مشاريع البيانات والذكاء الاصطناعي، يقدّم الاستشارات في بحيرات البيانات الهجينة التي تجمع بين التحليلات الفورية والتاريخية.",
  },

  // ── Cloud platforms ────────────────────────────────────────────────────
  {
    id: "google-cloud",
    name: "Google Cloud",
    group: "cloud",
    description:
      "الترحيل إلى السحابة، وتصميم البنية التحتية، وتطبيق الحماية، وتحليلات البيانات الضخمة، وحلول AI/ML على Google Cloud Platform (GCP).",
  },
  {
    id: "microsoft-azure",
    name: "Microsoft Azure",
    group: "cloud",
    description: "حلول Azure السحابية، مع التركيز على قابلية التوسع والأمن وتحسين الأداء.",
  },
  {
    id: "oracle-cloud",
    name: "Oracle Cloud",
    group: "cloud",
    description:
      "خدمات Oracle Cloud، بما فيها إدارة قواعد البيانات وتطوير التطبيقات وحلول تخطيط موارد المؤسسات (ERP).",
  },
  {
    id: "ibm-cloud",
    name: "IBM Cloud",
    group: "cloud",
    description: "تبنّي خدمات IBM Cloud، مع التركيز على حلول السحابة الهجينة ودمج الذكاء الاصطناعي.",
  },
];
