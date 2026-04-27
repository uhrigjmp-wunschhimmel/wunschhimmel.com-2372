// ── Live Product Search Aggregator ───────────────────────────────────────────
// Parallel fetches from all partners → merge → score → dedupe → relax if needed

import { searchAwin } from "./partners/awin";
import { generateAmazonSearchCards } from "./partners/amazon-search";
import { expandKeywords, buildSearchTerms } from "./keyword-map";
import fallbackProducts from "./products-fallback.json";

export type LiveProduct = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number | null;
  currency: string;
  affiliateUrl: string;
  directProductUrl?: string;
  category: string;
  tags: string[];
  partnerId: string;         // "awin" | "amazon" | "fallback"
  rawSourceId: string;       // ASIN, Awin product ID, etc.
  merchantId?: string;
  merchantName?: string;
  availability?: string;
  fetchedAt: string;
  // Scoring (internal, not exposed to frontend)
  _score?: number;
};

export type SearchMeta = {
  partnersResponded: string[];
  partnerErrors: Record<string, string>;
  relaxationStepsUsed: string[];
  excludedIds: string[];
  queryKeywords: string[];
  totalFoundByPartner: Record<string, number>;
  durationMs: number;
  source: "live" | "fallback" | "mixed";
};

export type SearchParams = {
  keywords: string[];
  occasion?: string;
  recipient?: string;
  ageGroup?: string;
  minPrice?: number;
  maxPrice?: number;
  excludeIds?: string[];
  limit?: number;
  locale?: string;
  // Injected from env
  awinToken?: string;
  awinPublisherId?: string;
  // Amazon läuft jetzt per Scraper — keine Keys nötig
};

// ── Scoring ──────────────────────────────────────────────────────────────────
function scoreProduct(product: LiveProduct, keywords: string[]): number {
  const kw = keywords.map(k => k.toLowerCase());
  const titleLower = product.title.toLowerCase();
  const descLower = product.description.toLowerCase();
  const catLower = product.category.toLowerCase();
  const tagsLower = product.tags.map(t => t.toLowerCase());

  let score = 0;

  // Keyword match (40%)
  const kwMatches = kw.filter(k =>
    titleLower.includes(k) || descLower.includes(k) ||
    catLower.includes(k) || tagsLower.some(t => t.includes(k))
  ).length;
  score += (kwMatches / Math.max(kw.length, 1)) * 40;

  // Has image (quality signal)
  if (product.imageUrl && product.imageUrl.startsWith("http")) score += 10;

  // Has price (better than "Preis beim Händler")
  if (product.price != null && product.price > 0) score += 10;

  // Partner preference: live > fallback
  if (product.partnerId === "awin") score += 15;
  else if (product.partnerId === "amazon") score += 12;
  else score += 5; // fallback

  // Availability bonus
  if (product.availability === "in_stock") score += 5;

  return score;
}

// ── Dedupe by normalized title ────────────────────────────────────────────────
function normTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-zäöüß0-9]/g, "").slice(0, 30);
}

function dedupe(products: LiveProduct[]): LiveProduct[] {
  const seen = new Set<string>();
  return products.filter(p => {
    const key = `${p.partnerId === "amazon" ? p.rawSourceId : normTitle(p.title)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Fallback search ───────────────────────────────────────────────────────────
type FallbackProduct = {
  id: string; title: string; description: string; price: number | null;
  currency: string; imageUrl: string; affiliateUrl: string;
  category: string; tags: string[]; relevance: string[];
};

function searchFallback(keywords: string[], maxPrice?: number, minPrice?: number, excludeIds: string[] = []): LiveProduct[] {
  const kw = expandKeywords(keywords);
  const products = fallbackProducts as FallbackProduct[];

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

  const matches = scored.filter(x => x.score > 0);
  const source = matches.length >= 3 ? matches : scored;

  // If still not enough with excludes+price, relax
  if (source.length < 3 && (excludeIds.length > 0 || maxPrice)) {
    return searchFallback(keywords, maxPrice ? maxPrice * 1.3 : undefined, minPrice, []);
  }

  return source.slice(0, 12).map(x => ({
    id: x.p.id,
    title: x.p.title,
    description: x.p.description,
    imageUrl: x.p.imageUrl,
    price: x.p.price,
    currency: x.p.currency,
    affiliateUrl: x.p.affiliateUrl,
    category: x.p.category,
    tags: x.p.tags,
    partnerId: "fallback",
    rawSourceId: x.p.id,
    availability: "in_stock",
    fetchedAt: new Date().toISOString(),
    _score: x.score,
  }));
}

// ── Relaxation steps ─────────────────────────────────────────────────────────
type RelaxStep = {
  label: string;
  apply: (p: SearchParams) => SearchParams;
};

const RELAX_STEPS: RelaxStep[] = [
  {
    label: "synonyms",
    apply: p => ({
      ...p,
      keywords: [...p.keywords, ...buildSearchTerms({ keywords: [], occasion: p.occasion, recipient: p.recipient, ageGroup: p.ageGroup })],
    }),
  },
  {
    label: "price+20%",
    apply: p => ({ ...p, maxPrice: p.maxPrice ? p.maxPrice * 1.2 : undefined }),
  },
  {
    label: "remove_occasion",
    apply: p => ({ ...p, occasion: undefined }),
  },
  {
    label: "remove_excludes",
    apply: p => ({ ...p, excludeIds: [] }),
  },
];

// ── Main search function ──────────────────────────────────────────────────────
export async function liveSearch(params: SearchParams): Promise<{
  results: LiveProduct[];
  meta: SearchMeta;
}> {
  const t0 = Date.now();
  const {
    limit = 6,
    excludeIds = [],
    locale = "de",
    awinToken, awinPublisherId,
  } = params;

  const meta: SearchMeta = {
    partnersResponded: [],
    partnerErrors: {},
    relaxationStepsUsed: [],
    excludedIds: excludeIds,
    queryKeywords: params.keywords,
    totalFoundByPartner: {},
    durationMs: 0,
    source: "fallback",
  };

  // Build initial keyword set
  const allKeywords = buildSearchTerms({
    keywords: params.keywords,
    occasion: params.occasion,
    recipient: params.recipient,
    ageGroup: params.ageGroup,
  });
  meta.queryKeywords = allKeywords;

  async function fetchLive(p: SearchParams, kw: string[]): Promise<LiveProduct[]> {
    const [awinRes, amazonRes] = await Promise.allSettled([
      // Awin
      (awinToken && awinPublisherId)
        ? searchAwin({ keywords: kw, minPrice: p.minPrice, maxPrice: p.maxPrice, locale, pageSize: 12, publisherId: awinPublisherId, apiToken: awinToken })
        : Promise.resolve({ products: [], error: "not_configured" }),
      // Amazon Search Cards — direkte Suchlinks mit Affiliate-Tag, kein API-Key nötig
      Promise.resolve(generateAmazonSearchCards({
        keywords: kw,
        occasion: p.occasion,
        recipient: p.recipient,
        ageGroup: p.ageGroup,
        minPrice: p.minPrice,
        maxPrice: p.maxPrice,
        pageSize: 6,
      })),
    ]);

    const live: LiveProduct[] = [];

    if (awinRes.status === "fulfilled") {
      const r = awinRes.value;
      if (r.error && r.error !== "not_configured") meta.partnerErrors["awin"] = r.error;
      if (r.products.length > 0) {
        meta.partnersResponded.push("awin");
        meta.totalFoundByPartner["awin"] = r.totalFound ?? r.products.length;
        live.push(...r.products);
      }
    }

    if (amazonRes.status === "fulfilled") {
      const r = amazonRes.value;
      if (r.error && r.error !== "not_configured") meta.partnerErrors["amazon"] = r.error;
      if (r.products.length > 0) {
        meta.partnersResponded.push("amazon");
        meta.totalFoundByPartner["amazon"] = r.totalFound ?? r.products.length;
        live.push(...r.products);
      }
    }

    return live;
  }

  // ── Attempt 1: live with full params ───────────────────────────────────────
  let liveProducts = await fetchLive(params, allKeywords);

  // Score + dedupe + filter excludes
  let candidates = dedupe(liveProducts)
    .filter(p => !excludeIds.includes(p.id))
    .map(p => ({ ...p, _score: scoreProduct(p, allKeywords) }))
    .sort((a, b) => (b._score ?? 0) - (a._score ?? 0));

  // ── Relaxation if not enough live results ──────────────────────────────────
  if (candidates.length < limit) {
    let current = { ...params, keywords: allKeywords };

    for (const step of RELAX_STEPS) {
      if (candidates.length >= limit) break;
      current = step.apply(current);
      meta.relaxationStepsUsed.push(step.label);

      const relaxed = await fetchLive(current, current.keywords);
      const relaxedCandidates = dedupe([...liveProducts, ...relaxed])
        .filter(p => !(current.excludeIds ?? []).includes(p.id))
        .map(p => ({ ...p, _score: scoreProduct(p, current.keywords) }))
        .sort((a, b) => (b._score ?? 0) - (a._score ?? 0));

      if (relaxedCandidates.length > candidates.length) {
        candidates = relaxedCandidates;
        liveProducts = [...liveProducts, ...relaxed];
      }
    }
  }

  // ── Mix in fallback if still not enough ───────────────────────────────────
  if (candidates.length < limit) {
    const fb = searchFallback(allKeywords, params.maxPrice, params.minPrice, excludeIds);
    const fbNotDupe = fb.filter(f => !candidates.some(c => normTitle(c.title) === normTitle(f.title)));
    candidates = [...candidates, ...fbNotDupe];
    meta.source = candidates.some(c => c.partnerId !== "fallback") ? "mixed" : "fallback";
    if (meta.relaxationStepsUsed.length > 0 || candidates.every(c => c.partnerId === "fallback")) {
      meta.relaxationStepsUsed.push("fallback_products");
    }
  } else {
    meta.source = "live";
  }

  meta.durationMs = Date.now() - t0;

  return {
    results: candidates.slice(0, limit),
    meta,
  };
}
