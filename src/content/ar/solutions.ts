// Arabic mirror of src/content/en/solutions.ts.
// SOLVE: our own products plus the partner platforms we exclusively represent in KSA and the UAE.
// Own products: the portfolio gives one line each, so descriptions stay strictly within that line
// (spec §12, open item 5). Partner platforms: deck slides 40–41.
import { img } from "./images.ts";
import type { Solution } from "../types.ts";

export const SOLUTIONS: Solution[] = [
  // ── Grow Digital products (services document, Oct 2026) ───────────────
  {
    id: "grow-bot",
    name: "Grow Bot",
    by: "Grow Digital",
    kind: "own",
    category: "روبوت محادثة عبر WhatsApp",
    description: "روبوت محادثة عبر WhatsApp يتيح لعملائك ومرضاك الوصول إلى خدماتك عبر القناة التي يستخدمونها أصلاً.",
    features: ["مبني على WhatsApp", "للعملاء والمرضى", "بالعربية والإنجليزية"],
    image: img("sol-growbot"),
  },
  {
    id: "athar-emr",
    name: "Athar",
    by: "Grow Digital",
    kind: "own",
    category: "السجل الطبي الإلكتروني (EMR)",
    description: "نظام سجل طبي إلكتروني (EMR) لمقدمي الرعاية الصحية.",
    features: ["سجل طبي إلكتروني", "لمقدمي الرعاية الصحية"],
    image: img("sol-athar"),
  },
  {
    id: "medical-decision",
    name: "نظام دعم القرار الطبي",
    by: "Grow Digital",
    kind: "own",
    category: "دعم القرار السريري",
    description: "منصة لدعم القرار لمقدمي الرعاية الصحية.",
    features: ["دعم القرار", "لمقدمي الرعاية الصحية"],
    image: img("sol-medical-decision"),
  },
  {
    id: "patient-app",
    name: "تطبيق المريض",
    by: "Grow Digital",
    kind: "own",
    category: "تطبيق جوال للمرضى",
    description: "تطبيق جوال يربط المرضى بمقدم الرعاية الصحية الخاص بهم.",
    features: ["تطبيق جوال", "يربط المرضى بمقدمي الرعاية"],
    image: img("uc-healthcare-assistant"),
  },

  // ── Partner solutions ──────────────────────────────────────────────────
  {
    id: "incommerce",
    name: "InCommerce",
    by: "Inveon",
    kind: "partner",
    category: "منصة التجارة الرقمية",
    description:
      "Inveon InCommerce طريقة مرنة لبناء أعمال التجارة الإلكترونية وإطلاقها وتوسيعها عبر مختلف القنوات والأسواق الإلكترونية والشركاء.",
    features: [
      "منصة تجارة متعددة القنوات",
      "ربط مع الأسواق الإلكترونية",
      "التجارة عبر التطبيقات",
      "نظام إدارة الطلبات",
      "وحدة برامج الولاء",
      "عروض ترويجية لحظية",
    ],
    image: img("sol-incommerce"),
    partnerId: "inveon",
  },
  {
    id: "onestore",
    name: "OneStore",
    by: "Mobilgi",
    kind: "partner",
    category: "منصة التعاون المؤسسي",
    description: "Mobilgi OneStore حل للعرض المرئي للمنتجات (Visual Merchandising) في عمليات متاجر التجزئة.",
    features: [
      "حل للعرض المرئي للمنتجات",
      "أشمل مجموعة أدوات لجميع المستخدمين، من موظفي المتاجر إلى المديرين، في حزمة برمجية واحدة سهلة الاستخدام",
      "حلقة الوصل بين متجرك وفريقك الميداني والمقر الرئيسي",
    ],
    image: img("sol-onestore"),
    partnerId: "mobilgi",
  },
];
