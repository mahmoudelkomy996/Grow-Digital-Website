// Arabic mirror of ../en/navigation.ts. Navigation words (Arabic); structure and service menus come from ../nav.ts.
import { buildNavigation, type NavStrings } from "../nav.ts";
import { SERVICES } from "./services.ts";

const STRINGS: NavStrings = {
  menuTitles: {
    consultancy: "الاستشارات والتحول *الرقمي*",
    "managed-services": "GrowShield™ للخدمات *المُدارة*",
    "software-development": "*تطوير* البرمجيات",
    "digital-marketing": "*التسويق* الرقمي",
  },
  menuIntros: {
    consultancy: "حدّد أين تستثمر في الرقمنة، ثم امضِ معنا حتى يؤتي الاستثمار ثماره. أربع ممارسات، تجيب كل منها عن سؤال يشغل القيادة.",
    "managed-services": "مبنية على ثلاثة التزامات: الحماية والاستقرار والدعم الاستباقي، عبر عشرة مجالات خدمة.",
    "software-development": "تطوير البرمجيات بكامل نطاقه: تطبيقات الجوال والويب وتطبيقات الأعمال والذكاء الاصطناعي.",
    "digital-marketing": "عزّز حضورك، واستقطب العملاء المحتملين، وارفع مبيعاتك. يبدأ كل برنامج بتقييم شامل، وترى كل شهر ما حققته ميزانيتك.",
  },
  explore: (p) => `اكتشف ${p.navLabel}`,
  coveragePromo: {
    eyebrow: "GrowShield™",
    title: "الحماية. الاستقرار. الدعم الاستباقي.",
    body: "تغطية بإدارة كاملة أو جزئية أو مشتركة، بفريق يُبنى على النحو الذي يناسبك.",
  },
  // "الخدمات المُدارة الكاملة" → "الكاملة", "الدعم عند الطلب" → "عند الطلب", "النموذج الهجين" → "الهجين"
  shortModel: (name) =>
    name
      .replace(/(ال)?خدمات (ال)?مُ?دارة|(ال)?دعم|(ال)?نموذج/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  productsPromo: { eyebrow: "منتجاتنا", title: "مصمّمة للقطاعات التي نعرفها جيدًا." },
  packagesPromo: { eyebrow: "الباقات", title: "ابدأ بتقييم شامل. وانمُ كل شهر." },
  insights: "رؤى",
  company: {
    label: "الشركة",
    menu: {
      eyebrow: "الشركة",
      title: "فريق واحد *مسؤول*.",
      intro: "شريك تقني وشريك نمو تأسس في الإمارات، يخدم منطقة الخليج مع تركيز خاص على المملكة العربية السعودية.",
      explore: "تحدّث معنا",
      groups: [
        {
          links: [
            { label: "من نحن", href: "/about", summary: "رسالتنا ورؤيتنا وقيمنا وطريقة عملنا." },
            { label: "حالات الاستخدام", href: "/use-cases", summary: "برامج في الذكاء الاصطناعي وIoT بنتائج قابلة للقياس." },
            { label: "الشركاء والعملاء", href: "/partners", summary: "مع من نعمل، ولمن نعمل." },
            { label: "تواصل معنا", href: "/contact", summary: "info@growdigital.com · +971 50 3122672" },
          ],
        },
      ],
      promo: {
        eyebrow: "كيف نعمل",
        title: "نخطّط، ونبني، ونسوّق، ونُشغّل.",
        body: "أربع ركائز تغطي الرحلة كاملة، من الفكرة الأولى حتى التشغيل اليومي.",
      },
    },
  },
  cta: "تحدّث معنا",
  footer: {
    services: "الخدمات",
    company: "الشركة",
    contact: "تواصل",
    follow: "تابعنا",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "حالات الاستخدام", href: "/use-cases" },
      { label: "الشركاء", href: "/partners" },
      { label: "رؤى", href: "/blog" },
      { label: "تواصل معنا", href: "/contact" },
    ],
  },
  markets: "المملكة العربية السعودية · الإمارات العربية المتحدة",
  tagline: "حان وقت *النمو*.",
  copyright: "© 2026 Grow Digital. جميع الحقوق محفوظة.",
};

export const { NAV, NAV_CTA, FOOTER_LINKS, CONTACT, COPYRIGHT } = buildNavigation(SERVICES, STRINGS);
