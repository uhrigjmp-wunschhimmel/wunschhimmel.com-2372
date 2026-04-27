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

// Kategorie → passendes Bild (kostenlos, stabil)
const CATEGORY_IMAGES: Record<string, string> = {
  spielzeug: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80",
  buch: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
  sport: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
  küche: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  elektronik: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80",
  schmuck: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&q=80",
  mode: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
  garten: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
  geschenk: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80",
  kind: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
  musik: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80",
  kunst: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80",
  reise: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80",
  wellness: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
  default: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80",
};

function getCategoryImage(keywords: string[], category: string): string {
  const all = [...keywords, category].join(" ").toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (all.includes(key)) return url;
  }
  return CATEGORY_IMAGES.default;
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
