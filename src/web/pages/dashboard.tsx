import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconLock, IconUnlock, IconGift, IconSparkle } from "@/components/Icons";
import { useClipboardWish } from "@/components/ClipboardWishDetector";

const EMOJIS = ["🎁", "🎂", "🎄", "🌟", "💍", "🛍️", "🌈", "🎮", "👟", "📚", "🎵", "🌸", "✈️", "💄", "🏠"];

export default function Dashboard() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const { handleTrigger, checking, Sheet } = useClipboardWish();

  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎁");
  const [newPublic, setNewPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!session) return;
    api.getLists().then(setLists).catch(() => {}).finally(() => setLoading(false));
  }, [session]);

  const createList = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const list = await api.createList({ title: newTitle, description: newDesc, emoji: newEmoji, isPublic: newPublic });
      setLists(prev => [list, ...prev]);
      setShowNewModal(false);
      setNewTitle(""); setNewDesc(""); setNewEmoji("🎁"); setNewPublic(false);
      toast.success("Liste erstellt! 🎉");
      navigate(`/list/${list.id}`);
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setCreating(false);
    }
  };

  const deleteList = async (id: string) => {
    if (!confirm(t("delete_confirm"))) return;
    try {
      await api.deleteList(id);
      setLists(prev => prev.filter(l => l.id !== id));
      toast.success("Liste gelöscht");
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    }
  };

  const togglePublic = async (list: any) => {
    try {
      const updated = await api.updateList(list.id, { isPublic: !list.isPublic });
      setLists(prev => prev.map(l => l.id === list.id ? updated : l));
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    }
  };

  if (!session) { navigate("/sign-in"); return null; }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: 88, paddingBottom: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>
                Willkommen zurück ✨
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontWeight: 900,
                fontSize: "clamp(26px, 4vw, 38px)",
                color: "var(--foreground)", letterSpacing: "-0.03em", lineHeight: 1.15,
              }}>
                {session.user.name?.split(" ")[0] || "Freund"}s Wunschhimmel
              </h1>
            </div>

            {/* Nur noch: Neue Liste */}
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary"
              style={{ gap: 8 }}
            >
              <IconPlus size={16} color="currentColor" />
              {t("new_list")}
            </button>
          </div>

          {/* Stats bar */}
          {!loading && lists.length > 0 && (
            <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {lists.length} {lists.length === 1 ? "Liste" : "Listen"}
              </span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>·</span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {lists.filter(l => l.isPublic).length} öffentlich
              </span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 20 }} />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "var(--card)", borderRadius: 28,
            border: "2px dashed var(--border)",
          }}>
            <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>🎁</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
              Deine erste Wunschliste
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
              {t("no_lists")}
            </p>
            <button onClick={() => setShowNewModal(true)} className="btn-primary" style={{ margin: "0 auto" }}>
              <IconPlus size={16} color="currentColor" />
              Erste Liste erstellen
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {lists.map(list => (
              <div key={list.id} className="list-card" onClick={() => navigate(`/list/${list.id}`)}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 38, lineHeight: 1 }}>{list.emoji}</span>
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => togglePublic(list)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        padding: "4px 10px", borderRadius: 999, border: "none",
                        cursor: "pointer", transition: "all 0.15s",
                        background: list.isPublic ? "var(--lavender)" : "var(--rose-soft)",
                        color: list.isPublic ? "var(--primary)" : "#9F1239",
                      }}
                    >
                      {list.isPublic
                        ? <><IconUnlock size={11} color="currentColor" />{t("public_badge")}</>
                        : <><IconLock size={11} color="currentColor" />{t("private_badge")}</>
                      }
                    </button>
                  </div>
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700, fontSize: 17, color: "var(--foreground)",
                  lineHeight: 1.3, marginTop: 4,
                }}>
                  {list.title}
                </h3>
                {list.description && (
                  <p style={{
                    fontSize: 12, color: "var(--muted-foreground)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    lineHeight: 1.5, overflow: "hidden",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {list.description}
                  </p>
                )}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingTop: 12, marginTop: "auto",
                  borderTop: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {new Date(list.createdAt).toLocaleDateString("de-DE")}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteList(list.id); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--muted-foreground)", padding: "4px 6px",
                      borderRadius: 8, transition: "color 0.15s, background 0.15s",
                      opacity: 0, fontSize: 11,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    className="group-hover:opacity-100 delete-btn"
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "#E11D48"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLElement).style.background = "none"; }}
                  >
                    <IconTrash size={13} color="currentColor" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowNewModal(true)}
              style={{
                background: "none", border: "2px dashed var(--border)",
                borderRadius: 20, padding: 20,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 10, cursor: "pointer", minHeight: 160,
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,107,157,0.04)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "none"; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IconPlus size={20} color="var(--muted-foreground)" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Neue Liste
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ── FAB: Wunsch hinzufügen ── */}
      <button
        onClick={handleTrigger}
        disabled={checking}
        style={{
          position: "fixed",
          bottom: 28,
          right: 24,
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 22px",
          borderRadius: 50,
          border: "none",
          background: checking
            ? "linear-gradient(135deg, #F8A8C8, #D97BAA)"
            : "linear-gradient(135deg, #F25990, #B02558)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: "0 6px 24px rgba(210, 59, 114, 0.40)",
          cursor: checking ? "wait" : "pointer",
          transition: "transform 0.15s, box-shadow 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseOver={e => {
          if (!checking) {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(210, 59, 114, 0.50)";
          }
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(210, 59, 114, 0.40)";
        }}
      >
        <span style={{ fontSize: 18 }}>🎁</span>
        {checking ? "Prüfe…" : "Wunsch hinzufügen"}
      </button>

      {/* ── New list modal ── */}
      {showNewModal && (
        <div className="wh-modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="wh-modal" onClick={e => e.stopPropagation()} style={{ padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
                Neue Liste erstellen ✨
              </h2>
              <button onClick={() => setShowNewModal(false)} className="btn-icon" style={{ width: 36, height: 36 }}>✕</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="wh-label">Emoji</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)} style={{
                    fontSize: 22, padding: "6px 8px", borderRadius: 12,
                    border: `2px solid ${newEmoji === e ? "var(--accent)" : "transparent"}`,
                    background: newEmoji === e ? "rgba(255,107,157,0.1)" : "var(--muted)",
                    cursor: "pointer",
                    transform: newEmoji === e ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.15s",
                  }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="wh-label">Listenname *</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="z. B. Weihnachten 2025" className="wh-input" autoFocus
                  onKeyDown={e => { if (e.key === "Enter" && newTitle.trim()) createList(); }} />
              </div>
              <div>
                <label className="wh-label">Beschreibung (optional)</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  placeholder="Was ist das für eine Liste?" rows={2} className="wh-input" style={{ resize: "none" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={newPublic} onChange={e => setNewPublic(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }} />
                <span style={{ fontSize: 13, color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
                  Öffentlich — für andere sichtbar
                </span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowNewModal(false)} className="btn-secondary" style={{ flex: 1 }}>Abbrechen</button>
              <button onClick={createList} disabled={creating || !newTitle.trim()} className="btn-primary" style={{ flex: 1 }}>
                {creating ? "Erstelle…" : "Liste erstellen ✨"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet vom ClipboardWishDetector */}
      <Sheet />
    </div>
  );
}
