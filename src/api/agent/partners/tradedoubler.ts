// ── Tradedoubler Product Search API ──────────────────────────────────────────
// Docs: https://dev.tradedoubler.com/products/publisher/
// Endpoint: GET https://api.tradedoubler.com/1.0/products.json[;q=...;fid=...;...]?token=TOKEN
//
// Setup nach Account-Erstellung:
// 1. Login → Account → Manage tokens → System: "PRODUCTS" → Token kopieren
// 2. Programmes joinen (OTTO, Zalando, etc.) → FID der jeweiligen Feeds notieren
// 3. TRADEDOUBLER_TOKEN + TRADEDOUBLER_FIDS als Wrangler Secrets setzen

import type { LiveProduct } from "../live-search";

const TD_BASE = "https://api.tradedoubler.com/1.0/products.json";
const TIMEOUT_MS = 6000;

interface TDProduct {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: {
    value: number;
    currency: string;
  };
  offer?: {
    uri: string;         // affiliate tracking link
    price?: {
      value: number;
      currency: string;
    };
  };
  fields?: {
    brand?: string;
    availability?: string;
    category?: string;
    imageUrl?: string;
  };
  programId?: string;
  programName?: string;
  categorization?: {
    tdCategory?: { name: string };
  };
}

interface TDResponse {
  items?: TDProduct[];
  totalNumberOfItems?: number;
}

function normalizeTDProduct(p: TDProduct): LiveProduct {
  const price = p.offer?.price?.value ?? p.price?.value ?? null;
  const currency = p.offer?.price?.currency ?? p.price?.currency ?? "EUR";
  const image = p.imageUrl ?? p.fields?.imageUrl ?? "";
  const affiliateUrl = p.offer?.uri ?? "";
  const category = p.categorization?.tdCategory?.name ?? p.fields?.category ?? "Sonstiges";

  return {
    id: `td_${p.id}`,
    title: p.title ?? "",
    description: (p.description ?? "").replace(/<[^>]+>/g, "").slice(0, 200),
    imageUrl: image,
    price,
    currency,
    affiliateUrl,
    directProductUrl: affiliateUrl,
    category,
    tags: [p.fields?.brand].filter(Boolean) as string[],
    partnerId: "tradedoubler",
    rawSourceId: p.id,
    merchantId: p.programId ?? "",
    merchantName: p.programName ?? "",
    availability: p.fields?.availability === "in stock" ? "in_stock" : "unknown",
    fetchedAt: new Date().toISOString(),
  };
}

export async function searchTradedoubler(params: {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  locale?: string;
  pageSize?: number;
  token: string;
  feedIds: string[];   // kommagetrennte Feed-IDs deiner joined programmes
}): Promise<{ products: LiveProduct[]; error?: string; totalFound?: number }> {
  const { keywords, minPrice, maxPrice, pageSize = 12, token, feedIds } = params;

  if (!token || token === "YOUR_TRADEDOUBLER_TOKEN") {
    return { products: [], error: "Tradedoubler token not configured" };
  }
  if (!feedIds || feedIds.length === 0) {
    return { products: [], error: "Tradedoubler: keine Feed-IDs konfiguriert" };
  }

  const query = keywords.slice(0, 4).join(" ");

  // Matrix-Syntax: Semikolon-getrennte Parameter im Pfad
  // Pflichtfeld: fid (Feed ID) — mehrere mit Semikolon
  const fidParams = feedIds.map(id => `;fid=${id}`).join("");
  const path = [
    `;q=${encodeURIComponent(query)}`,
    fidParams,
    `;pageSize=${pageSize}`,
    `;language=de`,
    `;currency=EUR`,
    minPrice != null ? `;minPrice=${minPrice}` : "",
    maxPrice != null ? `;maxPrice=${maxPrice}` : "",
    `;availability=in+stock`,
  ].join("");

  const url = `${TD_BASE}${path}?token=${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { products: [], error: `Tradedoubler HTTP ${res.status}: ${text.slice(0, 100)}` };
    }

    const data: TDResponse = await res.json();
    const items = data.items ?? [];

    if (items.length === 0) {
      return { products: [], error: "Tradedoubler: keine Produkte gefunden" };
    }

    const products = items
      .filter(p => p.offer?.uri && p.title)
      .map(normalizeTDProduct)
      .slice(0, pageSize);

    return { products, totalFound: data.totalNumberOfItems ?? products.length };
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") return { products: [], error: "Tradedoubler timeout (>6s)" };
    return { products: [], error: `Tradedoubler error: ${err?.message}` };
  }
}
