// ── Awin Katalog Batch-Sync ───────────────────────────────────────────────────
// Läuft NICHT pro Chat-Anfrage, sondern:
//  a) per wöchentlichem Cron-Trigger (siehe wrangler.json + scheduled-Handler
//     in src/api/index.ts)
//  b) manuell über POST /api/admin/awin-sync (zum Testen / sofortigen Befüllen)
//
// Lädt pro Merchant den vollen Feed (gedeckelt auf MAX_PRODUCTS_PER_MERCHANT),
// und upserted Titel/Bild/Kategorie in die D1-Tabelle awin_products.
// Preise werden NUR als grobe Näherung (approxPrice) gespeichert — niemals als
// verbindlicher, beim Nutzer angezeigter Preis. Der echte Preis steht immer
// erst beim Klick auf den deepLink beim Händler.

import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { awinProducts } from "../../database/schema";
import { MERCHANT_PRIORITIES, fetchFullMerchantFeed, type AwinDatafeedProduct } from "./awin";

const MAX_PRODUCTS_PER_MERCHANT = 300;
const D1_BATCH_SIZE = 25; // konservativ wegen D1-Limit an gebundenen Parametern pro Statement

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
      for (let i = 0; i < rows.length; i += D1_BATCH_SIZE) {
        const chunk = rows.slice(i, i + D1_BATCH_SIZE);
        if (chunk.length === 0) continue;

        await db
          .insert(awinProducts)
          .values(chunk)
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
          });

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
