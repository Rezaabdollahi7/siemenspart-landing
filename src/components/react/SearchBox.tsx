import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import type { ProductEntry } from "@/lib/products";

interface Props {
  products: ProductEntry[];
  placeholder?: string;
  // اگر true باشد، با جستجو مستقیم به صفحه محصول هدایت می‌کند (برای ناوبار)
  compact?: boolean;
}

const CATEGORY_LABELS_FA: Record<string, string> = {
  Motor: "موتور سرو",
  Encoder: "انکودر",
  Drive: "درایو",
  Spindle: "اسپیندل",
  "Control Panel": "پنل کنترل",
  "Power Supply": "منبع تغذیه",
  Cable: "کابل اتصال",
};

export default function SearchBox({ products, placeholder = "جستجوی کد فنی، برند یا نام قطعه...", compact = false }: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // debounce ۲۵۰ میلی‌ثانیه‌ای برای جستجو
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // بستن نتایج با کلیک خارج از باکس
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: [
          { name: "title", weight: 0.4 },
          { name: "modelCode", weight: 0.35 },
          { name: "brand", weight: 0.15 },
          { name: "shortDescription", weight: 0.1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [products]
  );

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return fuse.search(debouncedQuery).slice(0, 7);
  }, [debouncedQuery, fuse]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
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
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-ink-200 bg-ink-50/60 pr-11 pl-4 text-[14px] text-ink-800 placeholder:text-ink-400 outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {isOpen && debouncedQuery.trim() && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-ink-100 bg-white shadow-[0_12px_32px_-8px_rgba(14,17,17,0.15)]">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-ink-400">
              نتیجه‌ای برای «{debouncedQuery}» پیدا نشد.
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {results.map(({ item }) => (
                <li key={item.id}>
                  <a
                    href={`/products/${item.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-50/60"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="size-10 shrink-0 rounded-lg border border-ink-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800">{item.title}</p>
                      <p className="truncate text-xs text-ink-400">
                        {item.brand} · {CATEGORY_LABELS_FA[item.category]} · {item.modelCode}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 && (
            <a
              href={`/products?q=${encodeURIComponent(debouncedQuery)}`}
              className="block border-t border-ink-100 px-4 py-3 text-center text-sm font-medium text-brand-600 hover:bg-brand-50/60"
            >
              مشاهده همه نتایج
            </a>
          )}
        </div>
      )}
    </div>
  );
}
