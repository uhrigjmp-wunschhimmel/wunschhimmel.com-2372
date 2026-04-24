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

// ── Local fallback with keyword matching ─────────────────────────────────────
function searchFallback(keywords: string[], maxPrice?: number, minPrice?: number): Product[] {
  const kw = keywords.map(k => k.toLowerCase());
  return (fallbackProducts as Product[])
    .filter(p => {
      const matchesKeyword = kw.some(k =>
        p.relevance.some(r => r.includes(k) || k.includes(r)) ||
        p.title.toLowerCase().includes(k) ||
        p.category.toLowerCase().includes(k) ||
        p.tags.some(t => t.toLowerCase().includes(k))
      );
      const matchesPrice = (!maxPrice || (p.price ?? 0) <= maxPrice) &&
                           (!minPrice || (p.price ?? 0) >= minPrice);
      return matchesKeyword && matchesPrice;
    })
    .sort(() => Math.random() - 0.5) // shuffle for variety
    .slice(0, 6);
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
  }),
  async execute({ keywords, minPrice, maxPrice }) {
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
      ? live.slice(0, 6)
      : searchFallback(keywords, maxPrice, minPrice);

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
