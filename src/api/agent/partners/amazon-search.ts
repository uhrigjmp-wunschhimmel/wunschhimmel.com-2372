// ── Amazon Search-Link Generator ─────────────────────────────────────────────
// Kein API-Key nötig. Generiert Produktkarten mit Amazon-Suchlinks + Affiliate-Tag.
// Der User landet direkt auf der Amazon-Suchergebnisseite für das gesuchte Produkt.
// Sobald PA API verfügbar: durch echte Produktdaten ersetzen.
//
// Produkt-Bild: Wir nutzen das "Amazon search" Schema — kein direktes Bild,
// stattdessen eine generische Kategorie-Illustration oder leer lassen
// (Frontend zeigt dann einen Platzhalter).

import type { LiveProduct } from "../live-search";

const PARTNER_TAG = "wunschhimme00-21";

// Kein Kategorie-Bild mehr — Frontend rendert Amazon-Suchkarte mit eigenem Design
// imageUrl leer lassen → ProductCard erkennt "auf-amazon-suchen" Tag und zeigt Amazon-Branding
function getCategoryImage(_keywords: string[], _category: string): string {
  return ""; // Absichtlich leer — Frontend rendert Amazon-spezifisches Layout
}

function buildSearchUrl(query: string, minPrice?: number, maxPrice?: number): string {
  const url = new URL("https://www.amazon.de/s");
  url.searchParams.set("k", query);
  url.searchParams.set("tag", PARTNER_TAG);
  url.searchParams.set("language", "de_DE");
  if (minPrice != null || maxPrice != null) {
    const lo = minPrice != null ? Math.round(minPrice * 100) : "";
    const hi = maxPrice != null ? Math.round(maxPrice * 100) : "";
    url.searchParams.set("rh", `p_36:${lo}-${hi}`);
  }
  return url.toString();
}

// Produktvarianten basierend auf Keywords erzeugen
// Jede "Card" = ein spezifischer Suchbegriff-Cluster
function buildSearchQueries(params: {
  keywords: string[];
  occasion?: string;
  recipient?: string;
  ageGroup?: string;
  minPrice?: number;
  maxPrice?: number;
  count?: number;
}): Array<{ query: string; label: string; category: string; priceHint: string }> {
  const { keywords, occasion, recipient, ageGroup, count = 6 } = params;

  const base = keywords.slice(0, 3).join(" ");
  const occasionStr = occasion ? ` ${occasion}` : "";
  const recipientStr = recipient ? ` für ${recipient}` : "";
  const ageStr = ageGroup ? ` ${ageGroup}` : "";

  // Verschiedene Suchwinkel für mehr Vielfalt
  const variants: Array<{ query: string; label: string; category: string }> = [];

  if (keywords.length > 0) {
    variants.push({
      query: `${base}${occasionStr} Geschenk${recipientStr}`,
      label: `${base} Geschenk${ageStr}`,
      category: detectCategory(keywords),
    });
    variants.push({
      query: `${keywords[0]} Set Geschenkset${occasionStr}`,
      label: `${keywords[0]} Geschenkset`,
      category: detectCategory(keywords),
    });
    if (keywords.length >= 2) {
      variants.push({
        query: `${keywords[1]}${recipientStr}${occasionStr}`,
        label: `${keywords[1]}${ageStr ? ` (${ageStr})` : ""}`,
        category: detectCategory([keywords[1]]),
      });
    }
    variants.push({
      query: `${base} personalisiert${occasionStr}`,
      label: `Personalisiertes ${keywords[0]}`,
      category: detectCategory(keywords),
    });
    variants.push({
      query: `${base} premium${recipientStr}`,
      label: `${keywords[0]} Premium`,
      category: detectCategory(keywords),
    });
    variants.push({
      query: `Geschenkbox ${base}${occasionStr}`,
      label: `Geschenkbox ${keywords[0]}`,
      category: "geschenk",
    });
  }

  // Fallback: generische Suchbegriffe
  if (variants.length < count) {
    const generic = ["Geschenkset", "Überraschungsgeschenk", "Gutschein", "Buch Geschenk"];
    for (const g of generic) {
      if (variants.length >= count) break;
      variants.push({ query: `${g}${recipientStr}${occasionStr}`, label: g, category: "geschenk" });
    }
  }

  return variants.slice(0, count);
}

function detectCategory(keywords: string[]): string {
  const k = keywords.join(" ").toLowerCase();
  if (k.match(/lego|spielzeug|kind|spiel|puzzle/)) return "spielzeug";
  if (k.match(/buch|lesen|roman|krimi/)) return "buch";
  if (k.match(/sport|yoga|fitness|lauf/)) return "sport";
  if (k.match(/küche|kochen|backen|rezept/)) return "küche";
  if (k.match(/musik|gitarre|kopfhörer|bluetooth/)) return "musik";
  if (k.match(/schmuck|kette|ring|armband/)) return "schmuck";
  if (k.match(/garten|pflanze|blume/)) return "garten";
  if (k.match(/wellness|spa|duft|kerze/)) return "wellness";
  if (k.match(/elektronik|technik|gadget/)) return "elektronik";
  if (k.match(/kunst|malen|basteln/)) return "kunst";
  return "geschenk";
}

function priceLabel(min?: number, max?: number): string {
  if (max && min) return `${min}–${max} €`;
  if (max) return `bis ${max} €`;
  if (min) return `ab ${min} €`;
  return "";
}

export function generateAmazonSearchCards(params: {
  keywords: string[];
  occasion?: string;
  recipient?: string;
  ageGroup?: string;
  minPrice?: number;
  maxPrice?: number;
  pageSize?: number;
}): { products: LiveProduct[]; error?: string; totalFound?: number } {
  const { keywords, minPrice, maxPrice, pageSize = 6 } = params;

  if (!keywords || keywords.length === 0) {
    return { products: [], error: "no keywords" };
  }

  const queries = buildSearchQueries({ ...params, count: pageSize });
  const priceHint = priceLabel(minPrice, maxPrice);

  const products: LiveProduct[] = queries.map((q, i) => {
    const imageUrl = getCategoryImage([...keywords, q.category], q.category);
    const searchUrl = buildSearchUrl(q.query, minPrice, maxPrice);

    return {
      id: `amz_search_${i}_${Buffer.from(q.query).toString("base64").slice(0, 8)}`,
      title: q.label,
      description: `Auf Amazon suchen${priceHint ? ` · ${priceHint}` : ""}`,
      imageUrl,
      price: null, // Kein fixer Preis — Preisbereich auf Amazon
      currency: "EUR",
      affiliateUrl: searchUrl,
      directProductUrl: searchUrl,
      category: q.category,
      tags: ["amazon", "auf-amazon-suchen"],
      partnerId: "amazon",
      rawSourceId: `search_${i}`,
      merchantId: "amazon",
      merchantName: "Amazon.de",
      availability: "in_stock",
      fetchedAt: new Date().toISOString(),
    };
  });

  return { products, totalFound: products.length };
}
