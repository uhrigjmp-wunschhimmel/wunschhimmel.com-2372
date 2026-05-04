import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";

const EMOJIS = ["🎁", "🎂", "🎄", "🌟", "💝", "🛍️", "🌈", "🎮", "👟", "📚", "🎵", "🌸", "✈️", "💄", "🏠"];

export default function Dashboard() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();

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
      setNewTitle("");
      setNewDesc("");
      setNewEmoji("🎁");
      setNewPublic(false);
      toast.success("Liste erstellt!");
      navigate(`/list/${list.id}`);
    } catch (e: any) {
      toast.error(e.message);
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
      toast.error(e.message);
    }
  };

  const togglePublic = async (list: any) => {
    try {
      const updated = await api.updateList(list.id, { isPublic: !list.isPublic });
      setLists(prev => prev.map(l => l.id === list.id ? updated : l));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!session) {
    navigate("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="font-body text-muted-foreground text-sm mb-1">Willkommen zurück,</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              {session.user.name || "Freund"} ✨
            </h1>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-accent text-primary-foreground font-body font-semibold px-6 py-3 rounded-full hover:bg-[#ff5077] transition-all hover:scale-105 shadow-lg shadow-[#FF6B8A]/30 w-full sm:w-auto"
          >
            + {t("new_list")}
          </button>
        </div>

        {/* Lists */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground font-body">{t("loading")}</div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎁</div>
            <p className="font-body text-muted-foreground text-lg">{t("no_lists")}</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-6 bg-accent text-primary-foreground font-body font-semibold px-6 py-3 rounded-full hover:bg-[#ff5077] transition-colors"
            >
              + {t("new_list")}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <div
                key={list.id}
                className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group cursor-pointer wish-card"
                onClick={() => navigate(`/list/${list.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{list.emoji}</span>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => togglePublic(list)}
                        className={`text-xs px-2.5 py-1 rounded-full font-body font-medium transition-colors ${list.isPublic ? "bg-[#E8DEFF] text-foreground" : "bg-[#FFD6D6] text-foreground"}`}
                      >
                        {list.isPublic ? t("public_badge") : t("private_badge")}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-xl mb-1">{list.title}</h3>
                  {list.description && (
                    <p className="font-body text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="font-body text-xs text-muted-foreground">
                      {new Date(list.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-body"
                    >
                      {t("delete_list")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New list modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Neue Liste ✨</h2>

            {/* Emoji picker */}
            <div className="flex flex-wrap gap-2 mb-4">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className={`text-2xl p-2 rounded-xl transition-all ${newEmoji === e ? "bg-[#FFD6D6] scale-110" : "hover:bg-background"}`}
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Listenname *"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-[#FF6B8A] transition-all"
                autoFocus
              />
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Beschreibung (optional)"
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-[#FF6B8A] transition-all resize-none"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPublic}
                  onChange={e => setNewPublic(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B8A]"
                />
                <span className="font-body text-sm text-foreground">Öffentlich (für alle sichtbar)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 border border-border text-muted-foreground font-body py-3 rounded-xl hover:bg-background transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={createList}
                disabled={creating || !newTitle.trim()}
                className="flex-1 bg-accent text-primary-foreground font-body font-semibold py-3 rounded-xl hover:bg-[#ff5077] transition-colors disabled:opacity-60"
              >
                {creating ? t("loading") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
