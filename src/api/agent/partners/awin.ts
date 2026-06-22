// ── Awin Product Datafeed ─────────────────────────────────────────────────────
// WICHTIG: Die IDs unten sind ECHTE FEED-IDs (aus /admin/awin-feedlist ermittelt),
// NICHT die Advertiser-/Merchant-IDs. Awin unterscheidet beides — die fid ist
// der eigentliche, konkrete Datenfeed, eine Advertiser-ID kann mehrere Feeds
// haben (z. B. OTTO: 3 Feeds für Wohnen/Technik/Mode getrennt).
//
// fetchFullMerchantFeed() nutzt CSV-Format mit dem korrekten Download-API-Key
// (AWIN_API_TOKEN = der "60259e25..."-Key aus der Create-a-Feed-Übersicht,
// NICHT der allgemeine Publisher-API-Key).
//
// Docs: https://wiki.awin.com/index.php/Product_Feeds_API

import type { LiveProduct } from "../live-search";

export const AWIN_BASE = "https://productdata.awin.com/datafeed/download/apikey";
const TIMEOUT_MS = 8000;
const FULL_FEED_TIMEOUT_MS = 20000;

// Merchant-Feeds (echte Feed-IDs, Stand: Lookup vom 22.06.2026)
export const MERCHANT_PRIORITIES = [
  { id: "54165",  name: "OTTO DE",           weight: 10 }, // Wohnen, Spielzeug und Baumarkt
  { id: "69595",  name: "Avocadostore DE",   weight: 9  }, // Group-ID (DE)
  { id: "104979", name: "babymarkt DE",      weight: 8  }, // Preissuchmaschinen-Feed
  { id: "85863",  name: "Stapelstein DE",    weight: 8  },
  { id: "66585",  name: "MyHappyMoments DE", weight: 7  },
  { id: "101641", name: "World of Sweets",   weight: 7  },
  { id: "73219",  name: "Roastmarket DE",    weight: 7  }, // DE-Lieferung (nicht AT)
  { id: "18693",  name: "Lights4fun DE",     weight: 6  },
  { id: "106082", name: "Runnershub DE",     weight: 6  },
  { id: "106084", name: "House-of-Sneakers DE", weight: 5 }, // "für Deutschland"-Feed
  // Fackelmann DE (Advertiser 18556) und Autofull EU (Advertiser 125332):
  // KEIN aktiver Awin-Feed gefunden (Stand 22.06.2026). Erst über
  // Awin-Interface → Toolbox → Create-a-Feed einen Feed anlegen, dann hier
  // mit der neuen fid wieder ergänzen.
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

// ── CSV-Parser ────────────────────────────────────────────────────────────────
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  result.push(cur);
  return result;
}

function parseAwinCsv(text: string): AwinDatafeedProduct[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const rows: AwinDatafeedProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row as unknown as AwinDatafeedProduct);
  }

  return rows;
}

// ── Voller Katalog-Download für den Batch-Sync (CSV-Format) ─────────────────
export async function fetchFullMerchantFeed(params: {
  apiToken: string;
  merchantId: string; // = fid, NICHT die Advertiser-ID
  maxItems?: number;
}): Promise<AwinDatafeedProduct[]> {
  const { apiToken, merchantId, maxItems = 300 } = params;

  const url = new URL(
    `${AWIN_BASE}/${apiToken}/language/de/fid/${merchantId}/columns/${AWIN_COLUMNS}/format/csv/`
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FULL_FEED_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];

    const text = await res.text();
    const items = parseAwinCsv(text);
    return items.slice(0, maxItems);
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

// ── ALT: Live-Suche pro Chat-Anfrage (ungenutzt, JSON-Format) ────────────────
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
