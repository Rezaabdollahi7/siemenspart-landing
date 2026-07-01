// این فایل را React Island ها هم می‌توانند ایمپورت کنند (وابستگی به astro:content ندارد)

export const BRAND_LIST = [
  "Siemens",
  "Heidenhain",
  "Indramat",
  "Fanuc",
  "Mitsubishi",
  "Other",
] as const;

export const CATEGORY_LIST = [
  "Controller",
  "Drive",
  "PLC",
  "Servo Motor",
  "Spindle",
  "Encoder",
  "Linear Scale",
  "Tacho Generator",
  "Power Supply",
  "Hand Wheel",
  "Cable",
  "Other",
] as const;

export const CATEGORY_LABELS_FA: Record<string, string> = {
  Controller: "کنترلر CNC",
  Drive: "درایو",
  PLC: "PLC و کنترلر صنعتی",
  "Servo Motor": "موتور سروو",
  Spindle: "اسپیندل",
  Encoder: "انکودر",
  "Linear Scale": "خط‌کش دیجیتال",
  "Tacho Generator": "تاکو ژنراتور",
  "Power Supply": "منبع تغذیه",
  "Hand Wheel": "هندویل",
  Cable: "کابل اتصال",
  Other: "سایر قطعات",
};

export const BRAND_LABELS_FA: Record<string, string> = {
  Siemens: "زیمنس",
  Heidenhain: "هایدن‌هاین",
  Indramat: "ایندرامات",
  Fanuc: "فانوک",
  Mitsubishi: "میتسوبیشی",
  Other: "سایر برندها",
};

export const STOCK_LABELS_FA: Record<string, string> = {
  in_stock: "موجود در انبار",
  limited: "موجودی محدود",
  order_only: "فقط با سفارش",
};

// زیردسته‌بندی‌ها — کلید: برند یا دسته‌بندی والد، مقدار: لیست زیردسته‌ها
// این ساختار در ProductsExplorer برای رندر accordion فیلتر استفاده می‌شود.
export const SUBCATEGORIES: Record<string, string[]> = {
  // زیردسته‌های برند Siemens (سری‌های Sinumerik)
  Siemens: [
    "Sinumerik 840D/840DI/840DSL",
    "Sinumerik 810D",
    "Sinumerik 840C",
    "Sinumerik 880/850",
    "Sinumerik System 3",
    "Sinumerik 810M/820M/810T/820T",
    "Sinumerik 828D/808D/802D/802C",
  ],
  // زیردسته‌های دسته‌بندی PLC (خانواده‌های مختلف)
  PLC: ["S7-300", "S5", "RELAY", "S7-200", "S7-400", "LOGO"],
};
