// ── Geschenk-Eignungs-Filter ──────────────────────────────────────────────────
// Problem: Breite Marktplatz-Feeds (v.a. OTTO, 292k+ Produkte im Gesamtkatalog)
// enthalten neben Geschenkartikeln auch jede Menge Sanitär-, Montage- und
// Baumarktware ("Spültischarmatur", "Insektenschutzrollo für Dachfenster",
// "WC-Garnitur"). Das ist beim Reservoir-Sampling in awin.ts NICHT durch
// Keyword-Matching im Nachhinein zu retten — wenn das Sample selbst zu einem
// großen Teil aus solchen Artikeln besteht, gibt es für "Mama, Deko" schlicht
// keine guten Treffer zum Finden. Der Filter muss VOR dem Sampling greifen,
// damit die maxItems-Quote nicht an Nicht-Geschenke verschwendet wird.
//
// Bewusst konservativ gehalten: lieber ein Grenzfall zu viel drin als ein
// echtes Geschenk versehentlich raus. Liste kann iterativ erweitert werden,
// sobald der nächste Sync zeigt, was noch durchrutscht (siehe
// /admin/awin-category-report zur Stichprobenkontrolle).

const NON_GIFT_BLOCKLIST = [
  // Sanitär / Bad-Installation
  "armatur", "spültisch", "waschbecken", "wc-garnitur", "wc garnitur",
  "toilette", "urinal", "siphon", "abfluss", "duschkabine", "duschwand",
  "waschtisch", "duschabtrennung",

  // Fenster / Rollos / Insektenschutz / Sichtschutz-Montage
  "dachfenster", "insektenschutz", "fliegengitter", "rollo für",
  "jalousie", "plissee", "rollladen", "scheibengardine", "gardine",

  // Montage / Ersatzteile / Werkzeug / Baumarkt
  "ersatzteil", "ersatz-set", "montage", "bausatz", "halterung für",
  "beschlag", "scharnier", "dübel", "schraube", "dichtung", "silikon",
  "reparatur-set", "werkzeug", "bohrer", "akkuschrauber", "schleifpapier",
  "grundierung", "tapezieren", "möbelfuß", "möbelfüße", "ersatzfront",
  "schrankfront", "griffleiste",

  // Beleuchtung — nur INSTALLATIONS-Leuchten, keine Deko-/Stimmungsleuchten
  // (Tischlampe, Lichterkette, Windlicht, Laterne bleiben bewusst erlaubt)
  "einbauleuchte", "einbauspot", "einbaustrahler", "unterbauleuchte",
  "aufbauleuchte", "wandeinbauleuchte", "deckeneinbau", "led-panel",
  "bewegungsmelder", "erdspieß", "trafo für", "vorschaltgerät",

  // Haustechnik / Elektroinstallation
  "steckdose", "sicherung", "verlängerungskabel", "thermostat",
  "heizkörper", "heizungs", "ventil", "pumpe für", "abwasserrohr",

  // Verbrauchs-/Reinigungsartikel ohne Geschenkcharakter
  "entkalker", "reinigungstab", "ersatzfilter", "filterpatrone",
  "wasserfilter-kartusche", "putzmittel",

  // Funktionale Bettwaren/Textilien nach Maß (kein Geschenkcharakter)
  "spannbettlaken", "matratzenschoner", "matratzenauflage", "matratzenhöhen",
  "bettwäsche-set" /* reine Funktions-Bettwäsche, keine Geschenkedition */,

  // Garten-/Teichtechnik (Installationszubehör, kein Geschenkartikel)
  "gartenteich", "teichfolie", "teichpumpe", "teichzubehör", "wasserfall",

  // Flur-/Einbaumöbel (funktionale Aufbewahrung, kein spontanes Geschenk)
  "schuhschrank", "schuhregal", "schuhkommode", "garderobenpaneel",

  // Haushalts-Verbrauchs- und Funktionsartikel (KEIN pauschales Blocken von
  // Geschirr/Besteck — eine schöne Kaffeetasse oder ein Schneidebrett ist
  // ein normales Geschenk. Hier nur die reinen Alltags-/Putz-/
  // Verbrauchsartikel, die niemand verschenkt.)
  "bügelbrett", "bügeleisen", "bügelunterlage", "wäscheständer",
  "wäschekorb", "wäschesammler", "mülleimer", "mülltüte", "abfalleimer",
  "toilettenpapierhalter", "toilettenbürste", "klobürste", "wc-bürste",
  "spülbürste", "topfreiniger", "scheuerschwamm", "putzeimer", "wischmopp",
  "frischhaltefolie", "alufolie", "gefrierbeutel", "müllbeutel",
  "staubsaugerbeutel", "staubsauger-ersatzteil", "staubsaugerdüse",
  "herdabdeckplatte", "herdschutzgitter", "abtropfgestell",

  // Pfannen & Töpfe — kategorisch ausgeschlossen (explizite Vorgabe),
  // unabhängig von Marke/Qualität/Preis. Bewusst inklusive Blumen-/
  // Übertöpfe (Pflanzgefäße) — lieber ein Grenzfall zu viel raus als
  // ein "doofes Geschenk" drin.
  "pfanne", "topf", "töpfe", "bräter", "kasserolle", "wok", "kochgeschirr",
] as const;

// Einmal kompilierter Regex statt 65 sequenzieller .includes()-Aufrufe pro
// Titel — bei großen Feeds (OTTO: bis zu 8000 gescannte Zeilen) summieren
// sich Einzelvergleiche schnell zu Millionen String-Operationen pro Sync-
// Request und können das CPU-Zeit-Limit des Workers reißen. Ein Regex mit
// Alternation prüft alle Begriffe in einem Durchgang.
const NON_GIFT_REGEX = new RegExp(
  NON_GIFT_BLOCKLIST.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);

/**
 * Prüft, ob ein Produkttitel geschenktauglich ist (grobe Vorfilterung).
 * Case-insensitive Regex-Check gegen eine Blockliste aus Sanitär-,
 * Montage- und Baumarkt-Begriffen. Bewusst konservativ Richtung "lieber
 * rausfiltern": im Zweifel fliegt ein Grenzfall lieber raus, als dass ein
 * unpassendes Produkt als Geschenk vorgeschlagen wird.
 */
export function isGiftworthy(title: string): boolean {
  if (!title) return false;
  return !NON_GIFT_REGEX.test(title);
}
