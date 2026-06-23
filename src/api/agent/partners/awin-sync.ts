// ── Awin Katalog Batch-Sync ───────────────────────────────────────────────────
// Läuft NICHT pro Chat-Anfrage, sondern:
//  a) per wöchentlichem Cron-Trigger (siehe wrangler.json + scheduled-Handler
//     in src/api/index.ts)
//  b) manuell über POST /api/admin/awin-sync (zum Testen / sofortigen Befüllen)
//
// Lädt pro Merchant eine Zufallsstichprobe (Reservoir Sampling) und upserted
// Titel/Bild/Kategorie in die D1-Tabelle awin_products.
//
// WICHTIG: Wir nutzen db.batch() mit EINZELNEN Insert-Statements statt einer
// einzigen Mehrzeilen-INSERT-Anweisung. Letzteres hat bei 25 Zeilen x 14
// Spalten = 350 gebundene Parameter das D1-Parameter-Limit pro Statement
// überschritten ("Failed query"-Fehler). db.batch() führt mehrere kleine
// Statements in einem Netzwerk-Durchgang aus — kein Limit-Risiko.

import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { awinProducts } from "../../database/schema";
import { MERCHANT_PRIORITIES, fetchFullMerchantFeed, type AwinDatafeedProduct } from "./awin";

const MAX_PRODUCTS_PER_MERCHANT = 300;
const BATCH_SIZE = 50; // Anzahl Statements pro db.batch()-Aufruf

type Merchant = (typeof MERCHANT_PRIORITIES)[number];

function toRow(p: AwinDatafeedProduct, merchant: Merchant) {
  const approxPrice = parseFloat((p.search_price ?? "").replace(",", ".")) || null;

  return {
    id: `awin_${p.aw_product_id}`,
    awProductId: p.aw_product_id,
    title: (p.product_name || "").slice(0, 200),
    description: (p.description || "").slice(0, 300),
    imageUrl: p.merchant_image_url || "",
    category: p.category_name || "Sonstiges",
    brand: p.brand_name || null,
    merchantId: merchant.id,
    merchantName: merchant.name,
    deepLink: p.aw_deep_link || "",
    approxPrice,
    currency: p.currency || "EUR",
    inStock: p.in_stock === "1" || p.in_stock === "yes",
    lastSyncedAt: new Date().toISOString(),
  };
}

export type AwinSyncReport = {
  ok: boolean;
  reason?: string;
  merchants: Record<string, { fetched: number; upserted: number; error?: string }>;
  totalUpserted: number;
  durationMs: number;
};

export async function syncAwinCatalog(): Promise<AwinSyncReport> {
  const t0 = Date.now();
  const apiToken = (env as any).AWIN_API_TOKEN as string | undefined;

  if (!apiToken || apiToken === "YOUR_AWIN_API_TOKEN") {
    return {
      ok: false,
      reason: "Awin API token not configured",
      merchants: {},
      totalUpserted: 0,
      durationMs: Date.now() - t0,
    };
  }

  const db = drizzle(env.DB);
  const report: AwinSyncReport["merchants"] = {};
  let totalUpserted = 0;

  for (const merchant of MERCHANT_PRIORITIES) {
    try {
      const items = await fetchFullMerchantFeed({
        apiToken,
        merchantId: merchant.id,
        maxItems: MAX_PRODUCTS_PER_MERCHANT,
      });

      const rows = items
        .filter(p => p.product_name && p.aw_deep_link)
        .map(p => toRow(p, merchant));

      let upserted = 0;
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const chunk = rows.slice(i, i + BATCH_SIZE);
        if (chunk.length === 0) continue;

        const statements = chunk.map(row =>
          db
            .insert(awinProducts)
            .values(row)
            .onConflictDoUpdate({
              target: awinProducts.id,
              set: {
                title: sql`excluded.title`,
                description: sql`excluded.description`,
                imageUrl: sql`excluded.image_url`,
                category: sql`excluded.category`,
                brand: sql`excluded.brand`,
                deepLink: sql`excluded.deep_link`,
                approxPrice: sql`excluded.approx_price`,
                currency: sql`excluded.currency`,
                inStock: sql`excluded.in_stock`,
                lastSyncedAt: sql`excluded.last_synced_at`,
              },
            })
        );

        // db.batch() braucht laut Typ mindestens 1 Statement — Cast nötig,
        // da die Länge zur Build-Zeit nicht bekannt ist.
        await db.batch(statements as [typeof statements[number], ...typeof statements]);

        upserted += chunk.length;
      }

      report[merchant.name] = { fetched: items.length, upserted };
      totalUpserted += upserted;
    } catch (err: any) {
      report[merchant.name] = { fetched: 0, upserted: 0, error: err?.message ?? String(err) };
    }
  }

  return { ok: true, merchants: report, totalUpserted, durationMs: Date.now() - t0 };
}
