import { useState, useMemo, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import type { ProductEntry } from "@/lib/products";
import { SUBCATEGORIES } from "@/lib/constants";

interface Props {
  products: ProductEntry[];
  brands: string[];
  categories: string[];
  categoryLabels: Record<string, string>;
  stockLabels: Record<string, string>;
}

const PAGE_SIZE = 12;

export default function ProductsExplorer({
  products,
  brands,
  categories,
  categoryLabels,
  stockLabels,
}: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    [],
  );
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // پر کردن فیلتر اولیه از querystring
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const brand = params.get("brand");
    const category = params.get("category");
    if (q) setQuery(q);
    if (brand && brands.includes(brand)) setSelectedBrands([brand]);
    if (category && categories.includes(category))
      setSelectedCategories([category]);
  }, [brands, categories]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    debouncedQuery,
    selectedBrands,
    selectedCategories,
    selectedSubCategories,
  ]);

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: [
          { name: "modelCode", weight: 0.6 },
          { name: "title", weight: 0.3 },
          { name: "brand", weight: 0.1 },
        ],
        threshold: 0.25,
        distance: 60,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    let base: ProductEntry[];

    if (trimmed) {
      const normalized = trimmed.toLowerCase();
      const exact = products.filter(
        (p) =>
          p.modelCode.toLowerCase().includes(normalized) ||
          p.title.toLowerCase().includes(normalized) ||
          p.brand.toLowerCase().includes(normalized),
      );
      base = exact.length > 0 ? exact : fuse.search(trimmed).map((r) => r.item);
    } else {
      base = products;
    }

    if (selectedBrands.length > 0)
      base = base.filter((p) => selectedBrands.includes(p.brand));

    if (selectedCategories.length > 0)
      base = base.filter((p) => selectedCategories.includes(p.category));

    if (selectedSubCategories.length > 0)
      base = base.filter(
        (p) => p.subCategory && selectedSubCategories.includes(p.subCategory),
      );

    return base;
  }, [
    debouncedQuery,
    fuse,
    products,
    selectedBrands,
    selectedCategories,
    selectedSubCategories,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => c + PAGE_SIZE);
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  // ——— toggle helpers ———
  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
    // وقتی برند انتخاب/لغو می‌شود، زیردسته‌های آن هم پاک می‌شوند
    if (SUBCATEGORIES[brand]) {
      setSelectedSubCategories((prev) =>
        prev.filter((s) => !SUBCATEGORIES[brand].includes(s)),
      );
    }
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
    if (SUBCATEGORIES[cat]) {
      setSelectedSubCategories((prev) =>
        prev.filter((s) => !SUBCATEGORIES[cat].includes(s)),
      );
    }
  }

  function toggleSubCategory(sub: string) {
    setSelectedSubCategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub],
    );
  }

  function toggleExpandBrand(brand: string) {
    setExpandedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  }

  function toggleExpandCategory(cat: string) {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function clearFilters() {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setQuery("");
  }

  const activeFilterCount =
    selectedBrands.length +
    selectedCategories.length +
    selectedSubCategories.length +
    (query ? 1 : 0);

  // ——— Filter Panel ———
  const FilterPanel = (
    <div className="space-y-7">
      {/* برند */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-ink-900">برند</h3>
        <div className="space-y-1">
          {brands.map((brand) => {
            const hasSubs = Boolean(SUBCATEGORIES[brand]?.length);
            const isExpanded = expandedBrands.includes(brand);
            const isChecked = selectedBrands.includes(brand);
            const subs = SUBCATEGORIES[brand] ?? [];

            return (
              <div key={brand}>
                <div className="flex items-center gap-1">
                  <label className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBrand(brand)}
                      className="size-4 rounded border-ink-300 accent-brand-500"
                    />
                    {brand}
                  </label>
                  {hasSubs && (
                    <button
                      onClick={() => toggleExpandBrand(brand)}
                      className="flex size-7 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-brand-600 transition-all"
                      title="نمایش زیردسته‌ها"
                    >
                      <svg
                        className={`size-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : "rotate-180"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* زیردسته‌های برند */}
                {hasSubs && isExpanded && (
                  <div className="mr-6 mt-1 space-y-1 border-r-2 border-brand-100 pr-3">
                    {subs.map((sub) => (
                      <label
                        key={sub}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs text-ink-500 hover:bg-brand-50/60 hover:text-brand-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubCategories.includes(sub)}
                          onChange={() => toggleSubCategory(sub)}
                          className="size-3.5 rounded border-ink-300 accent-[#009999]"
                        />
                        {sub}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* دسته‌بندی */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-ink-900">دسته‌بندی</h3>
        <div className="space-y-1">
          {categories.map((cat) => {
            const hasSubs = Boolean(SUBCATEGORIES[cat]?.length);
            const isExpanded = expandedCategories.includes(cat);
            const isChecked = selectedCategories.includes(cat);
            const subs = SUBCATEGORIES[cat] ?? [];

            return (
              <div key={cat}>
                <div className="flex items-center gap-1">
                  <label className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat)}
                      className="size-4 rounded border-ink-300 accent-[#009999]"
                    />
                    {categoryLabels[cat] ?? cat}
                  </label>
                  {hasSubs && (
                    <button
                      onClick={() => toggleExpandCategory(cat)}
                      className="flex size-7 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-brand-600 transition-all"
                      title="نمایش زیردسته‌ها"
                    >
                      <svg
                        className={`size-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* زیردسته‌های دسته‌بندی */}
                {hasSubs && isExpanded && (
                  <div className="mr-6 mt-1 space-y-1 border-r-2 border-brand-100 pr-3">
                    {subs.map((sub) => (
                      <label
                        key={sub}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs text-ink-500 hover:bg-brand-50/60 hover:text-brand-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubCategories.includes(sub)}
                          onChange={() => toggleSubCategory(sub)}
                          className="size-3.5 rounded border-ink-300 accent-[#009999]"
                        />
                        {sub}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-600"
        >
          حذف همه فیلترها
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      {/* فیلتر دسکتاپ */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white py-4 ps-6 pe-2 shadow-card">
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto ">
            {FilterPanel}
          </div>
        </div>
      </aside>

      <div>
        {/* سرچ بار + دکمه فیلتر موبایل */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute right-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی کد فنی، برند یا نام قطعه..."
              className="h-12 w-full rounded-xl border border-ink-200 bg-white pr-11 pl-4 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-ink-200 px-4 text-sm font-medium text-ink-700 lg:hidden"
          >
            فیلترها
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-brand-500 text-[11px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <p className="mt-4 text-sm text-ink-400">
          {filteredProducts.length.toLocaleString("fa-IR")} محصول یافت شد
        </p>

        {/* وضعیت خالی */}
        {filteredProducts.length === 0 && (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-ink-50">
              <svg
                className="size-7 text-ink-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-ink-700">نتیجه‌ای پیدا نشد</p>
            <p className="mt-1 text-sm text-ink-400">
              عبارت جستجو یا فیلترها را تغییر دهید.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              حذف فیلترها
            </button>
          </div>
        )}

        {/* گرید محصولات */}
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {visibleProducts.map((product) => (
            <a
              key={product.id}
              href={`/products/${product.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_8px_24px_-4px_rgba(0,153,153,0.16)]"
            >
              <div className="relative aspect-square overflow-hidden bg-ink-50">
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 rounded-full border border-brand-200 bg-white/95 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur-sm">
                  {product.brand}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs font-medium text-ink-400">
                  {categoryLabels[product.category] ?? product.category}
                  {product.subCategory && (
                    <span className="mr-1 text-ink-300">
                      · {product.subCategory}
                    </span>
                  )}
                </p>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-6 text-ink-900 group-hover:text-brand-600">
                  {product.title}
                </h3>
                <p className="mt-1 text-xs text-ink-400" dir="ltr">
                  {product.modelCode}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs">
                  <span className="text-ink-500">
                    {stockLabels[product.stockStatus] ?? product.stockStatus}
                  </span>
                  <span className="font-medium text-brand-600">جزئیات</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* اسکلتون لودینگ */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-ink-100"
              >
                <div className="aspect-square bg-ink-100" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 rounded bg-ink-100" />
                  <div className="h-4 w-full rounded bg-ink-100" />
                  <div className="h-3 w-2/3 rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* پنل فیلتر موبایل */}
      {/* پنل فیلتر موبایل */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* بکدراپ */}
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* پنل سایدبار */}
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl">
            {/* هدر ثابت */}
            <div className="shrink-0 border-b border-ink-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-ink-900">فیلترها</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* نمایش تعداد فیلترهای فعال */}
              {activeFilterCount > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-ink-500">
                    {activeFilterCount} فیلتر فعال
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-brand-600 hover:text-brand-700"
                  >
                    حذف همه
                  </button>
                </div>
              )}
            </div>

            {/* محتوای اسکرول‌شونده */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scroll-pb-4">
              {FilterPanel}
            </div>

            {/* دکمه ثابت پایین */}
            <div className="shrink-0 border-t border-ink-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600 active:scale-[0.98]"
              >
                نمایش {filteredProducts.length.toLocaleString("fa-IR")} نتیجه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
