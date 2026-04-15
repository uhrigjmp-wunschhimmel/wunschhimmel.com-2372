import { useState } from "react";
import { useI18n } from "@/lib/i18n";

interface WishCardProps {
  wish: any;
  isOwner?: boolean;
  shareToken?: string;
  onDelete?: (id: string) => void;
  onReserved?: () => void;
}

const priorityColors: Record<string, string> = {
  high: "bg-accent text-primary-foreground",
  medium: "bg-[#E8DEFF] text-foreground",
  low: "bg-[#FFD6D6] text-foreground",
};

export function WishCard({ wish, isOwner, shareToken, onDelete, onReserved }: WishCardProps) {
  const { t } = useI18n();
  const [reserveName, setReserveName] = useState("");
  const [showReserveInput, setShowReserveInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    if (!reserveName.trim() || !shareToken) return;
    setLoading(true);
    try {
      await fetch(`/api/shared/${shareToken}/wishes/${wish.id}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: reserveName }),
      });
      onReserved?.();
    } finally {
      setLoading(false);
      setShowReserveInput(false);
    }
  };

  return (
    <div className="wish-card bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
      {/* Product image */}
      {wish.imageUrl && (
        <div className="w-full h-44 overflow-hidden bg-[#FFD6D6]/30">
          <img
            src={wish.imageUrl}
            alt={wish.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-foreground text-base leading-tight line-clamp-2">{wish.title}</h3>
          {wish.priority && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium shrink-0 ${priorityColors[wish.priority] || priorityColors.medium}`}>
              {t(`priority_${wish.priority}` as any)}
            </span>
          )}
        </div>

        {wish.description && (
          <p className="text-sm text-muted-foreground font-body mb-2 line-clamp-2">{wish.description}</p>
        )}

        {wish.price != null && (
          <p className="text-lg font-bold text-accent font-body mb-2">
            {new Intl.NumberFormat("de-DE", { style: "currency", currency: wish.currency || "EUR" }).format(wish.price)}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3">
          {wish.productUrl && (
            <a
              href={wish.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm bg-[#1A1A4E] text-primary-foreground px-3 py-2 rounded-full font-body font-semibold hover:bg-[#2d2d7e] transition-colors"
            >
              {t("buy_btn")}
            </a>
          )}

          {/* Guest: reserve button */}
          {!isOwner && shareToken && (
            wish.isReserved ? (
              <span className="flex-1 text-center text-sm bg-[#E8DEFF] text-foreground px-3 py-2 rounded-full font-body font-medium">
                ✓ {t("reserved")} ({wish.reservedByName})
              </span>
            ) : showReserveInput ? (
              <div className="flex-1 flex gap-1">
                <input
                  value={reserveName}
                  onChange={e => setReserveName(e.target.value)}
                  placeholder={t("reserve_name")}
                  className="flex-1 text-sm border border-border rounded-full px-3 py-1.5 outline-none focus:border-[#FF6B8A] font-body"
                />
                <button
                  onClick={handleReserve}
                  disabled={loading || !reserveName.trim()}
                  className="text-sm bg-accent text-primary-foreground px-3 py-1.5 rounded-full font-body font-semibold disabled:opacity-50"
                >
                  ✓
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowReserveInput(true)}
                className="flex-1 text-center text-sm border-2 border-[#FF6B8A] text-accent px-3 py-2 rounded-full font-body font-semibold hover:bg-accent hover:text-primary-foreground transition-colors"
              >
                {t("reserve_btn")}
              </button>
            )
          )}

          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(wish.id)}
              className="text-sm text-muted-foreground hover:text-red-500 transition-colors font-body px-2"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
