import { getCollection, type CollectionEntry } from "astro:content";
import { BRAND_LIST, SUBCATEGORIES } from "./constants";

export type ProductEntry = CollectionEntry<"products">["data"];

const BRAND_ORDER: Record<string, number> = Object.fromEntries(
  BRAND_LIST.map((b, i) => [b, i]),
);

// کلید: "BrandName::SubCategoryName" → ایندکس ترتیب
const SUBCATEGORY_ORDER: Record<string, number> = {};
Object.entries(SUBCATEGORIES).forEach(([parent, subs]) => {
  subs.forEach((sub, i) => {
    SUBCATEGORY_ORDER[`${parent}::${sub}`] = i;
  });
});

function sortProducts(products: ProductEntry[]): ProductEntry[] {
  return [...products].sort((a, b) => {
    // ۱) برند
    const brandA = BRAND_ORDER[a.brand] ?? 999;
    const brandB = BRAND_ORDER[b.brand] ?? 999;
    if (brandA !== brandB) return brandA - brandB;

    // ۲) زیردسته (کلید ترکیبی برند::زیردسته)
    const keyA = a.subCategory ? `${a.brand}::${a.subCategory}` : null;
    const keyB = b.subCategory ? `${b.brand}::${b.subCategory}` : null;

    const subA = keyA ? (SUBCATEGORY_ORDER[keyA] ?? 998) : 999;
    const subB = keyB ? (SUBCATEGORY_ORDER[keyB] ?? 998) : 999;
    if (subA !== subB) return subA - subB;

    // ۳) کد فنی الفبایی
    return a.modelCode.localeCompare(b.modelCode);
  });
}

export async function getAllProducts(): Promise<ProductEntry[]> {
  const entries = await getCollection("products");
  return sortProducts(entries.map((entry) => entry.data));
}

export async function getProductById(
  id: string,
): Promise<ProductEntry | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductEntry[]> {
  const products = await getAllProducts();
  const featured = products.filter((p) => p.featured);
  const source = featured.length > 0 ? featured : products;
  return source.slice(0, limit);
}

export async function getRelatedProducts(
  product: ProductEntry,
  limit = 4,
): Promise<ProductEntry[]> {
  const products = await getAllProducts();
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export {
  BRAND_LIST,
  CATEGORY_LIST,
  CATEGORY_LABELS_FA,
  BRAND_LABELS_FA,
  STOCK_LABELS_FA,
} from "./constants";
