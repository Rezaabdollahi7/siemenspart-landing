// تایپ‌های مرتبط با محصولات (قطعات یدکی CNC)
//
// نکته: این enum ها بر اساس دسته‌بندی واقعی کاتالوگ زیمنس‌پارت (۳۹۳ محصول واقعی،
// مهاجرت‌شده از ووکامرس) تنظیم شده‌اند و عمداً باز و دقیق نگه داشته شده‌اند
// تا با داده واقعی همخوانی کامل داشته باشند.

export type ProductBrand =
  | "Siemens"
  | "Heidenhain"
  | "Indramat"
  | "Fanuc"
  | "Mitsubishi"
  | "Other";

export type ProductCategory =
  | "Controller" // کنترلر CNC (Sinumerik, PCU, NCU, MMC, ...)
  | "Drive" // درایو و بردهای کنترل درایو (SIMODRIVE, اینورتر، ...)
  | "PLC" // PLC و ماژول‌های آن (از جمله LOGO)
  | "Servo Motor" // موتور سروو
  | "Spindle" // موتور اسپیندل
  | "Encoder" // انکودر دورانی
  | "Linear Scale" // خط‌کش دیجیتال
  | "Tacho Generator" // تاکو ژنراتور
  | "Power Supply" // منبع تغذیه
  | "Hand Wheel" // هندویل
  | "Cable" // کابل اتصال
  | "Other"; // سایر قطعات

export type StockStatus = "in_stock" | "limited" | "order_only";

export interface Product {
  id: string; // شناسه یکتا (slug) — بر اساس شناسه عددی محصول در منبع اصلی
  brand: ProductBrand;
  category: ProductCategory;
  modelCode: string; // کد فنی محصول، مثل 6SN1118-0NH01-0AA1
  title: string; // عنوان فارسی محصول
  shortDescription: string;
  fullDescription: string;
  image: string; // مسیر تصویر اصلی
  gallery?: string[];
  stockStatus: StockStatus;
  featured?: boolean;
  relatedIds?: string[];
}
