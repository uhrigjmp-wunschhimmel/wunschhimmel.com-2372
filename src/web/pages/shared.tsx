import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { WishCard } from "@/components/WishCard";
import { WishDetailModal } from "@/components/WishDetailModal";
import { UpdatePost } from "@/components/UpdatePost";
import { CATEGORIES } from "@/components/AddWishSheet";

export default function SharedList() {
  const { t } = useI18n();
  const params = useParams<{ token: string }>();
  const { theme } = useTheme();
  const isTeal = theme === "teal";
  const foreground = isTeal ? "#E8F5F3" : "var(--primary)";
  const muted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";

  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);
  const [selectedWish, setSelectedWish] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const fetchList = async () => {
    try {
      const [data, upd] = await Promise.all([
        api.getShared(params.token),
        api.getSharedUpdates(params.token),
      ]);
      setList(data);
      setUpdates(upd);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [params.token]);

  if (loading) return (
    <div className="min-h-screen blob-bg flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3">✨</div><p className="font-body text-muted-foreground">{t("loading")}</p></div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen blob-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Liste nicht gefunden</h1>
        <p className="font-body text-muted-foreground">Diese Liste existiert nicht oder wurde entfernt.</p>
      </div>
    </div>
  );

  const allWishes = list.wishes || [];
  const reserved = allWishes.filter((w: any) => w.isReserved).length;
  const total = allWishes.length;
  const usedCategories = [...new Set(allWishes.map((w: any) => w.category).filter(Boolean))] as string[];
  const filteredWishes = filterCategory === "all" ? allWishes : allWishes.filter((w: any) => w.category === filterCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-navy pt-20 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 right-8 text-7xl text-white">✦</div>
          <div className="absolute bottom-4 left-12 text-5xl text-white">✦</div>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <span className="text-5xl block mb-3">{list.emoji}</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">{list.title}</h1>
          {list.description && <p className="font-body text-white/70">{list.description}</p>}
          {list.ownerName && (
  <div style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    background: "rgba(255,255,255,0.12)",
    borderRadius: 50,
    padding: "6px 14px 6px 6px",
    backdropFilter: "blur(8px)",
  }}>
    {list.ownerAvatar ? (
      <img
        src={list.ownerAvatar}
        alt={list.ownerName}
        style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }}
      />
    ) : (
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "linear-gradient(135deg, #F25990, #B02558)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color: "#fff"
      }}>
        {list.ownerName.charAt(0).toUpperCase()}
      </div>
    )}
    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      von <strong>{list.ownerName}</strong>
    </span>
  </div>
)}
          <div className="mt-5 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-[var(--rose-soft)]">{total}</div>
              <div className="font-body text-xs text-white/60">Wünsche</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-[#86EFAC]">{reserved}</div>
              <div className="font-body text-xs text-white/60">Reserviert</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-[var(--accent)]">{total - reserved}</div>
              <div className="font-body text-xs text-white/60">Noch frei</div>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 1440 40" className="w-full absolute bottom-0" preserveAspectRatio="none" style={{ height: 30 }}>
          <path fill="var(--background)" d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
        </svg>
      </div>

      {/* Info banner */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-[var(--lavender)] rounded-2xl p-3 text-center">
          <p className="font-body text-sm text-foreground">
            🎁 Tippe auf einen Wunsch um ihn zu <strong>reservieren</strong> — damit kein Geschenk doppelt gekauft wird. Der Wunschende sieht nicht wer was reserviert hat.
          </p>
        </div>
      </div>

      {/* Category filter */}
      {usedCategories.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setFilterCategory("all")}
              className="shrink-0 px-4 py-1.5 rounded-full font-body text-sm font-semibold border transition-all"
              style={{ background: filterCategory === "all" ? "var(--primary)" : "white", color: filterCategory === "all" ? "white" : "#6B6B9A", borderColor: filterCategory === "all" ? "var(--primary)" : "#EAD9D9" }}>
              Alle ({total})
            </button>
            {usedCategories.map(cat => {
              const catObj = CATEGORIES.find(c => c.id === cat);
              const count = allWishes.filter((w: any) => w.category === cat).length;
              return (
                <button key={cat} onClick={() => setFilterCategory(cat)}
                  className="shrink-0 px-4 py-1.5 rounded-full font-body text-sm font-semibold border transition-all"
                  style={{ background: filterCategory === cat ? "var(--accent)" : "white", color: filterCategory === cat ? "white" : "#6B6B9A", borderColor: filterCategory === cat ? "var(--accent)" : "#EAD9D9" }}>
                  {catObj?.emoji} {catObj?.label || cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Wishes grid */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {filteredWishes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✨</div>
            <p className="font-body text-muted-foreground">Keine Wünsche in dieser Kategorie.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredWishes.map((wish: any) => (
              <WishCard
                key={wish.id}
                wish={wish}
                shareToken={params.token}
                onClick={(w) => setSelectedWish(w)}
                onReserved={fetchList}
              />
            ))}
          </div>
        )}
      </div>

      {/* Updates */}
      {updates.length > 0 && (
        <div className="max-w-xl mx-auto px-4 pb-12">
          <h2 className="font-display text-2xl font-bold mb-5" style={{ color: foreground }}>Updates 🎉</h2>
          <div className="space-y-4">
            {updates.map((u: any) => (
              <UpdatePost key={u.id} update={u} shareToken={params.token} onUpdated={fetchList} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pb-8 font-body space-y-1">
        <p className="text-muted-foreground text-xs">
          Erstellt mit ✨ <a href="/" className="text-accent hover:underline">Wunschhimmel</a>
        </p>
        <p className="text-muted-foreground/50 text-xs max-w-sm mx-auto px-4">
          Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.
        </p>
      </div>

      {/* Wish Detail Modal (with reserve flow) */}
      {selectedWish && (
        <WishDetailModal
          wish={selectedWish}
          shareToken={params.token}
          onClose={() => setSelectedWish(null)}
          onUpdated={fetchList}
          onReserved={() => { fetchList(); setSelectedWish(null); }}
        />
      )}
    </div>
  );
}
