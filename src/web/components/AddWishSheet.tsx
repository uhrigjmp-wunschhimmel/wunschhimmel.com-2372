import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const CATEGORIES = [
  { id: "tech",     label: "Technik",    emoji: "💻" },
  { id: "fashion",  label: "Mode",       emoji: "👗" },
  { id: "books",    label: "Bücher",     emoji: "📚" },
  { id: "sport",    label: "Sport",      emoji: "⚽" },
  { id: "home",     label: "Zuhause",    emoji: "🏠" },
  { id: "travel",   label: "Reise",      emoji: "✈️" },
  { id: "food",     label: "Essen",      emoji: "🍕" },
  { id: "toys",     label: "Spielzeug",  emoji: "🧸" },
  { id: "beauty",   label: "Schönheit",  emoji: "💄" },
  { id: "other",    label: "Sonstiges",  emoji: "🎁" },
] as const;

const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;

interface AddWishSheetProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  onAdded: () => void;
  /** Pre-fill URL (e.g. from Share Target API) */
  prefillUrl?: string;
}

export function AddWishSheet({ open, onClose, listId, onAdded, prefillUrl }: AddWishSheetProps) {
  const { t } = useI18n();

  // Tab
  const [tab, setTab] = useState<"link" | "manual">("link");

  // Form state
  const [url, setUrl]           = useState(prefillUrl || "");
  const [title, setTitle]       = useState("");
  const [desc, setDesc]         = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice]       = useState("");
  const [shop, setShop]         = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [notes, setNotes]       = useState("");
  const [showMore, setShowMore] = useState(false);

  // Loading states
  const [scraping, setScraping] = useState(false);
  const [scraped, setScraped]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [dupWarning, setDupWarning] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setTab("link");
      setUrl(prefillUrl || "");
      setTitle(""); setDesc(""); setImageUrl(""); setImageFile(null);
      setPrice(""); setShop(""); setCategory(""); setPriority("medium");
      setNotes(""); setShowMore(false); setScraped(false); setDupWarning(false);
      if (prefillUrl) setTimeout(() => handleScrape(prefillUrl), 300);
    }
  }, [open]);

  // Detect URL paste and auto-scrape
  const handleUrlChange = (val: string) => {
    setUrl(val);
    setScraped(false);
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.startsWith("http")) {
      setUrl(pasted);
      setScraped(false);
      setTimeout(() => handleScrape(pasted), 100);
    }
  };

  const handleScrape = async (scrapeUrl?: string) => {
    const target = (scrapeUrl || url).trim();
    if (!target) return;
    setScraping(true);
    try {
      const data = await api.scrape(target);
      if (data.title) setTitle(data.title);
      if (data.image) setImageUrl(data.image);
      if (data.price) setPrice(String(data.price));
      if (data.description && !desc) setDesc(data.description);
      // Extract shop name from domain
      try {
        const domain = new URL(target).hostname.replace("www.", "");
        const shopName = domain.split(".")[0];
        setShop(shopName.charAt(0).toUpperCase() + shopName.slice(1));
      } catch {}
      setScraped(true);
      toast.success("Produktdaten geladen!");
    } catch {
      toast.error("URL konnte nicht geladen werden — bitte manuell ausfüllen");
      setTab("manual");
    } finally {
      setScraping(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Bitte Titel eingeben"); return; }
    setSaving(true);
    try {
      const newWish = await api.addWish(listId, {
        title: title.trim(),
        description: desc || undefined,
        imageUrl: imageUrl || undefined,
        price: price ? parseFloat(price.replace(",", ".")) : undefined,
        productUrl: (tab === "link" ? url : undefined) || undefined,
        priority,
        category: category || undefined,
        shop: shop || undefined,
        notes: notes || undefined,
      });
      // Upload image file if manually selected
      if (imageFile && newWish?.id) {
        const fd = new FormData();
        fd.append("file", imageFile);
        await fetch(`/api/wishes/${newWish.id}/image`, {
          method: "POST", body: fd, credentials: "include",
        });
      }
      toast.success("Wunsch hinzugefügt! 🎁");
      onAdded();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  // Swipe down to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  const displayImage = imageFile ? URL.createObjectURL(imageFile) : imageUrl;
  const catObj = CATEGORIES.find(c => c.id === category);

  return (
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 10001, background: "rgba(0,0,0,0.45)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full overflow-hidden"
        style={{
          borderRadius: "24px 24px 0 0",
          maxHeight: "calc(100dvh - 50px)",
          display: "flex",
          flexDirection: "column",
          maxWidth: 560,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 shrink-0">
          <h2 className="font-display text-xl font-bold text-foreground">Wunsch hinzufügen 🎁</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-5 mb-3 bg-[#FFF8F0] rounded-xl p-1 border border-border shrink-0">
          <button
            onClick={() => setTab("link")}
            className="flex-1 py-2 rounded-lg font-body text-sm font-semibold transition-all"
            style={{ background: tab === "link" ? "#1A1A4E" : "transparent", color: tab === "link" ? "#fff" : "#6B6B9A" }}
          >
            🔗 Per Link
          </button>
          <button
            onClick={() => setTab("manual")}
            className="flex-1 py-2 rounded-lg font-body text-sm font-semibold transition-all"
            style={{ background: tab === "manual" ? "#1A1A4E" : "transparent", color: tab === "manual" ? "#fff" : "#6B6B9A" }}
          >
            ✏️ Manuell
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto overflow-x-hidden px-5 pb-5" style={{ flex: 1, minHeight: 0 }}>

          {/* ── LINK TAB ── */}
          {tab === "link" && (
            <div>
              {/* URL Input */}
              <div className="mb-3">
                <label className="block text-xs font-body font-semibold text-foreground mb-1">Produkt-URL einfügen</label>
                <div className="flex gap-2" style={{ minWidth: 0 }}>
                  <input
                    value={url}
                    onChange={e => handleUrlChange(e.target.value)}
                    onPaste={handleUrlPaste}
                    placeholder="https://www.amazon.de/..."
                    className="bg-[#FFF8F0] border border-border rounded-xl px-3 py-2.5 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all"
                    style={{ flex: "1 1 0", minWidth: 0, width: 0 }}
                    autoFocus
                  />
                  <button
                    onClick={() => handleScrape()}
                    disabled={scraping || !url.trim()}
                    className="bg-[#1A1A4E] text-white text-sm font-body font-semibold px-3 py-2.5 rounded-xl hover:bg-[#2d2d7e] transition-colors disabled:opacity-50 shrink-0"
                  >
                    {scraping ? "⏳" : "Laden"}
                  </button>
                </div>
                {!scraped && !scraping && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    💡 Einfach URL einfügen — Daten werden automatisch geladen
                  </p>
                )}
              </div>

              {/* Scrape preview */}
              {scraped && (
                <div className="mb-3 rounded-2xl border border-[#E8DEFF] overflow-hidden" style={{ background: "linear-gradient(135deg,#F9F5FF,#FFF8F0)" }}>
                  {displayImage && (
                    <img
                      src={displayImage}
                      alt=""
                      className="w-full object-cover"
                      style={{ maxHeight: 160 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="p-3">
                    <div className="font-body font-semibold text-sm text-foreground line-clamp-2">{title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      {price && <span className="font-bold text-accent font-body">€{price}</span>}
                      {shop && <span className="text-xs text-muted-foreground font-body">{shop}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick edit when scraped */}
              {scraped && (
                <div className="space-y-2 mb-3">
                  <div>
                    <label className="block text-xs font-body font-semibold text-foreground mb-1">Titel *</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all" style={{ minWidth: 0 }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-body font-semibold text-foreground mb-1">Preis</label>
                      <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" placeholder="29.99"
                        className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-foreground mb-1">Priorität</label>
                      <select value={priority} onChange={e => setPriority(e.target.value)}
                        className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all">
                        {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{t(`priority_${p}` as any)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MANUAL TAB ── */}
          {tab === "manual" && (
            <div className="space-y-2 mb-3">
              {/* Image upload */}
              <div>
                {displayImage ? (
                  <div className="relative mb-2">
                    <img src={displayImage} alt="" className="w-full h-36 object-cover rounded-xl" />
                    <button
                      onClick={() => { setImageFile(null); setImageUrl(""); }}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full"
                    >✕</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent hover:bg-[#FFF0F5] transition-colors mb-2">
                    <span className="text-2xl">🖼️</span>
                    <span className="font-body text-sm text-muted-foreground">Bild hochladen (optional)</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setImageFile(f); }} />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-body font-semibold text-foreground mb-1">Titel *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
                  className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2.5 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all" style={{ minWidth: 0 }} />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-foreground mb-1">Beschreibung</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                  className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-1">Preis (€)</label>
                  <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" placeholder="29.99"
                    className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-1">Händler</label>
                  <input value={shop} onChange={e => setShop(e.target.value)} placeholder="z.B. Amazon"
                    className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-foreground mb-1">Produkt-Link (optional)</label>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
                  className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all" style={{ minWidth: 0 }} />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-foreground mb-1">Priorität</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}
                  className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all">
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{t(`priority_${p}` as any)}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── MEHR OPTIONEN (beide Tabs) ── */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1.5 text-xs font-body font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2 w-full"
          >
            <span style={{ transition: "transform .2s", transform: showMore ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
            Mehr Optionen {showMore ? "ausblenden" : "einblenden"}
          </button>

          {showMore && (
            <div className="space-y-3 mb-3 rounded-2xl border border-border p-3 bg-[#FFF8F0]">
              {/* Kategorie */}
              <div>
                <label className="block text-xs font-body font-semibold text-foreground mb-2">Kategorie</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(category === cat.id ? "" : cat.id)}
                      className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all border"
                      style={{
                        background: category === cat.id ? "#FF6B8A" : "white",
                        borderColor: category === cat.id ? "#FF6B8A" : "#EAD9D9",
                        color: category === cat.id ? "white" : "#1A1A4E",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notizen */}
              <div>
                <label className="block text-xs font-body font-semibold text-foreground mb-1">
                  Notizen <span className="font-normal text-muted-foreground">(z.B. „Größe M, Farbe Blau")</span>
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Hinweise für die Schenkenden..."
                  className="w-full bg-white border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all resize-none" />
              </div>

              {/* Shop (link tab only) */}
              {tab === "link" && (
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-1">Händler</label>
                  <input value={shop} onChange={e => setShop(e.target.value)} placeholder="z.B. Amazon"
                    className="w-full bg-white border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons — always visible */}
        <div className="px-5 pb-5 pt-2 flex gap-3 border-t border-border bg-white shrink-0">
          <button
            onClick={onClose}
            className="flex-1 border border-border text-muted-foreground font-body py-3 rounded-xl hover:bg-[#FFF8F0] transition-colors text-sm"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 bg-accent text-white font-body font-semibold py-3 rounded-xl hover:bg-[#ff5077] transition-colors disabled:opacity-50 text-sm"
            style={{ background: saving || !title.trim() ? undefined : "#FF6B8A" }}
          >
            {saving ? "Speichere..." : "Wunsch speichern 🎁"}
          </button>
        </div>
      </div>
    </div>
  );
}
