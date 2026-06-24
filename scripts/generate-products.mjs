// اسکریپت تولید داده نمونه (۳۰۰ محصول) برای تست UI
// اجرا: node scripts/generate-products.mjs

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const brands = ["Siemens", "Heidenhain", "Indramat", "Fanuc", "Bosch Rexroth"];

const categories = [
  "Motor",
  "Encoder",
  "Drive",
  "Spindle",
  "Control Panel",
  "Power Supply",
  "Cable",
];

const categoryFa = {
  Motor: "موتور سرو",
  Encoder: "انکودر",
  Drive: "درایو",
  Spindle: "اسپیندل",
  "Control Panel": "پنل کنترل",
  "Power Supply": "منبع تغذیه",
  Cable: "کابل اتصال",
};

const stockStatuses = ["in_stock", "limited", "order_only"];

// الگوهای کد فنی واقعی‌نما بر اساس برند
function generateModelCode(brand, index) {
  switch (brand) {
    case "Siemens": {
      const series = ["1FT6", "1FK7", "6SN1", "6SL3", "1PH8"];
      const s = series[index % series.length];
      const suffix = String(80 + (index % 20)).padStart(3, "0");
      return `${s}${suffix}-${(index % 9) + 1}AC${(index % 7) + 1}1-${(index % 5) + 1}AG${(index % 3) + 1}`;
    }
    case "Heidenhain": {
      const series = ["ROD", "ERN", "LC", "LS", "RCN"];
      const s = series[index % series.length];
      const num = 400 + (index % 600);
      return `${s} ${num}.${(index % 9) + 1}`;
    }
    case "Indramat": {
      const series = ["MAC", "MKD", "MHD", "DKC", "TVM"];
      const s = series[index % series.length];
      return `${s}${71 + (index % 25)}B-0-${(index % 9) + 1}-${(index % 6) + 1}00-A1`;
    }
    case "Fanuc": {
      const series = ["A06B", "A20B", "A16B"];
      const s = series[index % series.length];
      return `${s}-${1000 + (index % 9000)}-${String(index % 100).padStart(4, "0")}`;
    }
    case "Bosch Rexroth": {
      const series = ["MSK", "HMS", "IndraDrive"];
      const s = series[index % series.length];
      return `${s}${30 + (index % 70)}D-0${(index % 9)}00-${(index % 9) + 1}G${(index % 3) + 1}-${(index % 5) + 1}`;
    }
    default:
      return `GEN-${index}`;
  }
}

const titleTemplates = {
  Motor: (brand) => `موتور سرو ${brand}`,
  Encoder: (brand) => `انکودر دورانی ${brand}`,
  Drive: (brand) => `درایو سروو ${brand}`,
  Spindle: (brand) => `موتور اسپیندل ${brand}`,
  "Control Panel": (brand) => `پنل کنترل صنعتی ${brand}`,
  "Power Supply": (brand) => `منبع تغذیه صنعتی ${brand}`,
  Cable: (brand) => `کابل اتصال انکودر ${brand}`,
};

const shortDescTemplates = [
  "قطعه اصلی، تست‌شده و آماده نصب فوری روی دستگاه CNC.",
  "قطعه بازسازی‌شده با تست کامل عملکرد و گارانتی سلامت فنی.",
  "موجود برای تعمیر یا تعویض مستقیم، با تطابق کامل با نمونه اصلی.",
  "قطعه اورجینال خارج از رده با کارایی کامل و آماده ارسال.",
  "بازسازی‌شده در واحد فنی شرکت با تست بار کامل قبل از ارسال.",
];

function fullDescFor(brand, category, modelCode) {
  return (
    `این ${categoryFa[category]} با کد فنی ${modelCode} متعلق به برند ${brand} است و پس از تست‌های دقیق فنی ` +
    `(تست عایق، تست بار، و کالیبراسیون در صورت نیاز) برای استفاده مجدد روی دستگاه‌های CNC صنعتی آماده شده است. ` +
    `این قطعه برای تعمیر یا جایگزینی مستقیم در خطوط تولید مناسب است و امکان مشاوره فنی رایگان پیش از خرید نیز فراهم است.`
  );
}

function specsFor(category, index) {
  const base = [];
  switch (category) {
    case "Motor":
      base.push(
        { label: "ولتاژ نامی", value: `${(index % 3) === 0 ? 400 : 230} ولت` },
        { label: "گشتاور نامی", value: `${(2 + (index % 18)).toFixed(1)} نیوتن‌متر` },
        { label: "سرعت نامی", value: `${2000 + (index % 4) * 500} دور بر دقیقه` },
        { label: "نوع خنک‌کاری", value: index % 2 === 0 ? "هوای طبیعی" : "فن اجباری" }
      );
      break;
    case "Encoder":
      base.push(
        { label: "رزولوشن", value: `${1024 * (1 + (index % 8))} پالس بر دور` },
        { label: "نوع خروجی", value: index % 2 === 0 ? "اینکرمنتال" : "ابسولوت" },
        { label: "ولتاژ تغذیه", value: "5 ولت DC" }
      );
      break;
    case "Drive":
      base.push(
        { label: "جریان نامی", value: `${(5 + (index % 40)).toFixed(1)} آمپر` },
        { label: "ولتاژ ورودی", value: "3×400 ولت AC" },
        { label: "نوع کنترل", value: index % 2 === 0 ? "وکتور" : "سروو دیجیتال" }
      );
      break;
    case "Spindle":
      base.push(
        { label: "توان نامی", value: `${(3 + (index % 22)).toFixed(1)} کیلووات` },
        { label: "حداکثر دور", value: `${8000 + (index % 6) * 2000} دور بر دقیقه` },
        { label: "نوع نشیمن‌گاه", value: "بلبرینگ سرامیکی" }
      );
      break;
    case "Control Panel":
      base.push(
        { label: "نوع نمایشگر", value: index % 2 === 0 ? "لمسی رنگی" : "LCD صنعتی" },
        { label: "ولتاژ ورودی", value: "24 ولت DC" },
        { label: "پروتکل ارتباطی", value: "Profibus / Ethernet" }
      );
      break;
    case "Power Supply":
      base.push(
        { label: "توان خروجی", value: `${(500 + (index % 10) * 250)} وات` },
        { label: "ولتاژ ورودی", value: "3×400 ولت AC" },
        { label: "ولتاژ خروجی", value: "24 ولت DC" }
      );
      break;
    case "Cable":
      base.push(
        { label: "طول", value: `${1 + (index % 10)} متر` },
        { label: "نوع شیلد", value: "محافظ EMC" },
        { label: "تعداد پین", value: `${8 + (index % 4) * 4} پین` }
      );
      break;
  }
  return base;
}

const products = [];

for (let i = 0; i < 300; i++) {
  const brand = brands[i % brands.length];
  const category = categories[(i + Math.floor(i / brands.length)) % categories.length];
  const modelCode = generateModelCode(brand, i);
  const id = `${brand.toLowerCase().replace(/\s+/g, "-")}-${category.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`;
  const title = `${titleTemplates[category](brand)} مدل ${modelCode}`;
  const shortDescription = shortDescTemplates[i % shortDescTemplates.length];

  products.push({
    id,
    brand,
    category,
    modelCode,
    title,
    shortDescription,
    fullDescription: fullDescFor(brand, category, modelCode),
    specs: specsFor(category, i),
    image: `/images/products/placeholder-${(i % 6) + 1}.jpg`,
    gallery: [
      `/images/products/placeholder-${(i % 6) + 1}.jpg`,
      `/images/products/placeholder-${((i + 1) % 6) + 1}.jpg`,
    ],
    stockStatus: stockStatuses[i % stockStatuses.length],
    featured: i % 17 === 0,
  });
}

const outPath = path.join(__dirname, "..", "src", "content", "products", "products.json");
writeFileSync(outPath, JSON.stringify(products, null, 2), "utf-8");
console.log(`✅ ${products.length} محصول نمونه در ${outPath} ساخته شد.`);
