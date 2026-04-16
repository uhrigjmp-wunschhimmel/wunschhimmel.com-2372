import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { authClient } from "@/lib/auth";
import { WishCard } from "@/components/WishCard";
import { UpdatePost } from "@/components/UpdatePost";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;

export default function ListDetail() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const { theme } = useTheme();
  const isTeal = theme === "teal";
  const accent = isTeal ? "#2DD4BF" : "#FF6B8A";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const foreground = isTeal ? "#E8F5F3" : "#1A1A4E";
  const muted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";
  const inputBg = isTeal ? "#1A2D3E" : "#FFF8F0";

  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<any[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [updatePhoto, setUpdatePhoto] = useState<File | null>(null);
  const [updatePhotoPreview, setUpdatePhotoPreview] = useState<string | null>(null);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add wish form
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);

  // Share form
  const [shareEmails, setShareEmails] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);

  // Edit form
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPublic, setEditPublic] = useState(false);

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
    } catch { }
  };

  useEffect(() => {
    if (session) { fetchList(); fetchUpdates(); }
  }, [session, params.id]);

  const postUpdate = async () => {
    if (!updateText.trim()) return;
    setPostingUpdate(true);
    try {
      await api.createUpdate(params.id, updateText, updatePhoto || undefined);
      await fetchUpdates();
      setShowUpdateModal(false);
      setUpdateText("");
      setUpdatePhoto(null);
      setUpdatePhotoPreview(null);
      toast.success("Update gepostet! 🎉");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPostingUpdate(false);
    }
  };

  const deleteUpdate = async (id: string) => {
    try {
      await api.deleteUpdate(id);
      setUpdates(prev => prev.filter(u => u.id !== id));
      toast.success("Update gelöscht");
    } catch { }
  };

  const scrapeUrl = async () => {
    if (!url.trim()) return;
    setScraping(true);
    try {
      const data = await api.scrape(url);
      if (data.title) setTitle(data.title);
      if (data.image) setImageUrl(data.image);
      if (data.price) setPrice(String(data.price));
      if (data.description && !desc) setDesc(data.description);
      toast.success("Produktdaten geladen!");
    } catch {
      toast.error("URL konnte nicht geladen werden");
    } finally {
      setScraping(false);
    }
  };

  const addWish = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const newWish = await api.addWish(list.id, {
        title,
        description: desc || undefined,
        imageUrl: imageUrl || undefined,
        price: price ? parseFloat(price.replace(",", ".")) : undefined,
        productUrl: url || undefined,
        priority,
      });
      // Upload image file if one was manually selected
      if (imageFile && newWish?.id) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const imgRes = await fetch(`/api/wishes/${newWish.id}/image`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (!imgRes.ok) console.warn("Image upload failed");
      }
      await fetchList();
      setShowAddModal(false);
      resetForm();
      toast.success("Wunsch hinzugefügt!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteWish = async (id: string) => {
    try {
      await api.deleteWish(id);
      setList((prev: any) => ({ ...prev, wishes: prev.wishes.filter((w: any) => w.id !== id) }));
      toast.success("Wunsch gelöscht");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const shareList = async () => {
    const emails = shareEmails.split(",").map(e => e.trim()).filter(Boolean);
    if (!emails.length) return;
    setSharing(true);
    try {
      const result = await api.shareList(list.id, { emails, message: shareMessage || undefined });
      toast.success(`${result.sent} Einladung(en) gesendet!`);
      setShowShareModal(false);
      setShareEmails("");
      setShareMessage("");
    } catch (e: any) {
      toast.error(e.message);
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
      toast.error(e.message);
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/shared/${list.shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link kopiert!");
  };

  const resetForm = () => {
    setUrl(""); setTitle(""); setDesc(""); setImageUrl(""); setImageFile(null); setPrice(""); setPriority("medium");
  };

  if (!session) { navigate("/sign-in"); return null; }
  if (loading) return <div className="min-h-screen bg-background pt-24 flex items-center justify-center text-muted-foreground font-body">{t("loading")}</div>;
  if (!list) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate("/dashboard")} className="font-body text-sm text-muted-foreground hover:text-foreground mb-4 block transition-colors">
            ← Zurück
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{list.emoji}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-3xl font-bold text-foreground">{list.title}</h1>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-body font-medium ${list.isPublic ? "bg-[#E8DEFF] text-foreground" : "bg-[#FFD6D6] text-foreground"}`}>
                    {list.isPublic ? t("public_badge") : t("private_badge")}
                  </span>
                </div>
                {list.description && <p className="font-body text-muted-foreground mt-1">{list.description}</p>}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setEditTitle(list.title); setEditDesc(list.description || ""); setEditPublic(list.isPublic); setShowEditModal(true); }}
                className="border border-border text-foreground font-body text-sm px-4 py-2 rounded-full hover:bg-white transition-colors"
              >
                ✏️ {t("edit_list")}
              </button>
              <button
                onClick={copyShareLink}
                className="border border-border text-foreground font-body text-sm px-4 py-2 rounded-full hover:bg-white transition-colors"
              >
                🔗 Link kopieren
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-[#1A1A4E] text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#2d2d7e] transition-colors"
              >
                📨 {t("share_list")}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-accent text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#ff5077] transition-colors"
              >
                + {t("add_wish")}
              </button>
            </div>
          </div>
        </div>

        {/* Wishes grid */}
        {list.wishes?.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✨</div>
            <p className="font-body text-muted-foreground text-lg mb-6">Noch keine Wünsche. Füge deinen ersten hinzu!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-accent text-primary-foreground font-body font-semibold px-6 py-3 rounded-full hover:bg-[#ff5077] transition-colors"
            >
              + {t("add_wish")}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.wishes.map((wish: any) => (
              <WishCard
                key={wish.id}
                wish={wish}
                isOwner
                onDelete={deleteWish}
              />
            ))}
          </div>
        )}

        {/* Updates feed */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold" style={{ color: foreground }}>
              Updates & Celebrate 🎉
            </h2>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="font-body text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              style={{ background: accent, color: isTeal ? "#0F1923" : "#fff" }}
            >
              + Update posten
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
                <UpdatePost
                  key={u.id}
                  update={{ ...u, ownerName: session?.user.name || "Du" }}
                  isOwner
                  onDelete={deleteUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post update modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-3xl p-8 w-full max-w-md shadow-2xl" style={{ background: cardBg }}>
            <h2 className="font-display text-2xl font-bold mb-6" style={{ color: foreground }}>Update posten 🎉</h2>
            <div className="space-y-4">
              <textarea
                value={updateText}
                onChange={e => setUpdateText(e.target.value)}
                rows={4}
                placeholder="Ich habe gerade mein Geschenk bekommen... 🎁"
                className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none resize-none border transition-all"
                style={{ background: inputBg, border: `1px solid ${border}`, color: foreground }}
                autoFocus
              />

              {/* Photo upload */}
              <div>
                <label
                  className="flex items-center gap-2 cursor-pointer font-body text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-dashed transition-colors w-full justify-center"
                  style={{ borderColor: border, color: muted }}
                >
                  📷 {updatePhotoPreview ? "Foto ändern" : "Foto hinzufügen (optional)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { setUpdatePhoto(f); setUpdatePhotoPreview(URL.createObjectURL(f)); }
                    }}
                  />
                </label>
                {updatePhotoPreview && (
                  <div className="mt-2 relative">
                    <img src={updatePhotoPreview} alt="" className="w-full h-40 object-cover rounded-xl" />
                    <button onClick={() => { setUpdatePhoto(null); setUpdatePhotoPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">✕</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowUpdateModal(false); setUpdateText(""); setUpdatePhoto(null); setUpdatePhotoPreview(null); }} className="flex-1 font-body py-3 rounded-xl border transition-colors" style={{ borderColor: border, color: muted }}>
                Abbrechen
              </button>
              <button
                onClick={postUpdate}
                disabled={postingUpdate || !updateText.trim()}
                className="flex-1 font-body font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
                style={{ background: accent, color: isTeal ? "#0F1923" : "#fff" }}
              >
                {postingUpdate ? "Poste..." : "Posten 🎉"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add wish modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Wunsch hinzufügen 🎁</h2>

            {/* URL scraper */}
            <div className="mb-4">
              <label className="block text-sm font-body font-semibold text-foreground mb-1.5">{t("add_wish_url")}</label>
              <div className="flex gap-2">
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all"
                />
                <button
                  onClick={scrapeUrl}
                  disabled={scraping || !url.trim()}
                  className="bg-[#1A1A4E] text-primary-foreground text-sm font-body font-semibold px-4 py-2.5 rounded-xl hover:bg-[#2d2d7e] transition-colors disabled:opacity-60 shrink-0"
                >
                  {scraping ? "⏳" : t("load_preview")}
                </button>
              </div>
            </div>

            {/* Preview */}
            {(imageUrl || imageFile || title) && (
              <div className="mb-4 flex gap-3 bg-background rounded-xl p-3 border border-border">
                {(imageUrl || imageFile) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-body font-semibold text-sm text-foreground truncate">{title}</div>
                  {price && <div className="font-body text-sm text-accent font-bold">€{price}</div>}
                </div>
              </div>
            )}

            {/* Manual image upload (fallback if no URL or scrape found no image) */}
            {!imageUrl && (
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer font-body text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors w-full justify-center">
                  🖼️ {imageFile ? "Bild ändern" : "Bild manuell hochladen (optional)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) setImageFile(f);
                    }}
                  />
                </label>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="mt-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    ✕ Bild entfernen
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-body font-semibold text-foreground mb-1">{t("wish_title")} *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-semibold text-foreground mb-1">{t("wish_desc")}</label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-body font-semibold text-foreground mb-1">{t("wish_price")}</label>
                  <input
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    type="number"
                    step="0.01"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-body font-semibold text-foreground mb-1">{t("wish_priority")}</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all"
                  >
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p} value={p}>{t(`priority_${p}` as any)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 border border-border text-muted-foreground font-body py-3 rounded-xl hover:bg-background transition-colors">
                {t("cancel")}
              </button>
              <button
                onClick={addWish}
                disabled={saving || !title.trim()}
                className="flex-1 bg-accent text-primary-foreground font-body font-semibold py-3 rounded-xl hover:bg-[#ff5077] transition-colors disabled:opacity-60"
              >
                {saving ? t("loading") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">📨 {t("share_list")}</h2>

            {/* Copy link */}
            <div className="bg-background rounded-xl p-3 border border-border mb-6 flex items-center gap-3">
              <span className="font-body text-xs text-muted-foreground flex-1 truncate">{window.location.origin}/shared/{list.shareToken}</span>
              <button onClick={copyShareLink} className="text-xs bg-[#1A1A4E] text-primary-foreground px-3 py-1.5 rounded-full font-body font-semibold shrink-0">Kopieren</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-body font-semibold text-foreground mb-1.5">{t("share_emails")}</label>
                <input
                  value={shareEmails}
                  onChange={e => setShareEmails(e.target.value)}
                  placeholder="freund@email.de, familie@email.de"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-semibold text-foreground mb-1.5">{t("share_message")}</label>
                <textarea
                  value={shareMessage}
                  onChange={e => setShareMessage(e.target.value)}
                  rows={3}
                  placeholder="Hey! Hier sind meine Wünsche..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground outline-none focus:border-[#FF6B8A] transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowShareModal(false)} className="flex-1 border border-border text-muted-foreground font-body py-3 rounded-xl hover:bg-background transition-colors">
                {t("cancel")}
              </button>
              <button
                onClick={shareList}
                disabled={sharing || !shareEmails.trim()}
                className="flex-1 bg-accent text-primary-foreground font-body font-semibold py-3 rounded-xl hover:bg-[#ff5077] transition-colors disabled:opacity-60"
              >
                {sharing ? t("loading") : t("share_send")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">✏️ {t("edit_list")}</h2>
            <div className="space-y-3">
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-[#FF6B8A] transition-all"
              />
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-[#FF6B8A] transition-all resize-none"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editPublic} onChange={e => setEditPublic(e.target.checked)} className="w-4 h-4 accent-[#FF6B8A]" />
                <span className="font-body text-sm text-foreground">Öffentlich</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-border text-muted-foreground font-body py-3 rounded-xl hover:bg-background transition-colors">{t("cancel")}</button>
              <button onClick={saveEdit} className="flex-1 bg-accent text-primary-foreground font-body font-semibold py-3 rounded-xl hover:bg-[#ff5077] transition-colors">{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
