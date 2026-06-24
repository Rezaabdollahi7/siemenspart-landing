import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

// اسکیمای محصولات؛ منبع داده فایل products.json است
// (۳۹۳ قطعه واقعی، مهاجرت‌شده از کاتالوگ ووکامرس سایت قدیم)
const products = defineCollection({
  loader: file("src/content/products/products.json"),
  schema: z.object({
    id: z.string(),
    brand: z.enum(["Siemens", "Heidenhain", "Indramat", "Fanuc", "Mitsubishi", "Other"]),
    category: z.enum([
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
    ]),
    modelCode: z.string(),
    title: z.string(),
    shortDescription: z.string(),
    fullDescription: z.string(),
    image: z.string(),
    gallery: z.array(z.string()).optional(),
    stockStatus: z.enum(["in_stock", "limited", "order_only"]),
    featured: z.boolean().optional(),
    relatedIds: z.array(z.string()).optional(),
  }),
});

export const collections = { products };
