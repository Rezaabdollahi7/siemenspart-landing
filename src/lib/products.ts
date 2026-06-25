import { getCollection, type CollectionEntry } from "astro:content";

export type ProductEntry = CollectionEntry<"products">["data"];

export async function getAllProducts(): Promise<ProductEntry[]> {
  const entries = await getCollection("products");
  return entries.map((entry) => entry.data);
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
