// ── Amazon Product Advertising API 5.0 ───────────────────────────────────────
// Docs: https://webservices.amazon.de/paapi5/documentation/
// Requires: Access Key, Secret Key, Partner Tag (affiliate tag)
//
// HOW TO GET ACCESS:
// 1. Go to https://affiliate-program.amazon.de/
// 2. Sign in with your Amazon account
// 3. Apply for the affiliate program (Partnerprogramm)
// 4. Once approved: https://affiliate-program.amazon.de/assoc_credentials/home
// 5. Create API credentials there (Access Key + Secret Key)
// Your Partner Tag is already: wunschhimme00-21

import type { LiveProduct } from "../live-search";

const PAAPI_HOST = "webservices.amazon.de";
const PAAPI_REGION = "eu-west-1";
const TIMEOUT_MS = 3000;

// AWS Signature V4 for PA API
async function sign(params: {
  method: string;
  host: string;
  path: string;
  payload: string;
  accessKey: string;
  secretKey: string;
  region: string;
  service: string;
}): Promise<Record<string, string>> {
  const { method, host, path, payload, accessKey, secretKey, region, service } = params;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  // Hash payload
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(payload));
  const payloadHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems\n`;
  const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";
  const canonicalRequest = `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const hashCR = await crypto.subtle.digest("SHA-256", enc.encode(canonicalRequest));
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${Array.from(new Uint8Array(hashCR)).map(b => b.toString(16).padStart(2, "0")).join("")}`;

  async function hmac(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
    const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return crypto.subtle.sign("HMAC", k, enc.encode(data));
  }

  const kDate = await hmac(enc.encode("AWS4" + secretKey), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const signature = Array.from(new Uint8Array(await hmac(kSigning, stringToSign))).map(b => b.toString(16).padStart(2, "0")).join("");

  return {
    "content-encoding": "amz-1.0",
    "content-type": "application/json; charset=utf-8",
    "host": host,
    "x-amz-date": amzDate,
    "x-amz-target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    "authorization": `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

interface PAAPIItem {
  ASIN: string;
  DetailPageURL: string;
  ItemInfo?: {
    Title?: { DisplayValue: string };
    ByLineInfo?: { Brand?: { DisplayValue: string } };
    Classifications?: { ProductGroup?: { DisplayValue: string } };
    Features?: { DisplayValues: string[] };
  };
  Images?: {
    Primary?: { Large?: { URL: string } };
  };
  Offers?: {
    Listings?: Array<{
      Price?: { Amount: number; Currency: string };
      Availability?: { Message: string };
    }>;
  };
  BrowseNodeInfo?: {
    BrowseNodes?: Array<{ DisplayName: string }>;
  };
}

function normalizePAProduct(item: PAAPIItem, partnerTag: string): LiveProduct {
  const listing = item.Offers?.Listings?.[0];
  const price = listing?.Price?.Amount ?? null;
  const currency = listing?.Price?.Currency ?? "EUR";
  const title = item.ItemInfo?.Title?.DisplayValue ?? "";
  const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue;
  const features = item.ItemInfo?.Features?.DisplayValues?.slice(0, 2).join(". ") ?? "";
  const category = item.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName ??
    item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue ?? "Sonstiges";
  const imageUrl = item.Images?.Primary?.Large?.URL ?? "";
  const affiliateUrl = `https://www.amazon.de/dp/${item.ASIN}?tag=${partnerTag}`;

  return {
    id: `amz_${item.ASIN}`,
    title,
    description: features,
    imageUrl,
    price,
    currency,
    affiliateUrl,
    directProductUrl: item.DetailPageURL,
    category,
    tags: brand ? [brand] : [],
    partnerId: "amazon",
    rawSourceId: item.ASIN,
    merchantId: "amazon",
    merchantName: "Amazon.de",
    availability: listing?.Availability?.Message ?? "unknown",
    fetchedAt: new Date().toISOString(),
  };
}

export async function searchAmazon(params: {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  pageSize?: number;
  accessKey: string;
  secretKey: string;
  partnerTag: string;
}): Promise<{ products: LiveProduct[]; error?: string; totalFound?: number }> {
  const { keywords, minPrice, maxPrice, pageSize = 10, accessKey, secretKey, partnerTag } = params;

  if (!accessKey || accessKey === "YOUR_AMAZON_ACCESS_KEY") {
    return { products: [], error: "Amazon PA API not configured — see src/api/agent/partners/amazon.ts for setup instructions" };
  }

  const query = keywords.slice(0, 3).join(" ");
  const payload = JSON.stringify({
    Keywords: query,
    Resources: [
      "Images.Primary.Large",
      "ItemInfo.Title",
      "ItemInfo.ByLineInfo",
      "ItemInfo.Features",
      "ItemInfo.Classifications",
      "Offers.Listings.Price",
      "Offers.Listings.Availability.Message",
      "BrowseNodeInfo.BrowseNodes",
    ],
    SearchIndex: "All",
    ItemCount: pageSize,
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.de",
    ...(minPrice != null || maxPrice != null ? {
      MinPrice: minPrice != null ? Math.round(minPrice * 100) : undefined,
      MaxPrice: maxPrice != null ? Math.round(maxPrice * 100) : undefined,
    } : {}),
  });

  try {
    const path = "/paapi5/searchitems";
    const headers = await sign({
      method: "POST", host: PAAPI_HOST, path, payload,
      accessKey, secretKey, region: PAAPI_REGION, service: "ProductAdvertisingAPI",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`https://${PAAPI_HOST}${path}`, {
      method: "POST",
      headers,
      body: payload,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { products: [], error: `Amazon PA API HTTP ${res.status}: ${errText.slice(0, 150)}` };
    }

    const data = await res.json();
    const items: PAAPIItem[] = data.SearchResult?.Items ?? [];
    const products = items.map(i => normalizePAProduct(i, partnerTag));

    return {
      products,
      totalFound: data.SearchResult?.TotalResultCount ?? products.length,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") return { products: [], error: "Amazon timeout (>3s)" };
    return { products: [], error: `Amazon fetch error: ${err?.message}` };
  }
}
