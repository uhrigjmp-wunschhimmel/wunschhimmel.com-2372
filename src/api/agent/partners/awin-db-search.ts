// ── Awin Katalog-Suche (gegen die D1-Tabelle, NICHT live gegen Awin) ─────────
// Diese Funktion ersetzt die alte searchAwin()-Live-Suche in live-search.ts.
// Sie fragt nur die lokal gesyncte Tabelle awin_products ab — schnell,
// kein Netzwerk-Call pro Chat-Nachricht, keine Feed-Instabilität.
//
// approxPrice wird nur zur groben Vorfilterung genutzt, niemals als
// verbindlicher Preis dargestellt (siehe schema.ts-Kommentar).

import { drizzle } from "drizzle-orm/d1";
import { and, gte, like, lte, or } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { awinProducts } from "../../database/schema";
import type { LiveProduct } from "../live-search";

function toLiveProduct(row: typeof awinProducts.$inferSelect): LiveProduct {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    imageUrl: row.imageUrl ?? "",
    price: row.approxPrice,
    currency: row.currency ?? "EUR",
    affiliateUrl: row.deepLink,
    directProductUrl: row.deepLink,
    category: row.category ?? "Sonstiges",
    tags: row.brand ? [row.brand] : [],
    partnerId: "awin",
    rawSourceId: row.awProductId,
    merchantId: row.merchantId,
    merchantName: row.merchantName ?? undefined,
    availability: row.inStock ? "in_stock" : "unknown",
    fetchedAt: row.lastSyncedAt,
  };
}

export async function searchAwinCatalog(params: {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  pageSize?: number;
}): Promise<{ products: LiveProduct[]; error?: string; totalFound?: number }> {
  const { keywords, minPrice, maxPrice, pageSize = 8 } = params;

  if (!keywords || keywords.length === 0) {
    return { products: [], error: "no keywords" };
  }

  const db = drizzle(env.DB);

  const kwConditions = keywords.slice(0, 5).map(k =>
    or(
      like(awinProducts.title, `%${k}%`),
      like(awinProducts.category, `%${k}%`),
      like(awinProducts.brand, `%${k}%`),
      like(awinProducts.description, `%${k}%`)
    )
  );

  const priceConditions = [];
  if (minPrice != null) priceConditions.push(gte(awinProducts.approxPrice, minPrice));
  if (maxPrice != null) priceConditions.push(lte(awinProducts.approxPrice, maxPrice));

  try {
    const rows = await db
      .select()
      .from(awinProducts)
      .where(and(or(...kwConditions), ...priceConditions))
      .limit(pageSize * 3); // großzügiger laden, dann nach Relevanz sortieren

    if (rows.length === 0) {
      return { products: [], error: "Awin-Katalog: keine Treffer für diese Keywords" };
    }

    const scored = rows
      .map(r => {
        const t = r.title.toLowerCase();
        const score = keywords.filter(k => t.includes(k.toLowerCase())).length;
        return { r, score };
      })
      .sort((a, b) => b.score - a.score);

    const products = scored.slice(0, pageSize).map(x => toLiveProduct(x.r));
    return { products, totalFound: rows.length };
  } catch (err: any) {
    return { products: [], error: `Awin-DB-Suche Fehler: ${err?.message}` };
  }
}
