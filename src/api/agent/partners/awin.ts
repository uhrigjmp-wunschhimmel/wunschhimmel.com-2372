// ── Awin Product Datafeed ─────────────────────────────────────────────────────
// WICHTIG: Die IDs unten sind ECHTE FEED-IDs (aus /admin/awin-feedlist ermittelt),
// NICHT die Advertiser-/Merchant-IDs.
//
// fetchFullMerchantFeed() nutzt RESERVOIR SAMPLING: Der komplette Feed wird
// gestreamt durchlaufen (kein Speicherproblem, da nie alles auf einmal im
// RAM liegt), aber wir behalten eine zufällige, über den GANZEN Feed verteilte
// Stichprobe von `maxItems` Produkten — nicht einfach "die ersten N".
// Das ist wichtig für Produktempfehlungen: ohne das würden wir bei jedem
// Sync exakt dieselben ersten 300 Zeilen bekommen, egal wie oft wir syncen.
//
// Bei kleinen/mittleren Feeds (die meisten unserer Merchants, <30.000
// Produkte) deckt das den GESAMTEN Katalog ab. Bei riesigen Feeds wie OTTO
// (292k) oder Avocadostore (509k) ist es eine echte Zufallsstichprobe über
// den gesamten Feed — deutlich besser als ein fixer Ausschnitt, aber das
// Lesen selbst dauert entsprechend länger (Zeitbudget unten erhöht).
//
// Docs: https://wiki.awin.com/index.php/Product_Feeds_API

import type { LiveProduct } from "../live-search";
import { isGiftworthy } from "./gift-filter";

export const AWIN_BASE = "https://productdata.awin.com/datafeed/download/apikey";
const TIMEOUT_MS = 8000;
const FULL_FEED_TIMEOUT_MS = 30000; // großzügiger, da wir bei großen Feeds länger lesen

// Merchant-Feeds (echte Feed-IDs, Stand: Lookup vom 22.06.2026)
export const MERCHANT_PRIORITIES = [
  { id: "54179",  name: "OTTO DE – Technik & Sport",    weight: 10 },
  { id: "54165",  name: "OTTO DE – Wohnen & Spielzeug",  weight: 10 },
  { id: "54183",  name: "OTTO DE – Mode & Beauty",       weight: 9  },
  { id: "104979", name: "babymarkt DE",      weight: 8  },
  // Avocadostore DE: Awin-Programm wurde gekündigt (Stand 22.06.2026) —
  // entfernt. Bereits gesyncte Produkte mit DELETE FROM awin_products
  // WHERE merchant_id = '69595'; aus D1 löschen. // Preissuchmaschinen-Feed
  { id: "85863",  name: "Stapelstein DE",    weight: 8  },
  { id: "66585",  name: "MyHappyMoments DE", weight: 7  },
  { id: "101641", name: "World of Sweets",   weight: 7  },
  { id: "73219",  name: "Roastmarket DE",    weight: 7  }, // DE-Lieferung (nicht AT)
  { id: "18693",  name: "Lights4fun DE",     weight: 6  },
  { id: "106082", name: "Runnershub DE",     weight: 6  },
  { id: "106084", name: "House-of-Sneakers DE", weight: 5 }, // "für Deutschland"-Feed
  // Fackelmann DE (Advertiser 18556) und Autofull EU (Advertiser 125332):
  // KEIN aktiver Awin-Feed gefunden (Stand 22.06.2026). Erst über
  // Awin-Interface → Toolbox → Create-a-Feed einen Feed anlegen, dann hier
  // mit der neuen fid wieder ergänzen.
];

export const AWIN_COLUMNS = [
  "aw_product_id",
  "product_name",
  "description",
  "merchant_image_url",
  "search_price",
  "currency",
  "aw_deep_link",
  "merchant_id",
  "merchant_name",
  "category_name",
  "brand_name",
  "in_stock",
].join(",");

export interface AwinDatafeedProduct {
  aw_product_id: string;
  product_name: string;
  description: string;
  merchant_image_url: string;
  search_price: string;
  currency: string;
  aw_deep_link: string;
  merchant_id: string;
  merchant_name: string;
  category_name: string;
  brand_name?: string;
  in_stock?: string;
}

function normalizeAwinProduct(p: AwinDatafeedProduct): LiveProduct {
  const price = parseFloat(p.search_price?.replace(",", ".")) || null;

  return {
    id: `awin_${p.aw_product_id}`,
    title: p.product_name || "",
    description: (p.description || "").slice(0, 200),
    imageUrl: p.merchant_image_url || "",
    price,
    currency: p.currency || "EUR",
    affiliateUrl: p.aw_deep_link || "",
    directProductUrl: p.aw_deep_link || "",
    category: p.category_name || "Sonstiges",
    tags: [p.brand_name].filter(Boolean) as string[],
    partnerId: "awin",
    rawSourceId: p.aw_product_id,
    merchantId: p.merchant_id,
    merchantName: p.merchant_name,
    availability: p.in_stock === "1" || p.in_stock === "yes" ? "in_stock" : "unknown",
    fetchedAt: new Date().toISOString(),
  };
}

// ── CSV-Zeilen-Parser (gequotete Felder mit Kommas/Anführungszeichen) ───────
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  result.push(cur);
  return result;
}

function rowFromLine(line: string, headers: string[]): AwinDatafeedProduct {
  const values = parseCsvLine(line);
  const row: Record<string, string> = {};
  headers.forEach((h, idx) => {
    row[h] = values[idx] ?? "";
  });
  return row as unknown as AwinDatafeedProduct;
}

// ── Leichtgewichtiger Teil-Parser: liest NUR bis zur gewünschten Spalte ────
// Der volle CSV-Parser (parseCsvLine) verarbeitet die komplette Zeile,
// inklusive des oft sehr langen "description"-Felds — das kostet CPU-Zeit,
// selbst wenn wir für die Vorprüfung nur den Titel brauchen. product_name
// steht als 2. Spalte VOR description, daher bricht dieser Parser ab,
// sobald das Zielfeld gelesen ist, statt die restliche Zeile mitzuverarbeiten.
function extractFieldAt(line: string, targetIndex: number): string {
  let idx = 0;
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        if (idx === targetIndex) return cur;
        idx++;
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  return idx === targetIndex ? cur : "";
}

// ── Voller Katalog-Download mit Reservoir Sampling ───────────────────────────
// Liest den kompletten Feed gestreamt durch (kein Speicherproblem), behält
// aber eine zufällige, gleichmäßig über den GESAMTEN Feed verteilte Stich-
// probe von `maxItems` Produkten — nicht einfach "die ersten N".
export async function fetchFullMerchantFeed(params: {
  apiToken: string;
  merchantId: string; // = fid, NICHT die Advertiser-ID
  maxItems?: number;
  maxScan?: number; // Sicherheitsgrenze: max. Zeilen durchsehen (CPU-Schutz bei riesigen Feeds)
}): Promise<{
  items: AwinDatafeedProduct[];
  rawScanned: number;
  eligibleSeen: number;
  rejectedNonGift: number;
}> {
  const { apiToken, merchantId, maxItems = 300, maxScan = 3000 } = params;

  const url = new URL(
    `${AWIN_BASE}/${apiToken}/language/de/fid/${merchantId}/columns/${AWIN_COLUMNS}/format/csv/`
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FULL_FEED_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok || !res.body) {
      clearTimeout(timeout);
      return { items: [], rawScanned: 0, eligibleSeen: 0, rejectedNonGift: 0 };
    }

    // Awin liefert die Datei gzip-komprimiert aus, OHNE den passenden
    // Content-Encoding-Header (sonst würde fetch() das automatisch
    // entpacken). Wir entpacken daher selbst, bevor wir als Text lesen.
    const decompressedStream = res.body.pipeThrough(new DecompressionStream("gzip"));
    const reader = decompressedStream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let headers: string[] | null = null;

    const reservoir: AwinDatafeedProduct[] = [];
    let rawScanned = 0;   // ALLE gelesenen Zeilen (für Sicherheitsgrenze maxScan)
    let eligibleSeen = 0; // nur geschenktaugliche Zeilen (für Reservoir-Sampling-Mathematik)
    let rejectedNonGift = 0;
    let productNameIdx = -1;

    readLoop: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
        buffer = buffer.slice(newlineIndex + 1);

        if (!line.trim()) continue;

        if (!headers) {
          headers = parseCsvLine(line).map(h => h.trim());
          productNameIdx = headers.indexOf("product_name");
          continue;
        }

        rawScanned++;

        // Nur den Titel leicht herausparsen (bricht VOR dem langen
        // description-Feld ab) — die teure Vollständig-Parse (rowFromLine,
        // parst auch description) passiert erst weiter unten, und zwar nur
        // für Zeilen, die tatsächlich ins Sample aufgenommen werden.
        const titleOnly = extractFieldAt(line, productNameIdx);

        // Nicht-geschenktaugliche Zeilen (Sanitär, Montage, Baumarkt, …)
        // gar nicht erst ins Sample lassen — sonst verschwendet reservoir
        // Sampling die maxItems-Quote an Artikel, die nie ein Geschenk
        // werden. Siehe gift-filter.ts.
        if (!isGiftworthy(titleOnly)) {
          rejectedNonGift++;
        } else {
          eligibleSeen++;

          if (reservoir.length < maxItems) {
            // Reservoir noch nicht voll — einfach aufnehmen (jetzt erst
            // vollständig parsen, inkl. description/Bild/Preis/etc.)
            reservoir.push(rowFromLine(line, headers));
          } else {
            // Reservoir Sampling: mit Wahrscheinlichkeit maxItems/eligibleSeen
            // einen zufälligen bestehenden Eintrag ersetzen
            const j = Math.floor(Math.random() * eligibleSeen);
            if (j < maxItems) {
              reservoir[j] = rowFromLine(line, headers);
            }
          }
        }

        // Sicherheitsgrenze: bei riesigen Feeds (z.B. OTTO mit 292k Zeilen)
        // nicht den ganzen Feed scannen — das würde den Worker an die
        // CPU-/Zeit-Grenze bringen und zu einem 503 führen.
        if (rawScanned >= maxScan) break readLoop;
      }
    }


    try {
      await reader.cancel();
    } catch {
      /* ignore */
    }

    clearTimeout(timeout);
    return { items: reservoir, rawScanned, eligibleSeen, rejectedNonGift };
  } catch {
    clearTimeout(timeout);
    return { items: [], rawScanned: 0, eligibleSeen: 0, rejectedNonGift: 0 };
  }
}

// ── ALT: Live-Suche pro Chat-Anfrage (ungenutzt, JSON-Format) ────────────────
async function searchMerchantFeed(params: {
  apiToken: string;
  merchantId: string;
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  pageSize?: number;
}): Promise<AwinDatafeedProduct[]> {
  const { apiToken, merchantId, keyword, minPrice, maxPrice, pageSize = 8 } = params;

  const url = new URL(`${AWIN_BASE}/${apiToken}/language/de/fid/${merchantId}/columns/${AWIN_COLUMNS}/format/json/`);
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("limit", String(pageSize));
  if (minPrice != null) url.searchParams.set("mPrice", String(minPrice));
  if (maxPrice != null) url.searchParams.set("xPrice", String(maxPrice));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];

    const text = await res.text();

    if (text.includes("Redirecting to legacy_system")) {
      const loc = JSON.parse(text)?.location;
      if (!loc) return [];
      const res2 = await fetch(loc, { signal: controller.signal });
      if (!res2.ok) return [];
      const data = await res2.json();
      return Array.isArray(data) ? data : [];
    }

    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

export async function searchAwin(params: {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  locale?: string;
  pageSize?: number;
  publisherId: string;
  apiToken: string;
  occasion?: string;
  recipient?: string;
}): Promise<{ products: LiveProduct[]; error?: string; totalFound?: number }> {
  const { keywords, minPrice, maxPrice, pageSize = 12, apiToken } = params;

  if (!apiToken || apiToken === "YOUR_AWIN_API_TOKEN") {
    return { products: [], error: "Awin API token not configured" };
  }

  const query = keywords.slice(0, 3).join(" ");
  const merchantsToSearch = MERCHANT_PRIORITIES.slice(0, 3);

  const results = await Promise.allSettled(
    merchantsToSearch.map(m =>
      searchMerchantFeed({
        apiToken,
        merchantId: m.id,
        keyword: query,
        minPrice,
        maxPrice,
        pageSize: Math.ceil(pageSize / merchantsToSearch.length) + 2,
      })
    )
  );

  const all: AwinDatafeedProduct[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  if (all.length === 0) {
    return { products: [], error: "Awin: keine Ergebnisse für diese Keywords" };
  }

  const products = all
    .filter(p => p.product_name && p.aw_deep_link)
    .map(normalizeAwinProduct)
    .slice(0, pageSize);

  return { products, totalFound: all.length };
}
