import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";

interface WishCardProps {
  wish: any;
  isOwner?: boolean;
  shareToken?: string;
  onDelete?: (id: string) => void;
  onReserved?: () => void;
  onImageUpdated?: () => void;
}

const AFFILIATE_TAG = "wunschhimme00-21";
const AMAZON_RE = /^(www\.)?(amazon\.(de|com|co\.uk|fr|it|es|nl|pl|se|co\.jp|ca|com\.au|com\.br|com\.mx|in|sg|ae|sa|com\.tr))/i;

function withAffiliateTag(url: string): string {
  try {
    const u = new URL(url);
    if (!AMAZON_RE.test(u.hostname)) return url;
    u.searchParams.set("tag", AFFILIATE_TAG);
    return u.toString();
  } catch {
    return url;
  }
}

const priorityColors: Record<string, string> = {
  high: "bg-accent text-primary-foreground",
  medium: "bg-[#E8DEFF] text-foreground",
  low: "bg-[#FFD6D6] text-foreground",
};

export function WishCard({ wish, isOwner, shareToken, onDelete, onReserved, onImageUpdated }: WishCardProps) {
  const { t } = useI18n();
  const [reserveName, setReserveName] = useState("");
  const [showReserveInput, setShowReserveInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/wishes/${wish.id}/image`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (res.ok) {
        const { imageUrl } = await res.json() as { imageUrl: string };
        setLocalImageUrl(imageUrl);
        onImageUpdated?.();
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const displayImage = localImageUrl || wish.imageUrl;

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
      {displayImage ? (
        <div className="w-full h-44 overflow-hidden bg-[#FFD6D6]/30 relative group">
          <img
            src={displayImage}
            alt={wish.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
          {isOwner && (
            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full">
                {uploadingImage ? "Lädt hoch…" : "🖼️ Bild ändern"}
              </span>
              <input ref={imgInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
            </label>
          )}
        </div>
      ) : isOwner ? (
        <label className="w-full h-28 flex flex-col items-center justify-center gap-1 bg-[#FFD6D6]/20 border-b border-border cursor-pointer hover:bg-[#FFD6D6]/40 transition-colors">
          <span className="text-2xl">{uploadingImage ? "⏳" : "🖼️"}</span>
          <span className="text-xs text-muted-foreground font-body">
            {uploadingImage ? "Lädt hoch…" : "Bild hinzufügen"}
          </span>
          <input ref={imgInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
        </label>
      ) : null}

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
              href={withAffiliateTag(wish.productUrl)}
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
