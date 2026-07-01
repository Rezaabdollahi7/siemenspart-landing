import json
import random
import re
from pathlib import Path

random.seed(42)

SRC = Path("/home/sreza/Downloads/products.json")
OUT = Path("/home/sreza/Downloads/siemenspart/src/content/products/products.json")

PLACEHOLDER_COUNT = 6

BRAND_MAP = {
    "Siemens": "Siemens",
    "Heidenhain": "Heidenhain",
    "INDRAMAT": "Indramat",
    "Fanuce": "Fanuc",
    "Fanuc": "Fanuc",
}
NESTED_BRAND_MAP = {
    "MITSUBISHI": "Mitsubishi",
}
DEFAULT_BRAND = "Other"

CATEGORY_MAP = {
    "PLC": "PLC",
    "LOGO": "PLC",
    "SERVO Motor": "Servo Motor",
    "MOTORS": "Servo Motor",
    "DRIVES": "Drive",
    "OLD DRIVES": "Drive",
    "SERVO DRIVE": "Drive",
    "INVERTER": "Drive",
    "درایو 611D": "Drive",
    "انکودر": "Encoder",
    "خط کش های دیجیتال": "Linear Scale",
    "تاکو ژنراتور": "Tacho Generator",
    "منبع تغذیه": "Power Supply",
    "کنترلر": "Controller",
    "HAND WHEELS": "Hand Wheel",
    "CINCINNATI": "Controller",
    "متفرقه": "Other",
    "کارت مژرینگ": "Other",
    "S7-300": "PLC",
    "S7-200": "PLC",
    "S7-400": "PLC",
    "S5": "PLC",
    "RELAY": "PLC",
}
SINUMERIK_PREFIX = "Sinumerik"
SINUMERIK_PREFIX2 = "SINUMERIK"
DEFAULT_CATEGORY = "Other"

# ---------------------------------------------------------------
# نگاشت زیردسته‌بندی (subCategory)
# کلید: segment دقیق در مسیر دسته‌بندی ووکامرس
# مقدار: نام نرمالایز‌شده زیردسته در سایت جدید
# ---------------------------------------------------------------
SUBCATEGORY_MAP = {
    # Siemens → Sinumerik sub-series
    "Sinumerik 840D -840DI-840DSL": "Sinumerik 840D/840DI/840DSL",
    "SINUMERIK840D":                "Sinumerik 840D/840DI/840DSL",
    "SINUMERIK 840DI":              "Sinumerik 840D/840DI/840DSL",
    "Sinumerik810D":                "Sinumerik 810D",
    "Sinumerik 840C":               "Sinumerik 840C",
    "Sinumerik 880-850":            "Sinumerik 880/850",
    "Sinumerik System3":            "Sinumerik System 3",
    "Sinumerik 810M-820M-810T-820T":"Sinumerik 810M/820M/810T/820T",
    "Sinumerik828D-808D-802D-802C": "Sinumerik 828D/808D/802D/802C",
    # PLC sub-series
    "LOGO":  "LOGO",
    "RELAY": "RELAY",
    "S5":    "S5",
    "S7-200":"S7-200",
    "S7-300":"S7-300",
    "S7-400":"S7-400",
}

BRAND_LABELS_FA = {
    "Siemens": "زیمنس",
    "Heidenhain": "هایدن‌هاین",
    "Indramat": "ایندرامات",
    "Fanuc": "فانوک",
    "Mitsubishi": "میتسوبیشی",
    "Other": "سایر برندها",
}
CATEGORY_LABELS_FA = {
    "PLC": "PLC و کنترلر صنعتی",
    "Servo Motor": "موتور سروو",
    "Drive": "درایو",
    "Encoder": "انکودر",
    "Linear Scale": "خط‌کش دیجیتال",
    "Tacho Generator": "تاکو ژنراتور",
    "Power Supply": "منبع تغذیه",
    "Controller": "کنترلر CNC",
    "Hand Wheel": "هندویل",
    "Spindle": "اسپیندل",
    "Cable": "کابل اتصال",
    "Other": "سایر قطعات",
}
STOCK_STATUSES = ["in_stock", "limited", "order_only"]


def best_path(categories):
    if not categories:
        return []
    return max(categories, key=len)


def resolve_brand(categories):
    for path in categories:
        for segment in path:
            if segment in NESTED_BRAND_MAP:
                return NESTED_BRAND_MAP[segment]
    path = best_path(categories)
    if path and path[0] in BRAND_MAP:
        return BRAND_MAP[path[0]]
    return DEFAULT_BRAND


def resolve_category(categories, name, short_desc):
    path = best_path(categories)
    text = f"{name} {short_desc}".upper()
    if "SIMODRIVE" in text or "POWER MODULE" in text or "CONTROL BOARD" in text or "INFEED MODULE" in text:
        return "Drive"
    if "PCU" in text or "MMC" in text or "OPERATOR PANEL" in text or "NCU" in text:
        return "Controller"
    for segment in path[1:]:
        if segment in CATEGORY_MAP:
            return CATEGORY_MAP[segment]
        if segment.startswith(SINUMERIK_PREFIX) or segment.startswith(SINUMERIK_PREFIX2):
            return "Controller"
    return DEFAULT_CATEGORY


def resolve_subcategory(categories):
    """
    زیردسته را از تمام segments همه مسیرها استخراج می‌کند.
    اگر هیچ زیردسته‌ای تعریف‌شده نبود، None برمی‌گرداند.
    """
    for path in categories:
        for segment in path:
            if segment in SUBCATEGORY_MAP:
                return SUBCATEGORY_MAP[segment]
    return None


def clean_text(text):
    if not text:
        return ""
    text = text.replace("\\n", " ").replace("\\xa0", " ").replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_hint(short_description):
    cleaned = clean_text(short_description)
    match = re.search(r"Full Description:\s*(.+)", cleaned, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    match = re.search(r"Description:\s*(.+)", cleaned, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return ""


def make_title(name, brand, category):
    brand_fa = BRAND_LABELS_FA.get(brand, brand)
    category_fa = CATEGORY_LABELS_FA.get(category, category)
    return f"{category_fa} {brand_fa} مدل {name}"


def make_short_description(brand, category):
    brand_fa = BRAND_LABELS_FA.get(brand, brand)
    category_fa = CATEGORY_LABELS_FA.get(category, category)
    templates = [
        f"قطعه اصلی {brand_fa}، تست‌شده و آماده نصب فوری روی دستگاه CNC.",
        f"{category_fa} بازسازی‌شده {brand_fa} با تست کامل عملکرد پیش از تحویل.",
        f"موجود برای تعمیر یا تعویض مستقیم، با تطابق کامل با نمونه اصلی {brand_fa}.",
        f"{category_fa} اورجینال {brand_fa}، آماده ارسال با گارانتی سلامت فنی.",
    ]
    idx = hash(brand + category) % len(templates)
    return templates[idx]


def make_full_description(name, brand, category, hint):
    brand_fa = BRAND_LABELS_FA.get(brand, brand)
    category_fa = CATEGORY_LABELS_FA.get(category, category)
    base = (
        f"این {category_fa} با کد فنی {name} متعلق به برند {brand_fa} است و پس از بازرسی و تست فنی دقیق "
        f"(بررسی ظاهری، تست عملکرد و در صورت نیاز کالیبراسیون) برای استفاده مجدد در خطوط تولید صنعتی آماده‌سازی شده است."
    )
    if hint:
        base += f" بر اساس مستندات فنی موجود: {hint}."
    base += (
        " این قطعه برای تعمیر یا جایگزینی مستقیم در دستگاه‌های CNC مناسب است و پیش از خرید امکان مشاوره فنی رایگان "
        "با کارشناسان سیمنس‌پارت فراهم است."
    )
    return base


def resolve_images(image_filenames, index_for_placeholder):
    if not image_filenames:
        ph = (index_for_placeholder % PLACEHOLDER_COUNT) + 1
        fallback = f"/images/products/placeholder-{ph}.jpg"
        return fallback, [fallback]
    images = [f"/images/products/{fn}" for fn in image_filenames]
    return images[0], images


def transform():
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    published = [p for p in raw if p.get("published", True) is not False]

    products = []
    for i, p in enumerate(published):
        wp_id = p["id"]
        name = clean_text(p.get("name", "")) or f"محصول {wp_id}"
        categories = p.get("categories", [])

        brand    = resolve_brand(categories)
        category = resolve_category(categories, name, p.get("short_description", ""))
        subcat   = resolve_subcategory(categories)

        hint = extract_hint(p.get("short_description", ""))
        image, gallery = resolve_images(p.get("images", []), i)

        product = {
            "id":               f"sp-{wp_id}",
            "brand":            brand,
            "category":         category,
            "subCategory":      subcat,   # None اگر ندارد، string اگر دارد
            "modelCode":        name,
            "title":            make_title(name, brand, category),
            "shortDescription": make_short_description(brand, category),
            "fullDescription":  make_full_description(name, brand, category, hint),
            "image":            image,
            "gallery":          gallery,
            "stockStatus":      random.choice(STOCK_STATUSES),
        }
        # مقادیر None را حذف می‌کنیم تا JSON تمیزتر باشد
        if product["subCategory"] is None:
            del product["subCategory"]

        products.append(product)


    # ترتیب نمایش دسته‌بندی‌ها در لیست محصولات
    CATEGORY_ORDER = [
        "Controller", "Drive", "Encoder", "Linear Scale",
        "Tacho Generator", "Servo Motor", "Spindle",
        "Hand Wheel", "Power Supply", "Cable", "Other", "PLC",
    ]
    products.sort(key=lambda p: (
        CATEGORY_ORDER.index(p["category"]) if p["category"] in CATEGORY_ORDER else len(CATEGORY_ORDER) - 1,
        p.get("brand", ""),
        p.get("modelCode", ""),
    ))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ {len(products)} محصول به {OUT} تبدیل شد.")

    from collections import Counter
    print("\n--- برند ---")
    for b, c in Counter(p["brand"] for p in products).most_common():
        print(f"  {c:4d}  {b}")
    print("\n--- دسته‌بندی ---")
    for c, n in Counter(p["category"] for p in products).most_common():
        print(f"  {n:4d}  {c}")
    print("\n--- زیردسته ---")
    subs = [p.get("subCategory") for p in products if p.get("subCategory")]
    for s, n in Counter(subs).most_common():
        print(f"  {n:4d}  {s}")
    print(f"\n  محصولات با زیردسته: {len(subs)} از {len(products)}")


if __name__ == "__main__":
    transform()