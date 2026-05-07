import { tool } from "ai";
import z from "zod";
import { env } from "cloudflare:workers";
import { liveSearch } from "./live-search";

// ── Main search tool ──────────────────────────────────────────────────────────
export const searchProducts = tool({
  description: "Suche nach Geschenkideen basierend auf Filtern. Ruft Awin, Amazon und weitere Quellen parallel ab. Gibt bis zu 6 passende Produkte zurück.",
  inputSchema: z.object({
    keywords: z.array(z.string()).describe("Suchbegriffe z.B. ['yoga', 'nachhaltig', 'frau']"),
    minPrice: z.number().optional().describe("Mindestpreis in EUR"),
    maxPrice: z.number().optional().describe("Maximalpreis in EUR"),
    occasion: z.string().optional().describe("Anlass z.B. 'Geburtstag', 'Einschulung'"),
    recipient: z.string().optional().describe("Empfänger z.B. 'Freundin', 'Kind', 'Kollege'"),
    ageGroup: z.string().optional().describe("Altersgruppe z.B. '6-9 Jahre' — nur bei Kind relevant"),
    excludeIds: z.array(z.string()).optional().describe("Produkt-IDs die NICHT zurückgegeben werden sollen"),
  }),
  async execute({ keywords, minPrice, maxPrice, occasion, recipient, ageGroup, excludeIds = [] }) {
    const { results, meta } = await liveSearch({
      keywords,
      minPrice,
      maxPrice,
      occasion,
      recipient,
      ageGroup,
      excludeIds,
      limit: 6,
      locale: "de",
      // Injected from Cloudflare Workers env
      // Tradedoubler — primäre Live-Quelle (echte Such-API, live Preise)
      tdToken: (env as any).TRADEDOUBLER_TOKEN,
      tdFeedIds: (env as any).TRADEDOUBLER_FEED_IDS
        ? ((env as any).TRADEDOUBLER_FEED_IDS as string).split(",").map((s: string) => s.trim())
        : [],
      // Awin — Fallback (Feed-API instabil)
      awinToken: (env as any).AWIN_API_TOKEN,
      awinPublisherId: (env as any).AWIN_PUBLISHER_ID ?? "2864125",
    });

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
      partnerId: p.partnerId,
      // Debug meta on the last item (stripped before display)
      _meta: meta,
    }));
  },
});

export type SearchProductsResult = ReturnType<typeof searchProducts.execute> extends Promise<infer T> ? T : never;
