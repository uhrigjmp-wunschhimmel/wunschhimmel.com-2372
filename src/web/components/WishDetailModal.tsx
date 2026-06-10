import { useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { CATEGORIES } from "./AddWishSheet";

const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;
const AFFILIATE_TAG = "wunschhimme00-21";
const AMAZON_RE = /^(www\.)?(amazon\.(de|com|co\.uk|fr|it|es|nl|pl|se|co\.jp|ca|com\.au|com\.br|com\.mx|in|sg|ae|sa|com\.tr))/i;

function withAffiliateTag(url: string): string {
  try {
    const u = new URL(url);
    if (!AMAZON_RE.test(u.hostname)) return url;
    u.searchParams.set("tag", AFFILIATE_TAG);
    return u.toString();
  } catch { return url; }
}

function buildAmazonSearchUrl(title: string): string {
  const STOPWORDS = new Set(["der","die","das","ein","eine","für","mit","und","oder","auf","im","in","an","zu","von","bei","ist","als","zum","am","dem","den","des","sich","wie","nach","aus","set","box","pack","kit"]);
  const words = title.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
  const query = [...new Set(words)].slice(0, 5).join(" ");
  const url = new URL("https://www.amazon.de/s");
  url.searchParams.set("k", query);
  url.searchParams.set("tag", AFFILIATE_TAG);
  return url.toString();
}

interface WishDetailModalProps {
  wish: any;
  isOwner?: boolean;
  shareToken?: string;
  onClose: () => void;
  onUpdated: () => void;
  onDelete?: (id: string) => void;
  onReserved?: () => void;
}

export function WishDetailModal({ wish, isOwner, shareToken, onClose, onUpdated, onDelete, onReserved }: WishDetailModalProps) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit state
  const [editTitle, setEditTitle]       = useState(wish.title || "");
  const [editDesc, setEditDesc]         = useState(wish.description || "");
  const [editPrice, setEditPrice]       = useState(wish.price != null ? String(wish.price) : "");
  const [editShop, setEditShop]         = useState(wish.shop || "");
  const [editCategory, setEditCategory] = useState(wish.category || "");
  const [editPriority, setEditPriority] = useState(wish.priority || "medium");
  const [editNotes, setEditNotes]       = useState(wish.notes || "");
  const [editUrl, setEditUrl]           = useState(wish.productUrl || "");
  const [imageFile, setImageFile]       = useState<File | null>(null);

  // Reserve state (for guests)
  const [showReserveInput, setShowReserveInput] = useState(false);
  const [reserveName, setReserveName]           = useState("");
  const [reserving, setReserving]               = useState(false);

  const catObj = CATEGORIES.find(c => c.id === (editing ? editCategory : wish.category));
  const priorityColors: Record<string, string> = {
    high: "#FF6B8A",
    medium: "#C4B5FD",
    low: "#FCA5A5",
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      await api.updateWish(wish.id, {
        title: editTitle,
        description: editDesc || undefined,
        price: editPrice ? parseFloat(editPrice.replace(",", ".")) : null,
        shop: editShop || undefined,
        category: editCategory || undefined,
        priority: editPriority,
        notes: editNotes || undefined,
        productUrl: editUrl || undefined,
      });
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        await fetch(`/api/wishes/${wish.id}/image`, { method: "POST", body: fd, credentials: "include" });
      }
      toast.success("Wunsch aktualisiert!");
      onUpdated();
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    try {
      await api.deleteWish(wish.id);
      toast.success("Wunsch gelöscht");
      onDelete?.(wish.id);
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    }
  };

  const handleReserve = async () => {
    if (!reserveName.trim() || !shareToken) return;
    setReserving(true);
    try {
      await api.reserveWish(shareToken, wish.id, reserveName);
      toast.success("Reserviert! 🎁");
      onReserved?.();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setReserving(false);
    }
  };

  const displayImage = imageFile ? URL.createObjectURL(imageFile) : wish.imageUrl;
  const hasLink = !!wish.productUrl;

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 10001, background: "rgba(0,0,0,0.5)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white w-full overflow-hidden"
        style={{
          borderRadius: "24px 24px 0 0",
          maxHeight: "calc(100dvh - 50px)",
          display: "flex",
          flexDirection: "column",
          maxWidth: 520,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
          {/* Image */}
          {displayImage ? (
            <div className="relative w-full" style={{ height: 200 }}>
              <img src={displayImage} alt={wish.title} className="w-full h-full object-cover" />
              {editing && (
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer">
                  <span className="text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">🖼️ Bild ändern</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setImageFile(f); }} />
                </label>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center" style={{ height: 120, background: "linear-gradient(135deg,#FFF0F5,#EDE9FF)" }}>
              <span style={{ fontSize: 56 }}>🎁</span>
              {editing && (
                <label className="mt-2 cursor-pointer">
                  <span className="text-xs text-muted-foreground font-body underline">Bild hochladen</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setImageFile(f); }} />
                </label>
              )}
            </div>
          )}

          <div className="px-5 py-4">
            {!editing ? (
              /* ── VIEW MODE ── */
              <div>
                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {wish.priority && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-body font-semibold text-white" style={{ background: priorityColors[wish.priority] || "#C4B5FD" }}>
                      {wish.priority === "high" ? "🔥 Hoch" : wish.priority === "medium" ? "⭐ Mittel" : "💤 Niedrig"}
                    </span>
                  )}
                  {catObj && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-body font-semibold bg-[#E8DEFF] text-foreground">
                      {catObj.emoji} {catObj.label}
                    </span>
                  )}
                  {wish.shop && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-body bg-[#FFF8F0] text-muted-foreground border border-border">
                      🏪 {wish.shop}
                    </span>
                  )}
                  {wish.isReserved && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-body font-semibold bg-green-100 text-green-700">
                      ✓ Reserviert
                    </span>
                  )}
                </div>

                <h2 className="font-display text-2xl font-bold text-foreground leading-tight mb-1">{wish.title}</h2>

                {wish.price != null && (
                  <p className="text-2xl font-bold text-accent font-body mb-2">
                    {new Intl.NumberFormat("de-DE", { style: "currency", currency: wish.currency || "EUR" }).format(wish.price)}
                  </p>
                )}

                {wish.description && (
                  <p className="font-body text-sm text-muted-foreground mb-3">{wish.description}</p>
                )}

                {wish.notes && (
                  <div className="bg-[#FFF8F0] rounded-xl p-3 border border-border mb-3">
                    <p className="font-body text-xs font-semibold text-muted-foreground mb-0.5">📝 Notizen</p>
                    <p className="font-body text-sm text-foreground">{wish.notes}</p>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2 mt-4">
                  {hasLink ? (
                    <a
                      href={withAffiliateTag(wish.productUrl)}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full text-center py-3 rounded-xl font-body font-semibold text-sm text-white transition-colors hover:opacity-90"
                      style={{ background: "#1A1A4E" }}
                    >
                      Zum Produkt →
                    </a>
                  ) : (
                    <a
                      href={buildAmazonSearchUrl(wish.title)}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full text-center py-3 rounded-xl font-body font-semibold text-sm text-white transition-colors hover:opacity-90"
                      style={{ background: "#FF9900" }}
                    >
                      Auf Amazon suchen →
                    </a>
                  )}

                  {/* Guest reserve */}
                  {!isOwner && shareToken && (
                    wish.isReserved ? (
                      <div className="w-full text-center py-3 rounded-xl font-body text-sm bg-green-50 text-green-700 border border-green-200">
                        ✓ Bereits reserviert
                      </div>
                    ) : showReserveInput ? (
                      <div className="flex gap-2">
                        <input
                          value={reserveName}
                          onChange={e => setReserveName(e.target.value)}
                          placeholder="Dein Name"
                          className="flex-1 border border-border rounded-xl px-3 py-2.5 font-body text-sm outline-none focus:border-[#FF6B8A]"
                          autoFocus
                        />
                        <button
                          onClick={handleReserve}
                          disabled={reserving || !reserveName.trim()}
                          className="px-4 py-2.5 rounded-xl font-body font-semibold text-sm text-white disabled:opacity-50"
                          style={{ background: "#FF6B8A" }}
                        >
                          {reserving ? "..." : "✓"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReserveInput(true)}
                        className="w-full py-3 rounded-xl font-body font-semibold text-sm border-2 border-[#FF6B8A] text-[#FF6B8A] hover:bg-[#FF6B8A] hover:text-white transition-colors"
                      >
                        🎁 Ich schenke das!
                      </button>
                    )
                  )}

                  {showReserveInput && (
                    <p className="text-xs text-muted-foreground text-center font-body">
                      Nur du siehst deinen Namen. Der Wunschende sieht nur „Reserviert".
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* ── EDIT MODE ── */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-1">Titel *</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2.5 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A]" style={{ minWidth: 0 }} autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-1">Beschreibung</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
                    className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-body font-semibold text-foreground mb-1">Preis (€)</label>
                    <input value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" step="0.01" placeholder="29.99"
                      className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A]" />
                  </div>
                  <div>
                    <label className="block text-xs font-body font-semibold text-foreground mb-1">Händler</label>
                    <input value={editShop} onChange={e => setEditShop(e.target.value)} placeholder="Amazon"
                      className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-1">Produkt-Link</label>
                  <input value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="https://..."
                    className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A]" style={{ minWidth: 0 }} />
                </div>
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-1">Priorität</label>
                  <select value={editPriority} onChange={e => setEditPriority(e.target.value)}
                    className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A]">
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p === "high" ? "🔥 Hoch" : p === "medium" ? "⭐ Mittel" : "💤 Niedrig"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-2">Kategorie</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setEditCategory(editCategory === cat.id ? "" : cat.id)}
                        className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all border"
                        style={{ background: editCategory === cat.id ? "#FF6B8A" : "white", borderColor: editCategory === cat.id ? "#FF6B8A" : "#EAD9D9", color: editCategory === cat.id ? "white" : "#1A1A4E" }}>
                        <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-body font-semibold text-foreground mb-1">Notizen</label>
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} placeholder="z.B. Größe M, Farbe Blau..."
                    className="w-full bg-[#FFF8F0] border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] resize-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 border-t border-border bg-white shrink-0">
          {!editing ? (
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 border border-border text-muted-foreground font-body py-2.5 rounded-xl hover:bg-[#FFF8F0] transition-colors text-sm">
                Schließen
              </button>
              {isOwner && (
                <>
                  <button onClick={() => setEditing(true)}
                    className="flex-1 border border-[#1A1A4E] text-[#1A1A4E] font-body font-semibold py-2.5 rounded-xl hover:bg-[#1A1A4E] hover:text-white transition-colors text-sm">
                    ✏️ Bearbeiten
                  </button>
                  <button onClick={handleDelete}
                    className="px-4 py-2.5 rounded-xl font-body text-sm transition-colors"
                    style={{ background: confirmDelete ? "#EF4444" : "#FFE4E4", color: confirmDelete ? "white" : "#EF4444" }}>
                    {confirmDelete ? "Sicher?" : "🗑️"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setConfirmDelete(false); }}
                className="flex-1 border border-border text-muted-foreground font-body py-2.5 rounded-xl hover:bg-[#FFF8F0] transition-colors text-sm">
                Abbrechen
              </button>
              <button onClick={handleSave} disabled={saving || !editTitle.trim()}
                className="flex-1 font-body font-semibold py-2.5 rounded-xl text-sm text-white disabled:opacity-50 transition-colors"
                style={{ background: "#FF6B8A" }}>
                {saving ? "Speichere..." : "Speichern ✓"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
