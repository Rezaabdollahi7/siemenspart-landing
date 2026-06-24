import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ترکیب امن کلاس‌های Tailwind (حذف تداخل، حفظ آخرین مقدار)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
