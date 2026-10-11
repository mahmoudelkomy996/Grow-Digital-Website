// Arabic mirror of src/content/en/industries.ts.
// Industries we serve. Descriptions summarise services, solutions and use cases from the deck;
// they introduce no new clients, figures or capabilities.
import { img } from "./images.ts";
import type { Industry } from "../types.ts";

export const INDUSTRIES: Industry[] = [
  {
    id: "healthcare",
    name: "الرعاية الصحية",
    description:
      "نظام ATHAR للسجل الطبي الإلكتروني، ومنصة ذكاء القرار والموافقات الطبية، ومساعدون رقميون للمرضى على مدار 24/7، وتكاملات تربط أنظمة HIS وERP وتطبيقات المرضى.",
    image: img("ind-healthcare"),
  },
  {
    id: "government",
    name: "المدن الذكية والقطاع الحكومي",
    description:
      "استشارات التحول الرقمي للمدن الذكية والجهات الحكومية، مع حلول ذكاء اصطناعي مصمّمة للمدن الذكية والحكومات المحلية.",
    image: img("ind-government"),
  },
  {
    id: "real-estate",
    name: "العقارات والإنشاءات",
    description:
      "استشارات وبرمجيات وحلول ذكاء اصطناعي متخصصة لشركات العقارات والإنشاءات.",
    image: img("ind-real-estate"),
  },
  {
    id: "retail",
    name: "التجزئة والتجارة الإلكترونية",
    description:
      "تجارة متعددة القنوات مع InCommerce من Inveon، وإدارة عمليات المتاجر مع OneStore من Mobilgi، ونماذج ذكاء اصطناعي تتنبأ بما سيشتريه كل عميل لاحقاً.",
    image: img("ind-retail"),
  },
  {
    id: "financial-services",
    name: "الخدمات المالية",
    description:
      "وكلاء ذكاء اصطناعي يرصدون السلوكيات غير الاعتيادية وراء الاحتيال وغسل الأموال، ومستشارون تنظيميون متعددو اللغات يجيبون في ثوانٍ بدلاً من أيام.",
    image: img("ind-financial-services"),
  },
  {
    id: "manufacturing",
    name: "التصنيع والطاقة",
    description:
      "إنترنت الأشياء الصناعي مع SkySens وMaestroHub لربط بيانات خطوط الإنتاج بأنظمة ERP وSCADA لحظياً، لخفض تكاليف الطاقة وفترات التوقف ومشكلات الجودة.",
    image: img("ind-manufacturing"),
  },
  {
    id: "aviation",
    name: "الطيران والخدمات اللوجستية",
    description:
      "تنبؤ بالطلب بالذكاء الاصطناعي للتموين على متن الطائرات، ومراقبة تنبؤية مرنة (Agile Predictive Monitoring) لعمليات المطارات والخدمات اللوجستية.",
    image: img("ind-aviation"),
  },
];
