import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { WishCard } from "@/components/WishCard";
import { UpdatePost } from "@/components/UpdatePost";

export default function SharedList() {
  const { t } = useI18n();
  const params = useParams<{ token: string }>();
  const { theme } = useTheme();
  const isTeal = theme === "teal";
  const bg = isTeal ? "#0F1923" : "#FFF8F0";
  const foreground = isTeal ? "#E8F5F3" : "#1A1A4E";
  const muted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const accent = isTeal ? "#2DD4BF" : "#FF6B8A";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";

  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);

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
      <div className="text-center">
        <div className="text-4xl mb-3">✨</div>
        <p className="font-body text-muted-foreground">{t("loading")}</p>
      </div>
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

  const reserved = list.wishes?.filter((w: any) => w.isReserved).length || 0;
  const total = list.wishes?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="bg-[#1A1A4E] pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-primary-foreground">
          <div className="absolute top-8 right-8 text-7xl">✦</div>
          <div className="absolute bottom-4 left-12 text-5xl">✦</div>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <span className="text-6xl block mb-4">{list.emoji}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-3">{list.title}</h1>
          {list.description && <p className="font-body text-primary-foreground/70 text-lg">{list.description}</p>}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-[#FFD6D6]">{total}</div>
              <div className="font-body text-xs text-primary-foreground/60">{t("wishes_count")}</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-accent">{reserved}</div>
              <div className="font-body text-xs text-primary-foreground/60">Reserviert</div>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 1440 60" className="w-full absolute bottom-0" preserveAspectRatio="none" style={{ height: 40 }}>
          <path fill="#FFF8F0" d="M0,20 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* Info banner */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-[#E8DEFF] rounded-2xl p-4 text-center">
          <p className="font-body text-sm text-foreground">
            🎁 Du kannst Wünsche <strong>reservieren</strong> damit keine doppelten Geschenke entstehen. Der Listeninhaber sieht dabei nicht wer was reserviert hat.
          </p>
        </div>
      </div>

      {/* Wishes */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {total === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✨</div>
            <p className="font-body text-muted-foreground">Diese Liste hat noch keine Wünsche.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.wishes.map((wish: any) => (
              <WishCard
                key={wish.id}
                wish={wish}
                shareToken={params.token}
                onReserved={fetchList}
              />
            ))}
          </div>
        )}
      </div>

      {/* Updates feed */}
      {updates.length > 0 && (
        <div className="max-w-xl mx-auto px-6 pb-12">
          <h2 className="font-display text-2xl font-bold mb-6" style={{ color: foreground }}>
            Updates 🎉
          </h2>
          <div className="space-y-4">
            {updates.map((u: any) => (
              <UpdatePost key={u.id} update={u} shareToken={params.token} onUpdated={fetchList} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pb-8 font-body space-y-2">
        <p className="text-muted-foreground text-xs">
          Erstellt mit ✨ <a href="/" className="text-accent hover:underline">Wunschhimmel</a>
        </p>
        <p className="text-muted-foreground/60 text-xs max-w-sm mx-auto px-4">
          Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.
        </p>
      </div>
    </div>
  );
}
