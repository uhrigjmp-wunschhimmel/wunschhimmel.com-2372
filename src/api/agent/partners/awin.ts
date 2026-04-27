// ── Awin Product Search API ───────────────────────────────────────────────────
// Docs: https://wiki.awin.com/index.php/Product_Search_API
// Endpoint: GET https://product-search.api.awin.com/v1/products

import type { LiveProduct } from "../live-search";

const AWIN_BASE = "https://product-search.api.awin.com/v1";
const TIMEOUT_MS = 3000;

interface AwinProduct {
  id: string;
  title: string;
  description: string;
  imgUrl: string;
  price: string;
  currency: string;
  aw_product_id: string;
  merchant_id: string;
  merchant_name: string;
  category_name: string;
  category_id: string;
  keywords: string;
  aw_deep_link: string;
  merchant_product_id: string;
  custom_1?: string;
  custom_2?: string;
  brand_name?: string;
  product_type?: string;
}

interface AwinResponse {
  products: AwinProduct[];
  paginationParameters?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

function normalizeAwinProduct(p: AwinProduct, publisherId: string): LiveProduct {
  const price = parseFloat(p.price) || null;
  // Build affiliate deep link via Awin redirect
  const affiliateUrl = p.aw_deep_link ||
    `https://www.awin1.com/cread.php?awinmid=${p.merchant_id}&awinaffid=${publisherId}&p=${encodeURIComponent(p.merchant_product_id)}`;

  return {
    id: `awin_${p.aw_product_id}`,
    title: p.title,
    description: p.description?.slice(0, 200) || "",
    imageUrl: p.imgUrl || "",
    price,
    currency: p.currency || "EUR",
    affiliateUrl,
    directProductUrl: p.aw_deep_link,
    category: p.category_name || "Sonstiges",
    tags: [p.brand_name, p.product_type].filter(Boolean) as string[],
    partnerId: "awin",
    rawSourceId: p.aw_product_id,
    merchantId: p.merchant_id,
    merchantName: p.merchant_name,
    availability: "in_stock",
    fetchedAt: new Date().toISOString(),
  };
}

export async function searchAwin(params: {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  locale?: string;
  pageSize?: number;
  publisherId: string;
  apiToken: string;
}): Promise<{ products: LiveProduct[]; error?: string; totalFound?: number }> {
  const { keywords, minPrice, maxPrice, locale = "de", pageSize = 12, publisherId, apiToken } = params;

  if (!apiToken || apiToken === "YOUR_AWIN_API_TOKEN") {
    return { products: [], error: "Awin API token not configured" };
  }

  // Build query — use top 3 most specific keywords to avoid too-broad results
  const query = keywords.slice(0, 3).join(" ");

  const url = new URL(`${AWIN_BASE}/products`);
  url.searchParams.set("publisherId", publisherId);
  url.searchParams.set("keywords", query);
  url.searchParams.set("language", locale);
  url.searchParams.set("country", "DE");
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("page", "1");
  if (minPrice != null) url.searchParams.set("minPrice", String(minPrice));
  if (maxPrice != null) url.searchParams.set("maxPrice", String(maxPrice));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { products: [], error: `Awin HTTP ${res.status}: ${errText.slice(0, 100)}` };
    }

    const data: AwinResponse = await res.json();
    const products = (data.products || []).map(p => normalizeAwinProduct(p, publisherId));

    return {
      products,
      totalFound: data.paginationParameters?.total ?? products.length,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") return { products: [], error: "Awin timeout (>3s)" };
    return { products: [], error: `Awin fetch error: ${err?.message}` };
  }
}
