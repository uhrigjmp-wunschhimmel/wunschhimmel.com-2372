import { tool } from "ai";
import z from "zod";
import fallbackProducts from "./products-fallback.json";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  imageUrl: string;
  affiliateUrl: string;
  category: string;
  tags: string[];
  relevance: string[];
};

// ── Amazon Product Advertising API search (simplified via scrape fallback) ──
async function searchAmazon(keywords: string, maxPrice?: number): Promise<Product[]> {
  // Amazon PA API requires approved access — use affiliate search URL as fallback
  // In production: replace with real Amazon PA API calls
  return [];
}

// ── Awin product feed search ─────────────────────────────────────────────────
async function searchAwin(keywords: string, maxPrice?: number): Promise<Product[]> {
  // Awin feed requires publisher approval & feed URLs
  // In production: fetch from Awin product feeds API
  return [];
}

// ── Keyword expansion map ─────────────────────────────────────────────────────
const KEYWORD_MAP: Record<string, string[]> = {
  "allgemein": ["wellness", "deko", "kreativ", "bücher", "mode"],
  "freundin": ["wellness", "beauty", "kreativ", "mode"],
  "freund": ["technik", "sport", "spiele", "kreativ"],
  "partnerin": ["wellness", "beauty", "romantisch", "deko"],
  "partner": ["technik", "sport", "kreativ", "spiele"],
  "kind": ["kinder", "spielzeug", "sport"],
  "baby": ["kinder", "baby", "weihnachten"],
  "mama": ["wellness", "beauty", "deko", "bücher"],
  "papa": ["technik", "sport", "bücher", "food"],
  "oma": ["bücher", "deko", "wellness", "tee"],
  "opa": ["bücher", "technik", "spiele"],
  "kollegin": ["bücher", "tee", "deko", "wellness"],
  "kollege": ["bücher", "technik", "kaffee"],
  "geburtstag": ["wellness", "kreativ", "bücher", "deko"],
  "weihnachten": ["deko", "bücher", "spiele", "wellness"],
  "valentinstag": ["romantisch", "wellness", "deko"],
  "jahrestag": ["romantisch", "personalisiert", "deko"],
  "hochzeit": ["deko", "personalisiert", "wellness"],
  "babyshower": ["kinder", "baby", "wellness"],
};

function expandKeywords(keywords: string[]): string[] {
  const expanded = new Set<string>();
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    expanded.add(k);
    const mapped = KEYWORD_MAP[k];
    if (mapped) mapped.forEach(m => expanded.add(m));
  }
  return Array.from(expanded);
}

// ── Local fallback with keyword matching ─────────────────────────────────────
function searchFallback(keywords: string[], maxPrice?: number, minPrice?: number, excludeIds: string[] = []): Product[] {
  const kw = expandKeywords(keywords);
  const products = fallbackProducts as Product[];
  
  // Score each product by how many keywords match
  const scored = products
    .filter(p => !excludeIds.includes(p.id))
    .map(p => {
      const matchCount = kw.filter(k =>
        p.relevance.some(r => r.toLowerCase().includes(k) || k.includes(r.toLowerCase())) ||
        p.title.toLowerCase().includes(k) ||
        p.category.toLowerCase().includes(k) ||
        p.tags.some(t => t.toLowerCase().includes(k))
      ).length;
      const matchesPrice = (!maxPrice || (p.price ?? 0) <= maxPrice) &&
                           (!minPrice || (p.price ?? 0) >= minPrice);
      return { p, score: matchesPrice ? matchCount : -1 };
    })
    .filter(x => x.score >= 0)
    .sort((a, b) => b.score - a.score || Math.random() - 0.5);

  // If we have scored matches, return top 6; otherwise return random price-filtered
  const matches = scored.filter(x => x.score > 0);
  if (matches.length >= 3) return matches.slice(0, 6).map(x => x.p);
  
  // Fallback: any price-matching product
  return scored.slice(0, 6).map(x => x.p);
}

// ── Main search tool ─────────────────────────────────────────────────────────
export const searchProducts = tool({
  description: "Suche nach Geschenkideen basierend auf Filtern. Gibt bis zu 6 passende Produkte zurück.",
  inputSchema: z.object({
    keywords: z.array(z.string()).describe("Suchbegriffe z.B. ['yoga', 'nachhaltig', 'frau']"),
    minPrice: z.number().optional().describe("Mindestpreis in EUR"),
    maxPrice: z.number().optional().describe("Maximalpreis in EUR"),
    occasion: z.string().optional().describe("Anlass z.B. Geburtstag, Weihnachten"),
    recipient: z.string().optional().describe("Empfänger z.B. Freundin, Kind, Kollege"),
    excludeIds: z.array(z.string()).optional().describe("Produkt-IDs die NICHT zurückgegeben werden sollen (bereits gezeigte Produkte)"),
  }),
  async execute({ keywords, minPrice, maxPrice, excludeIds = [] }) {
    // Try live APIs first, fall back to local data
    const [amazonResults, awinResults] = await Promise.allSettled([
      searchAmazon(keywords.join(" "), maxPrice),
      searchAwin(keywords.join(" "), maxPrice),
    ]);

    const live = [
      ...(amazonResults.status === "fulfilled" ? amazonResults.value : []),
      ...(awinResults.status === "fulfilled" ? awinResults.value : []),
    ];

    const results = live.length >= 3
      ? live.filter(p => !excludeIds.includes(p.id)).slice(0, 6)
      : searchFallback(keywords, maxPrice, minPrice, excludeIds);

    return results.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      currency: p.currency,
      imageUrl: p.imageUrl,
      affiliateUrl: p.affiliateUrl,
      category: p.category,
      tags: p.tags,
    }));
  },
});

export type SearchProductsResult = ReturnType<typeof searchProducts.execute> extends Promise<infer T> ? T : never;
