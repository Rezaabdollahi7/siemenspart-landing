import { getCollection, type CollectionEntry } from "astro:content";

export type ProductEntry = CollectionEntry<"products">["data"];

// خروجی استاندارد: آرایه‌ای از داده محصولات (بدون wrapper مخصوص content collection)
export async function getAllProducts(): Promise<ProductEntry[]> {
  const entries = await getCollection("products");
  return entries.map((entry) => entry.data);
}

export async function getProductById(id: string): Promise<ProductEntry | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductEntry[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.featured).slice(0, limit);
}

export async function getRelatedProducts(product: ProductEntry, limit = 4): Promise<ProductEntry[]> {
  const products = await getAllProducts();
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export const BRAND_LIST = ["Siemens", "Heidenhain", "Indramat", "Fanuc", "Bosch Rexroth"] as const;

export const CATEGORY_LIST = [
  "Motor",
  "Encoder",
  "Drive",
  "Spindle",
  "Control Panel",
  "Power Supply",
  "Cable",
] as const;

export const CATEGORY_LABELS_FA: Record<string, string> = {
  Motor: "موتور سرو",
  Encoder: "انکودر",
  Drive: "درایو",
  Spindle: "اسپیندل",
  "Control Panel": "پنل کنترل",
  "Power Supply": "منبع تغذیه",
  Cable: "کابل اتصال",
};

export const STOCK_LABELS_FA: Record<string, string> = {
  in_stock: "موجود در انبار",
  limited: "موجودی محدود",
  order_only: "فقط با سفارش",
};
