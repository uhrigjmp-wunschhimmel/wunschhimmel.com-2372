import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function Explore() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.explore().then(setLists).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl font-bold text-foreground mb-3">
            {t("explore_title")} <span className="text-accent">✦</span>
          </h1>
          <p className="font-body text-muted-foreground text-lg">{t("explore_sub")}</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground font-body">{t("loading")}</div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌟</div>
            <p className="font-body text-muted-foreground">{t("no_public")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => navigate(`/shared/${list.shareToken}`)}
                className="wish-card bg-white rounded-2xl border border-border shadow-sm p-6 text-left hover:shadow-md transition-all"
              >
                <span className="text-4xl block mb-3">{list.emoji}</span>
                <h3 className="font-display font-bold text-foreground text-xl mb-1">{list.title}</h3>
                {list.description && (
                  <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">{list.description}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-xs font-body text-muted-foreground">
                    {new Date(list.createdAt).toLocaleDateString("de-DE")}
                  </span>
                  <span className="text-xs font-body text-accent font-semibold">
                    Ansehen →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
