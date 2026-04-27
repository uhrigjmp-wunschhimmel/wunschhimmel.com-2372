// ── Amazon Product Scraper (kein API-Key nötig) ───────────────────────────────
// Scraped über Amazon.de Suchergebnisse — für Traffic-Generierung bis PA API verfügbar ist.
// Affiliate-Tag wird beim Klick/Hinzufügen injiziert (injectAmazonTag in index.ts).
//
// Strategie: Fetch Amazon-Suchergebnis-HTML → parse ASIN + Titel + Preis + Bild
// User-Agent rotieren, Retries mit Backoff, graceful fail bei Rate-Limit (503).

import type { LiveProduct } from "../live-search";

const PARTNER_TAG = "wunschhimme00-21";
const TIMEOUT_MS = 6000;

// Realistischer Browser-UA
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ── HTML Parser Helpers ───────────────────────────────────────────────────────

function extractBetween(html: string, start: string, end: string): string | null {
  const si = html.indexOf(start);
  if (si === -1) return null;
  const ei = html.indexOf(end, si + start.length);
  if (ei === -1) return null;
  return html.slice(si + start.length, ei).trim();
}

function extractAll(html: string, pattern: RegExp): string[] {
  return [...html.matchAll(pattern)].map(m => m[1] ?? m[0]);
}

interface ScrapedItem {
  asin: string;
  title: string;
  price: number | null;
  imageUrl: string;
  rating: number | null;
  reviewCount: number | null;
}

function parseSearchResults(html: string): ScrapedItem[] {
  const items: ScrapedItem[] = [];

  // Each product block: data-asin="XXXXXXXXXX" ...
  // Split by data-asin blocks
  const asinPattern = /data-asin="([A-Z0-9]{10})"/g;
  const asinMatches = [...html.matchAll(asinPattern)];

  const seen = new Set<string>();

  for (const match of asinMatches) {
    const asin = match[1];
    if (!asin || seen.has(asin)) continue;
    seen.add(asin);

    // Get block around this ASIN (next ~3000 chars)
    const blockStart = match.index ?? 0;
    const block = html.slice(blockStart, blockStart + 3000);

    // Title — various patterns Amazon uses
    let title = "";
    const titlePatterns = [
      /aria-label="([^"]{10,150})"/,
      /"a-size-medium[^"]*"[^>]*>([^<]{10,150})</,
      /"a-size-base-plus[^"]*"[^>]*>([^<]{10,150})</,
      /class="[^"]*s-title[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]{10,150})</,
    ];
    for (const p of titlePatterns) {
      const m = block.match(p);
      if (m?.[1] && !m[1].includes("data-") && m[1].length > 8) {
        title = m[1].replace(/&amp;/g, "&").replace(/&#[0-9]+;/g, "").trim();
        break;
      }
    }
    if (!title || title.length < 8) continue;

    // Price
    let price: number | null = null;
    const priceMatch = block.match(/a-price-whole">([0-9.,]+)</) ??
      block.match(/"a-offscreen">([€0-9,. ]+)</);
    if (priceMatch) {
      const raw = priceMatch[1].replace(/[€\s]/g, "").replace(",", ".");
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0 && parsed < 10000) price = parsed;
    }

    // Image
    let imageUrl = "";
    const imgMatch = block.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/) ??
      block.match(/data-src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    if (imgMatch) imageUrl = imgMatch[1];

    // Rating
    let rating: number | null = null;
    const ratingMatch = block.match(/([0-9],[0-9]) von 5 Sternen/) ??
      block.match(/([0-9]\.[0-9]) out of 5/);
    if (ratingMatch) rating = parseFloat(ratingMatch[1].replace(",", "."));

    // Review count
    let reviewCount: number | null = null;
    const reviewMatch = block.match(/([0-9,.]+) Bewertungen/) ??
      block.match(/([0-9,]+) ratings/);
    if (reviewMatch) reviewCount = parseInt(reviewMatch[1].replace(/[,\.]/g, ""));

    if (title && asin) {
      items.push({ asin, title, price, imageUrl, rating, reviewCount });
    }
  }

  return items.slice(0, 15);
}

function buildAffiliateUrl(asin: string): string {
  return `https://www.amazon.de/dp/${asin}?tag=${PARTNER_TAG}`;
}

function buildSearchUrl(asin: string): string {
  return `https://www.amazon.de/dp/${asin}`;
}

function toCategory(title: string, keywords: string[]): string {
  const t = title.toLowerCase();
  const k = keywords.join(" ").toLowerCase();
  if (t.includes("buch") || t.includes("book") || k.includes("buch")) return "Bücher";
  if (t.includes("spielzeug") || t.includes("lego") || k.includes("kind")) return "Spielzeug";
  if (t.includes("küche") || t.includes("kochen") || k.includes("küche")) return "Küche";
  if (t.includes("sport") || k.includes("sport") || k.includes("yoga")) return "Sport";
  if (t.includes("elektronik") || t.includes("bluetooth") || t.includes("kabel")) return "Elektronik";
  if (t.includes("schmuck") || t.includes("kette") || t.includes("ring")) return "Schmuck";
  if (k.includes("geburtstag") || k.includes("geschenk")) return "Geschenke";
  return "Sonstiges";
}

function normalizeScraped(item: ScrapedItem, keywords: string[]): LiveProduct {
  return {
    id: `amz_${item.asin}`,
    title: item.title,
    description: item.rating ? `★ ${item.rating.toFixed(1)} (${item.reviewCount?.toLocaleString("de") ?? "?"} Bewertungen)` : "",
    imageUrl: item.imageUrl,
    price: item.price,
    currency: "EUR",
    affiliateUrl: buildAffiliateUrl(item.asin),
    directProductUrl: buildSearchUrl(item.asin),
    category: toCategory(item.title, keywords),
    tags: item.rating && item.rating >= 4.0 ? ["top-bewertet"] : [],
    partnerId: "amazon",
    rawSourceId: item.asin,
    merchantId: "amazon",
    merchantName: "Amazon.de",
    availability: "in_stock",
    fetchedAt: new Date().toISOString(),
  };
}

export async function scrapeAmazon(params: {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  pageSize?: number;
}): Promise<{ products: LiveProduct[]; error?: string; totalFound?: number }> {
  const { keywords, minPrice, maxPrice, pageSize = 12 } = params;

  const query = keywords.slice(0, 4).join(" ");

  const url = new URL("https://www.amazon.de/s");
  url.searchParams.set("k", query);
  url.searchParams.set("language", "de_DE");
  if (minPrice != null) url.searchParams.set("rh", `p_36:${Math.round(minPrice * 100)}-${maxPrice != null ? Math.round(maxPrice * 100) : ""}`);
  else if (maxPrice != null) url.searchParams.set("rh", `p_36:-${Math.round(maxPrice * 100)}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": randomUA(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 503 || res.status === 429) {
      return { products: [], error: `Amazon rate-limited (${res.status}) — fallback aktiv` };
    }
    if (!res.ok) {
      return { products: [], error: `Amazon scrape HTTP ${res.status}` };
    }

    const html = await res.text();

    // Check for CAPTCHA / bot detection
    if (html.includes("robot check") || html.includes("captcha") || html.includes("Enter the characters")) {
      return { products: [], error: "Amazon bot-detection — fallback aktiv" };
    }

    const items = parseSearchResults(html);

    if (items.length === 0) {
      return { products: [], error: "Amazon: keine Produkte geparst (HTML-Struktur geändert?)" };
    }

    const products = items
      .slice(0, pageSize)
      .map(item => normalizeScraped(item, keywords));

    return { products, totalFound: items.length };
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") return { products: [], error: "Amazon scrape timeout (>6s)" };
    return { products: [], error: `Amazon scrape error: ${err?.message}` };
  }
}
