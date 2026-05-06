import { useState } from "react";
import { CATEGORIES } from "./AddWishSheet";

interface WishCardProps {
  wish: any;
  isOwner?: boolean;
  shareToken?: string;
  onClick?: (wish: any) => void;
  /** Legacy support — kept for shared page quick reserve without modal */
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

const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: "#FF6B8A", text: "#fff",     label: "🔥 Hoch"    },
  medium: { bg: "#E8DEFF", text: "#1A1A4E",  label: "⭐ Mittel"  },
  low:    { bg: "#FFD6D6", text: "#1A1A4E",  label: "💤 Niedrig" },
};

export function WishCard({ wish, isOwner, shareToken, onClick, onDelete, onReserved }: WishCardProps) {
  const [localImage, setLocalImage] = useState<string | null>(null);
  const catObj = CATEGORIES.find(c => c.id === wish.category);
  const displayImage = localImage || wish.imageUrl;
  const hasLink = !!wish.productUrl;
  const pColor = priorityColors[wish.priority] || priorityColors.medium;

  return (
    <div
      className="wish-card bg-white rounded-2xl overflow-hidden border border-border shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
      onClick={() => onClick?.(wish)}
    >
      {/* Image */}
      {displayImage ? (
        <div className="w-full h-44 overflow-hidden bg-[#FFD6D6]/20">
          <img
            src={displayImage}
            alt={wish.title}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
        </div>
      ) : (
        <div className="w-full h-28 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FFF0F5,#EDE9FF)" }}>
          <span style={{ fontSize: 48, filter: "drop-shadow(0 2px 6px rgba(255,107,138,0.2))" }}>🎁</span>
        </div>
      )}

      <div className="p-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {wish.priority && (
            <span className="text-xs px-2 py-0.5 rounded-full font-body font-semibold" style={{ background: pColor.bg, color: pColor.text }}>
              {pColor.label}
            </span>
          )}
          {catObj && (
            <span className="text-xs px-2 py-0.5 rounded-full font-body bg-[#F0EBFF] text-foreground">
              {catObj.emoji} {catObj.label}
            </span>
          )}
          {wish.isReserved && (
            <span className="text-xs px-2 py-0.5 rounded-full font-body bg-green-100 text-green-700 font-semibold">
              ✓ Reserviert
            </span>
          )}
        </div>

        <h3 className="font-display font-bold text-foreground text-base leading-tight line-clamp-2 mb-1">{wish.title}</h3>

        {wish.shop && (
          <p className="font-body text-xs text-muted-foreground mb-1">🏪 {wish.shop}</p>
        )}

        {wish.price != null && (
          <p className="text-lg font-bold text-accent font-body mb-1">
            {new Intl.NumberFormat("de-DE", { style: "currency", currency: wish.currency || "EUR" }).format(wish.price)}
          </p>
        )}

        {wish.notes && (
          <p className="font-body text-xs text-muted-foreground line-clamp-1 mt-1 italic">📝 {wish.notes}</p>
        )}

        {/* Buy / Amazon button */}
        <div className="mt-3" onClick={e => e.stopPropagation()}>
          {hasLink ? (
            <a
              href={withAffiliateTag(wish.productUrl)}
              target="_blank" rel="noopener noreferrer"
              className="block w-full text-center text-sm font-body font-semibold py-2 rounded-full text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1A1A4E" }}
            >
              Zum Produkt →
            </a>
          ) : (
            <a
              href={buildAmazonSearchUrl(wish.title)}
              target="_blank" rel="noopener noreferrer"
              className="block w-full text-center text-sm font-body font-semibold py-2 rounded-full text-white hover:opacity-90 transition-opacity"
              style={{ background: "#FF9900" }}
            >
              Auf Amazon suchen →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
