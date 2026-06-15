import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { authClient } from "@/lib/auth";
import { WishCard } from "@/components/WishCard";
import { AddWishSheet, CATEGORIES } from "@/components/AddWishSheet";
import { WishDetailModal } from "@/components/WishDetailModal";
import { UpdatePost } from "@/components/UpdatePost";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function ListDetail() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const { theme } = useTheme();
  const isTeal = theme === "teal";
  const accent = isTeal ? "#2DD4BF" : "var(--accent)";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const foreground = isTeal ? "#E8F5F3" : "var(--primary)";
  const muted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";
  const inputBg = isTeal ? "#1A2D3E" : "var(--background)";

  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<any[]>([]);

  // Modals
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedWish, setSelectedWish] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTab, setShareTab] = useState<"email" | "qr" | "apps">("email");
  const qrRef = useRef<SVGSVGElement>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Category filter
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Share form
  const [shareEmails, setShareEmails] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);

  // Edit list form
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPublic, setEditPublic] = useState(false);
const [showPublicConsentModal, setShowPublicConsentModal] = useState(false);

  // Update post form
  const [updateText, setUpdateText] = useState("");
  const [updatePhoto, setUpdatePhoto] = useState<File | null>(null);
  const [updatePhotoPreview, setUpdatePhotoPreview] = useState<string | null>(null);
  const [postingUpdate, setPostingUpdate] = useState(false);

  const fetchList = async () => {
    try {
      const data = await api.getList(params.id);
      setList(data);
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdates = async () => {
    try {
      const data = await api.getUpdates(params.id);
      setUpdates(data);
    } catch {}
  };

  useEffect(() => {
    if (session) { fetchList(); fetchUpdates(); }
  }, [session, params.id]);

  const deleteWish = async (id: string) => {
    setList((prev: any) => ({ ...prev, wishes: prev.wishes.filter((w: any) => w.id !== id) }));
  };

  const shareList = async () => {
    const emails = shareEmails.split(",").map(e => e.trim()).filter(Boolean);
    if (!emails.length) return;
    setSharing(true);
    try {
      const result = await api.shareList(list.id, { emails, message: shareMessage || undefined });
      toast.success(`${result.sent} Einladung(en) gesendet!`);
      setShowShareModal(false);
      setShareEmails(""); setShareMessage("");
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSharing(false);
    }
  };

  const saveEdit = async () => {
    try {
      const updated = await api.updateList(list.id, { title: editTitle, description: editDesc, isPublic: editPublic });
      setList((prev: any) => ({ ...prev, ...updated }));
      setShowEditModal(false);
      toast.success("Liste aktualisiert!");
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/shared/${list.shareToken}`);
    toast.success("Link kopiert!");
  };

  const postUpdate = async () => {
    if (!updateText.trim()) return;
    setPostingUpdate(true);
    try {
      await api.createUpdate(params.id, updateText, updatePhoto || undefined);
      await fetchUpdates();
      setShowUpdateModal(false);
      setUpdateText(""); setUpdatePhoto(null); setUpdatePhotoPreview(null);
      toast.success("Update gepostet! 🎉");
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setPostingUpdate(false);
    }
  };

  const deleteUpdate = async (id: string) => {
    try {
      await api.deleteUpdate(id);
      setUpdates(prev => prev.filter(u => u.id !== id));
    } catch {}
  };

  if (!session) { navigate("/sign-in"); return null; }
  if (loading) return <div className="min-h-screen bg-background pt-24 flex items-center justify-center text-muted-foreground font-body">{t("loading")}</div>;
  if (!list) return null;

  // Filter wishes
  const allWishes = list.wishes || [];
  const usedCategories = [...new Set(allWishes.map((w: any) => w.category).filter(Boolean))] as string[];
  const filteredWishes = filterCategory === "all" ? allWishes : allWishes.filter((w: any) => w.category === filterCategory);

  return (
    <div className="min-h-screen bg-background pb-32 pt-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate("/dashboard")} className="font-body text-sm text-muted-foreground hover:text-foreground mb-4 block transition-colors">
          ← Zurück
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <span className="text-4xl sm:text-5xl shrink-0">{list.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">{list.title}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-body font-medium shrink-0 ${list.isPublic ? "bg-[var(--lavender)] text-foreground" : "bg-[var(--rose-soft)] text-foreground"}`}>
                  {list.isPublic ? t("public_badge") : t("private_badge")}
                </span>
              </div>
              {list.description && <p className="font-body text-muted-foreground mt-1 text-sm">{list.description}</p>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddSheet(true)}
              className="bg-accent text-white font-body text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-colors min-h-[40px] flex items-center gap-1.5"
            >
              ＋ Wunsch
            </button>
            <button
              onClick={() => { setEditTitle(list.title); setEditDesc(list.description || ""); setEditPublic(list.isPublic); setShowEditModal(true); }}
              className="border border-border text-foreground font-body text-sm px-4 py-2 rounded-full hover:bg-white transition-colors min-h-[40px]"
            >
              ✏️ Bearbeiten
            </button>
            <button
              onClick={copyShareLink}
              className="border border-border text-foreground font-body text-sm px-4 py-2 rounded-full hover:bg-white transition-colors min-h-[40px]"
            >
              🔗 Link
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-navy text-white font-body text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-colors min-h-[40px]"
            >
              📨 Teilen
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl border border-border bg-white">
          <div className="text-center flex-1">
            <div className="font-display text-2xl font-bold text-foreground">{allWishes.length}</div>
            <div className="font-body text-xs text-muted-foreground">Wünsche</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center flex-1">
            <div className="font-display text-2xl font-bold text-green-500">{allWishes.filter((w: any) => w.isReserved).length}</div>
            <div className="font-body text-xs text-muted-foreground">Reserviert</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center flex-1">
            <div className="font-display text-2xl font-bold text-accent">{allWishes.filter((w: any) => w.priority === "high").length}</div>
            <div className="font-body text-xs text-muted-foreground">Wichtig</div>
          </div>
        </div>

        {/* Category filter tabs */}
        {usedCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
              onClick={() => setFilterCategory("all")}
              className="shrink-0 px-4 py-1.5 rounded-full font-body text-sm font-semibold transition-all border"
              style={{ background: filterCategory === "all" ? "var(--primary)" : "white", color: filterCategory === "all" ? "white" : "#6B6B9A", borderColor: filterCategory === "all" ? "var(--primary)" : "#EAD9D9" }}
            >
              Alle ({allWishes.length})
            </button>
            {usedCategories.map(cat => {
              const catObj = CATEGORIES.find(c => c.id === cat);
              const count = allWishes.filter((w: any) => w.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className="shrink-0 px-4 py-1.5 rounded-full font-body text-sm font-semibold transition-all border"
                  style={{ background: filterCategory === cat ? "var(--accent)" : "white", color: filterCategory === cat ? "white" : "#6B6B9A", borderColor: filterCategory === cat ? "var(--accent)" : "#EAD9D9" }}
                >
                  {catObj?.emoji} {catObj?.label || cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Wishes grid */}
        {filteredWishes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✨</div>
            <p className="font-body text-muted-foreground text-lg mb-2">
              {filterCategory === "all" ? "Noch keine Wünsche!" : "Keine Wünsche in dieser Kategorie."}
            </p>
            {filterCategory === "all" && (
              <p className="font-body text-muted-foreground text-sm">Tippe auf „+" unten um deinen ersten Wunsch hinzuzufügen.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredWishes.map((wish: any) => (
              <WishCard
                key={wish.id}
                wish={wish}
                isOwner
                onClick={(w) => setSelectedWish(w)}
              />
            ))}
          </div>
        )}

        {/* Updates feed */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold" style={{ color: foreground }}>Updates & Celebrate 🎉</h2>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="font-body text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              style={{ background: accent, color: isTeal ? "#0F1923" : "#fff" }}
            >
              + Update
            </button>
          </div>
          {updates.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="text-4xl mb-3">🎊</div>
              <p className="font-body text-sm" style={{ color: muted }}>Noch kein Update. Feiere wenn du ein Geschenk bekommst!</p>
            </div>
          ) : (
            <div className="max-w-xl space-y-4">
              {updates.map((u: any) => (
                <UpdatePost key={u.id} update={{ ...u, ownerName: session?.user.name || "Du" }} isOwner onDelete={deleteUpdate} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Wish Bottom Sheet ── */}
      <AddWishSheet
        open={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        listId={list.id}
        onAdded={fetchList}
      />

      {/* ── Wish Detail Modal ── */}
      {selectedWish && (
        <WishDetailModal
          wish={selectedWish}
          isOwner
          onClose={() => setSelectedWish(null)}
          onUpdated={() => { fetchList(); setSelectedWish(null); }}
          onDelete={deleteWish}
        />
      )}

      {/* ── Post Update Modal ── */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl" style={{ background: cardBg }}>
            <h2 className="font-display text-xl font-bold mb-4" style={{ color: foreground }}>Update posten 🎉</h2>
            <div className="space-y-3">
              <textarea
                value={updateText}
                onChange={e => setUpdateText(e.target.value)}
                rows={3}
                placeholder="Ich habe gerade mein Geschenk bekommen... 🎁"
                className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none resize-none border"
                style={{ background: inputBg, border: `1px solid ${border}`, color: foreground }}
                autoFocus
              />
              <label className="flex items-center gap-2 cursor-pointer font-body text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-dashed w-full justify-center transition-colors"
                style={{ borderColor: border, color: muted }}>
                📷 {updatePhotoPreview ? "Foto ändern" : "Foto hinzufügen (optional)"}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setUpdatePhoto(f); setUpdatePhotoPreview(URL.createObjectURL(f)); } }} />
              </label>
              {updatePhotoPreview && (
                <div className="relative">
                  <img src={updatePhotoPreview} alt="" className="w-full h-36 object-cover rounded-xl" />
                  <button onClick={() => { setUpdatePhoto(null); setUpdatePhotoPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">✕</button>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowUpdateModal(false); setUpdateText(""); setUpdatePhoto(null); setUpdatePhotoPreview(null); }}
                className="flex-1 font-body py-2.5 rounded-xl border text-sm" style={{ borderColor: border, color: muted }}>
                Abbrechen
              </button>
              <button onClick={postUpdate} disabled={postingUpdate || !updateText.trim()}
                className="flex-1 font-body font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
                style={{ background: accent, color: isTeal ? "#0F1923" : "#fff" }}>
                {postingUpdate ? "Poste..." : "Posten 🎉"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-y-auto" style={{ maxHeight: "calc(100dvh - 60px)" }}>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">🔗 Liste teilen</h2>
            <div className="bg-[var(--background)] rounded-xl p-3 border border-border mb-4 flex items-center gap-3">
              <span className="font-body text-xs text-muted-foreground flex-1 truncate">{window.location.origin}/shared/{list.shareToken}</span>
              <button onClick={copyShareLink} className="text-xs bg-navy text-white px-3 py-1.5 rounded-full font-body font-semibold shrink-0">Kopieren</button>
            </div>
            <div className="flex gap-1 mb-4 bg-[var(--background)] rounded-xl p-1 border border-border">
              {(["email","apps","qr"] as const).map(tab => (
                <button key={tab} onClick={() => setShareTab(tab)}
                  className="flex-1 py-2 rounded-lg font-body text-xs font-semibold transition-all"
                  style={{ background: shareTab === tab ? "var(--primary)" : "transparent", color: shareTab === tab ? "#fff" : "#6B6B9A" }}>
                  {tab === "email" ? "📨 E-Mail" : tab === "apps" ? "💬 Apps" : "📷 QR"}
                </button>
              ))}
            </div>
            {shareTab === "email" && (
              <div className="space-y-3">
                <input value={shareEmails} onChange={e => setShareEmails(e.target.value)}
                  placeholder="freund@email.de, familie@email.de"
                  className="w-full bg-[var(--background)] border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground outline-none focus:border-[var(--accent)]" />
                <textarea value={shareMessage} onChange={e => setShareMessage(e.target.value)} rows={2}
                  placeholder="Hey! Hier sind meine Wünsche..."
                  className="w-full bg-[var(--background)] border border-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground outline-none focus:border-[var(--accent)] resize-none" />
                <div className="flex gap-3">
                  <button onClick={() => setShowShareModal(false)} className="flex-1 border border-border text-muted-foreground font-body py-2.5 rounded-xl text-sm hover:bg-[var(--background)]">{t("cancel")}</button>
                  <button onClick={shareList} disabled={sharing || !shareEmails.trim()}
                    className="flex-1 bg-accent text-white font-body font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                    {sharing ? t("loading") : t("share_send")}
                  </button>
                </div>
              </div>
            )}
            {shareTab === "apps" && (() => {
              const shareUrl = `${window.location.origin}/shared/${list.shareToken}`;
              const shareText = `🎁 Schau mal meine Wunschliste: ${list.emoji} ${list.title}`;
              const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
              const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
              return (
                <div className="flex flex-col gap-2">
                  <button onClick={async () => { if (navigator.share) await navigator.share({ title: `${list.emoji} ${list.title}`, url: shareUrl }); else { navigator.clipboard.writeText(shareUrl); toast.success("Link kopiert!"); } }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold text-sm text-white" style={{ background: "#2D1B69" }}>
                    <span style={{ fontSize: 22 }}>📤</span><div className="text-left"><div>Teilen über...</div><div style={{ fontSize: 11, opacity: 0.7 }}>Alle installierten Apps</div></div>
                  </button>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold text-sm text-white no-underline" style={{ background: "#25D366" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold text-sm text-white no-underline" style={{ background: "#229ED9" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </a>
                  <button onClick={() => setShowShareModal(false)} className="w-full border border-border text-muted-foreground font-body py-2.5 rounded-xl text-sm mt-1">Schließen</button>
                </div>
              );
            })()}
            {shareTab === "qr" && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
                  <QRCodeSVG ref={qrRef} value={`${window.location.origin}/shared/${list.shareToken}`} size={180} bgColor="#ffffff" fgColor="#2D1B69" level="M" />
                </div>
                <p className="font-body text-xs text-muted-foreground text-center">Einfach abscannen — kein Account nötig</p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => {
                    const svg = qrRef.current; if (!svg) return;
                    const canvas = document.createElement("canvas"); canvas.width = 400; canvas.height = 400;
                    const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0,0,400,400);
                    const xml = new XMLSerializer().serializeToString(svg);
                    const img = new Image(); img.onload = () => { ctx.drawImage(img,0,0,400,400); const a = document.createElement("a"); a.download = `qr-${list.title}.png`; a.href = canvas.toDataURL(); a.click(); };
                    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
                  }} className="flex-1 bg-navy text-white font-body font-semibold py-3 rounded-xl text-sm">⬇️ PNG</button>
                  <button onClick={() => setShowShareModal(false)} className="flex-1 border border-border text-muted-foreground font-body py-3 rounded-xl text-sm">Schließen</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit List Modal ── */}
      {showPublicConsentModal && (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px"
  }}>
    <div style={{
      background: cardBg,
      borderRadius: 24,
      padding: "32px 28px",
      maxWidth: 420,
      width: "100%",
      border: `1px solid ${border}`,
      boxShadow: "0 8px 32px rgba(18,32,80,0.18)"
    }}>
      <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>🌍</div>
      <h2 className="font-display text-xl font-bold text-center mb-3" style={{ color: foreground }}>
        Liste öffentlich machen?
      </h2>
      <p className="font-body text-sm text-center mb-4" style={{ color: muted, lineHeight: 1.7 }}>
        Deine Liste wird für alle Besucher von Wunschhimmel sichtbar — auch ohne Link und ohne Account.
      </p>
      <div style={{
        background: isTeal ? "#1A2D3E" : "#FFF5FA",
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 20
      }}>
        <p className="font-body text-sm" style={{ color: muted, lineHeight: 1.7 }}>
          <strong style={{ color: foreground }}>Eingeloggte Nutzer</strong> sehen deinen Namen und dein Profilbild auf der Liste.<br /><br />
<strong style={{ color: foreground }}>Nicht eingeloggte Besucher</strong> sehen deine Wünsche, aber keinen Namen und kein Profilbild.
        </p>
      </div>
      <p className="font-body text-xs text-center mb-6" style={{ color: muted }}>
        Du kannst die Liste jederzeit wieder auf privat stellen. Es gilt §5a unserer{" "}
        <button onClick={() => { setShowPublicConsentModal(false); setShowEditModal(false); window.location.href = "/agb"; }}
          style={{ color: accent, background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0 }}>
          AGB
        </button>.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setShowPublicConsentModal(false)}
          className="font-body text-sm"
          style={{
            flex: 1, padding: "12px", borderRadius: 50,
            border: `1px solid ${border}`,
            background: "transparent", color: muted, cursor: "pointer"
          }}>
          Abbrechen
        </button>
        <button
          onClick={() => {
            setEditPublic(true);
            setShowPublicConsentModal(false);
          }}
          className="font-body text-sm font-bold"
          style={{
            flex: 1, padding: "12px", borderRadius: 50,
            background: isTeal ? "#2DD4BF" : "linear-gradient(135deg, #F25990, #B02558)",
            color: "#fff", border: "none", cursor: "pointer"
          }}>
          Ja, öffentlich machen ✓
        </button>
      </div>
    </div>
  </div>
)}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">✏️ {t("edit_list")}</h2>
            <div className="space-y-3">
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-[var(--background)] border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-[var(--accent)]" />
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
                className="w-full bg-[var(--background)] border border-border rounded-xl px-4 py-2.5 font-body text-foreground outline-none focus:border-[var(--accent)] resize-none" />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editPublic} onChange={e => {
  if (e.target.checked) {
    setShowPublicConsentModal(true);
  } else {
    setEditPublic(false);
  }
}} className="w-4 h-4 accent-[var(--accent)]" />
                <span className="font-body text-sm text-foreground">Öffentlich (für alle sichtbar)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-border text-muted-foreground font-body py-2.5 rounded-xl text-sm">{t("cancel")}</button>
              <button onClick={saveEdit} className="flex-1 bg-accent text-white font-body font-semibold py-2.5 rounded-xl text-sm hover:opacity-90">{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
