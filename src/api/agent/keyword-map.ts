// ── Synonym & keyword expansion ───────────────────────────────────────────────
// Maps frontend filter values → search terms sent to partner APIs

export const KEYWORD_MAP: Record<string, string[]> = {
  // Recipients
  freundin:  ["wellness", "beauty", "kreativ", "mode", "geschenk frau"],
  freund:    ["technik", "sport", "spiele", "kreativ", "geschenk mann"],
  partnerin: ["wellness", "beauty", "romantisch", "deko", "liebesgeschenk"],
  partner:   ["technik", "sport", "kreativ", "spiele", "liebesgeschenk"],
  kind:      ["kinder", "spielzeug", "sport", "schule", "kindgeschenk"],
  baby:      ["baby", "kinder", "geburt", "taufe", "babygeschenk"],
  mama:      ["wellness", "beauty", "deko", "bücher", "muttergeschenk"],
  papa:      ["technik", "sport", "bücher", "food", "vatergeschenk"],
  oma:       ["bücher", "deko", "wellness", "tee", "seniorengeschenk"],
  opa:       ["bücher", "technik", "spiele", "seniorengeschenk"],
  kollegin:  ["bücher", "tee", "deko", "wellness", "kollegengeschenk"],
  kollege:   ["bücher", "technik", "kaffee", "kollegengeschenk"],

  // Occasions
  geburtstag:    ["geburtstag", "geburtstagsgeschenk", "wellness", "kreativ", "bücher", "deko"],
  weihnachten:   ["weihnachten", "weihnachtsgeschenk", "deko", "bücher", "spiele", "wellness"],
  valentinstag:  ["valentinstag", "liebesgeschenk", "romantisch", "wellness", "deko"],
  jahrestag:     ["jahrestag", "liebesgeschenk", "romantisch", "personalisiert", "deko"],
  hochzeit:      ["hochzeit", "hochzeitsgeschenk", "deko", "personalisiert", "wellness"],
  babyshower:    ["baby shower", "baby", "kinder", "wellness", "geburt"],
  geburt:        ["geburt", "babygeschenk", "baby", "kinder", "personalisiert"],
  taufe:         ["taufe", "taufgeschenk", "baby", "kinder", "personalisiert"],
  einschulung:   ["einschulung", "schulstart", "schultüte", "schulanfang", "abc", "kinder schule", "lernen", "schulkind"],
  schulstart:    ["schulstart", "einschulung", "schultüte", "abc", "lernen"],
  konfirmation:  ["konfirmation", "firmung", "bücher", "deko", "personalisiert", "erlebnis"],
  kommunion:     ["kommunion", "erstkommunion", "bücher", "deko", "personalisiert"],
  muttertag:     ["muttertag", "muttertagsgeschenk", "wellness", "blumen", "beauty"],
  vatertag:      ["vatertag", "vatertagsgeschenk", "technik", "sport", "grill"],
  ostern:        ["ostern", "ostergeschenk", "kinder", "schokolade", "kreativ"],
  abschied:      ["abschied", "abschiedsgeschenk", "bücher", "deko", "erlebnis"],
  beförderung:   ["beförderung", "erfolg", "bücher", "technik", "deko"],
  "einfach so":  ["geschenk", "überraschung", "wellness", "deko", "kreativ"],

  // Age groups (Kinder)
  "0–2 jahre":  ["baby", "kinder", "spielzeug", "greifling", "motorik"],
  "3–5 jahre":  ["kinder", "spielzeug", "basteln", "kreativ", "puzzle"],
  "6–9 jahre":  ["kinder", "schule", "einschulung", "spiele", "kreativ", "lernen", "schulkind"],
  "10–12 jahre": ["kinder", "spiele", "technik", "kreativ", "sport", "lego"],
  "13–15 jahre": ["teenager", "technik", "musik", "sport", "kreativ", "gaming"],
  "16–18 jahre": ["teenager", "technik", "musik", "mode", "erlebnis", "gaming"],
};

// Occasion → Awin category ID mapping (DE market)
// https://wiki.awin.com/index.php/Product_Feed_Column_Descriptions
export const OCCASION_TO_CATEGORY: Record<string, string[]> = {
  einschulung:  ["Spielzeug & Spiele", "Bücher", "Schreibwaren & Bürobedarf"],
  schulstart:   ["Spielzeug & Spiele", "Bücher", "Schreibwaren & Bürobedarf"],
  geburtstag:   ["Spielzeug & Spiele", "Geschenke", "Bücher", "Beauty & Gesundheit"],
  weihnachten:  ["Spielzeug & Spiele", "Geschenke", "Elektronik", "Bücher"],
  baby:         ["Baby & Kleinkind", "Spielzeug & Spiele", "Kleidung & Accessoires"],
  taufe:        ["Baby & Kleinkind", "Schmuck & Uhren", "Geschenke"],
  hochzeit:     ["Haushalt & Wohnen", "Schmuck & Uhren", "Geschenke", "Erlebnisse"],
  valentinstag: ["Schmuck & Uhren", "Beauty & Gesundheit", "Geschenke"],
  wellness:     ["Beauty & Gesundheit", "Gesundheit & Wellness", "Sport & Outdoor"],
};

export function expandKeywords(keywords: string[]): string[] {
  const expanded = new Set<string>();
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    expanded.add(k);
    const mapped = KEYWORD_MAP[k];
    if (mapped) mapped.forEach(m => expanded.add(m));
  }
  return Array.from(expanded);
}

export function buildSearchTerms(params: {
  keywords: string[];
  occasion?: string;
  recipient?: string;
  ageGroup?: string;
}): string[] {
  const terms = new Set<string>(params.keywords.map(k => k.toLowerCase()));

  if (params.occasion) {
    const occ = params.occasion.toLowerCase();
    const mapped = KEYWORD_MAP[occ] ?? [];
    mapped.forEach(t => terms.add(t));
    // Also add occasion itself as search term
    terms.add(params.occasion.toLowerCase());
  }

  if (params.recipient) {
    const rec = params.recipient.toLowerCase();
    const mapped = KEYWORD_MAP[rec] ?? [];
    mapped.forEach(t => terms.add(t));
  }

  if (params.ageGroup) {
    const age = params.ageGroup.toLowerCase();
    const mapped = KEYWORD_MAP[age] ?? [];
    mapped.forEach(t => terms.add(t));
  }

  return Array.from(terms);
}
