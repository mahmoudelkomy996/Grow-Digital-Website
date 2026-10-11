// Arabic mirror of src/content/en/metrics.ts.
// Impact band: five headline results, each labeled with the use case it comes from (see use-cases.ts).
import type { Metric } from "../types.ts";

export const METRICS: Metric[] = [
  {
    value: "71%",
    label: "زيادة في معدلات التحويل من الحملات",
    source: "التنبؤ بمشتريات السيارات · تجزئة السيارات",
  },
  {
    value: "حتى 20%",
    label: "وفورات في التكاليف التشغيلية",
    source: "تحسين التموين على متن الطائرات · طيران منخفض التكلفة",
  },
  {
    value: "+30%",
    label: "في الطاقة الإنتاجية خلال شهر واحد",
    source: "كفاءة الإنتاج · تصنيع السلع المعمّرة",
  },
  {
    value: "−50%",
    label: "في مشكلات الجودة خلال شهرين",
    source: "تحسين جودة المنتج · إنترنت الأشياء في التصنيع",
  },
  {
    value: "ثوانٍ",
    label: "زمن الاستجابة، بعد أن كان يستغرق عدة أيام",
    source: "روبوت محادثة للامتثال التنظيمي المصرفي · الخدمات المالية",
  },
];
