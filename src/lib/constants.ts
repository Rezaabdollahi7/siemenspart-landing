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
