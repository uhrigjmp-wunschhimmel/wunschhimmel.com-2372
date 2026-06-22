// ── Awin Product Datafeed ─────────────────────────────────────────────────────
// Zwei Nutzungsarten:
// 1. fetchFullMerchantFeed() — voller Katalog pro Merchant, NUR für den
//    geplanten Batch-Sync (siehe awin-sync.ts). Läuft per Cron, nicht live.
// 2. searchAwin() — die alte Live-Suche pro Chat-Anfrage. Bleibt im Code für
//    Referenz/Debugging, wird aber in live-search.ts NICHT mehr aufgerufen,
//    weil sie laut Praxiserfahrung instabil ist ("Feed-API instabil").
//
// Docs: https://wiki.awin.com/index.php/Product_Feeds_API

import type { LiveProduct } from "../live-search";

export const AWIN_BASE = "https://productdata.awin.com/datafeed/download/apikey";
const TIMEOUT_MS = 8000;
const FULL_FEED_TIMEOUT_MS = 20000; // Voller Feed kann groß sein, mehr Zeit geben

// Merchant IDs (joined programmes)
export const MERCHANT_PRIORITIES = [
  { id: "14336", name: "OTTO DE",           weight: 10 },
  { id: "19075", name: "Avocadostore DE",   weight: 9  },
  { id: "14824", name: "babymarkt DE",      weight: 8  },
  { id: "20615", name: "Stapelstein DE",    weight: 8  },
  { id: "27221", name: "MyHappyMoments DE", weight: 7  },
  { id: "112586", name: "World of Sweets",  weight: 7  },
  { id: "16916", name: "Roastmarket DE",    weight: 7  },
  { id: "18556", name: "Fackelmann DE",     weight: 6  },
  { id: "9958",  name: "Lights4fun DE",     weight: 6  },
  { id: "114772", name: "Runnershub DE",    weight: 6  },
  { id: "114336", name: "House-of-Sneakers",weight: 5  },
  { id: "125332", name: "Autofull EU",      weight: 4  },
];

export const AWIN_COLUMNS = [
  "aw_product_id",
  "product_name",
  "description",
  "merchant_image_url",
  "search_price",
  "currency",
  "aw_deep_link",
  "merchant_id",
  "merchant_name",
  "category_name",
  "brand_name",
  "in_stock",
].join(",");

export interface AwinDatafeedProduct {
  aw_product_id: string;
  product_name: string;
  description: string;
  merchant_image_url: string;
  search_price: string;
  currency: string;
  aw_deep_link: string;
  merchant_id: string;
  merchant_name: string;
  category_name: string;
  brand_name?: string;
  in_stock?: string;
}

function normalizeAwinProduct(p: AwinDatafeedProduct): LiveProduct {
  const price = parseFloat(p.search_price?.replace(",", ".")) || null;

  return {
    id: `awin_${p.aw_product_id}`,
    title: p.product_name || "",
    description: (p.description || "").slice(0, 200),
    imageUrl: p.merchant_image_url || "",
    price,
    currency: p.currency || "EUR",
    affiliateUrl: p.aw_deep_link || "",
    directProductUrl: p.aw_deep_link || "",
    category: p.category_name || "Sonstiges",
    tags: [p.brand_name].filter(Boolean) as string[],
    partnerId: "awin",
    rawSourceId: p.aw_product_id,
    merchantId: p.merchant_id,
    merchantName: p.merchant_name,
    availability: p.in_stock === "1" || p.in_stock === "yes" ? "in_stock" : "unknown",
    fetchedAt: new Date().toISOString(),
  };
}

// ── NEU: Voller Katalog-Download für den Batch-Sync ──────────────────────────
// Kein "keyword"-Parameter — wir wollen den ganzen (gedeckelten) Merchant-Feed,
// nicht nur Treffer zu einer einzelnen Chat-Anfrage.
export async function fetchFullMerchantFeed(params: {
  apiToken: string;
  merchantId: string;
  maxItems?: number;
}): Promise<AwinDatafeedProduct[]> {
  const { apiToken, merchantId, maxItems = 300 } = params;

  const url = new URL(
    `${AWIN_BASE}/${apiToken}/language/de/fid/${merchantId}/columns/${AWIN_COLUMNS}/format/json/`
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FULL_FEED_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];

    const text = await res.text();
    let data: unknown;

    if (text.includes("Redirecting to legacy_system")) {
      const loc = JSON.parse(text)?.location;
      if (!loc) return [];
      const res2 = await fetch(loc, { signal: controller.signal });
      if (!res2.ok) return [];
      data = await res2.json();
    } else {
      data = JSON.parse(text);
    }

    const items = Array.isArray(data) ? (data as AwinDatafeedProduct[]) : [];
    return items.slice(0, maxItems);
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

// ── ALT: Live-Suche pro Chat-Anfrage ──────────────────────────────────────────
// Wird in live-search.ts nicht mehr aufgerufen — bleibt nur als Referenz/
// Fallback erhalten, falls sie für ein anderes Feature wieder gebraucht wird.
async function searchMerchantFeed(params: {
  apiToken: string;
  merchantId: string;
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  pageSize?: number;
}): Promise<AwinDatafeedProduct[]> {
  const { apiToken, merchantId, keyword, minPrice, maxPrice, pageSize = 8 } = params;

  const url = new URL(`${AWIN_BASE}/${apiToken}/language/de/fid/${merchantId}/columns/${AWIN_COLUMNS}/format/json/`);
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("limit", String(pageSize));
  if (minPrice != null) url.searchParams.set("mPrice", String(minPrice));
  if (maxPrice != null) url.searchParams.set("xPrice", String(maxPrice));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const text = await res.text();

    if (text.includes("Redirecting to legacy_system")) {
      const loc = JSON.parse(text)?.location;
      if (!loc) return [];

      const res2 = await fetch(loc, { signal: controller.signal });
      if (!res2.ok) return [];
      const data = await res2.json();
      return Array.isArray(data) ? data : [];
    }

    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

export async function searchAwin(params: {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  locale?: string;
  pageSize?: number;
  publisherId: string;
  apiToken: string;
  occasion?: string;
  recipient?: string;
}): Promise<{ products: LiveProduct[]; error?: string; totalFound?: number }> {
  const { keywords, minPrice, maxPrice, pageSize = 12, apiToken } = params;

  if (!apiToken || apiToken === "YOUR_AWIN_API_TOKEN") {
    return { products: [], error: "Awin API token not configured" };
  }

  const query = keywords.slice(0, 3).join(" ");
  const merchantsToSearch = MERCHANT_PRIORITIES.slice(0, 3);

  const results = await Promise.allSettled(
    merchantsToSearch.map(m =>
      searchMerchantFeed({
        apiToken,
        merchantId: m.id,
        keyword: query,
        minPrice,
        maxPrice,
        pageSize: Math.ceil(pageSize / merchantsToSearch.length) + 2,
      })
    )
  );

  const all: AwinDatafeedProduct[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  if (all.length === 0) {
    return { products: [], error: "Awin: keine Ergebnisse für diese Keywords" };
  }

  const products = all
    .filter(p => p.product_name && p.aw_deep_link)
    .map(normalizeAwinProduct)
    .slice(0, pageSize);

  return { products, totalFound: all.length };
}
