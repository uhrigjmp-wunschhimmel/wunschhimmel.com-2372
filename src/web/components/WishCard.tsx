import { useState } from "react";
import { CATEGORIES } from "./AddWishSheet";
import {
  IconTag, IconFlame, IconCheck, IconExternalLink, IconSearch, IconBookmark
} from "./Icons";

interface WishCardProps {
  wish: any;
  isOwner?: boolean;
  shareToken?: string;
  onClick?: (wish: any) => void;
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

const priorityConfig: Record<string, { badge: string; className: string; icon: React.ReactNode }> = {
  high: {
    badge: "Hoch",
    className: "badge badge-high",
    icon: <IconFlame size={10} color="currentColor" />,
  },
  medium: {
    badge: "Mittel",
    className: "badge badge-medium",
    icon: <IconBookmark size={10} color="currentColor" />,
  },
  low: {
    badge: "Niedrig",
    className: "badge badge-low",
    icon: null,
  },
};

export function WishCard({ wish, isOwner, shareToken, onClick, onDelete, onReserved }: WishCardProps) {
  const [imgError, setImgError] = useState(false);
  const catObj = CATEGORIES.find(c => c.id === wish.category);
  const displayImage = wish.imageUrl;
  const hasLink = !!wish.productUrl;
  const pConf = priorityConfig[wish.priority] || priorityConfig.medium;

  return (
    <div
      className="wish-card cursor-pointer group"
      onClick={() => onClick?.(wish)}
      style={{ position: "relative" }}
    >
      {/* Image zone */}
      {displayImage && !imgError ? (
        <div style={{
          width: "100%", height: 176, overflow: "hidden",
          background: "linear-gradient(135deg,#FFF0F8,#F0EBFF)",
          position: "relative",
        }}>
          <img
            src={displayImage}
            alt={wish.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
            onError={() => setImgError(true)}
            className="group-hover:scale-105"
          />
          {/* Gradient overlay bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
            background: "linear-gradient(to top, rgba(26,10,60,0.12), transparent)",
          }} />
        </div>
      ) : (
        <div style={{
          width: "100%", height: 120,
          background: "linear-gradient(135deg,#FFF0F8 0%,#EDE0FF 50%,#FFF5F0 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative pattern */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,107,157,0.12) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
          <span style={{ fontSize: 44, filter: "drop-shadow(0 4px 12px rgba(45,27,105,0.15))", position: "relative", zIndex: 1 }}>
            {catObj?.emoji || "🎁"}
          </span>
        </div>
      )}

      <div style={{ padding: "14px 16px 16px" }}>
        {/* Badges row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {wish.priority && (
            <span className={pConf.className} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {pConf.icon}
              {pConf.badge}
            </span>
          )}
          {catObj && (
            <span className="badge badge-category">
              {catObj.emoji} {catObj.label}
            </span>
          )}
          {wish.isReserved && (
            <span className="badge badge-reserved" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <IconCheck size={10} color="currentColor" />
              Reserviert
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: 1.4,
          color: "var(--foreground)",
          marginBottom: 6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {wish.title}
        </h3>

        {/* Shop */}
        {wish.shop && (
          <p style={{
            fontSize: 11, color: "var(--muted-foreground)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 4, display: "flex", alignItems: "center", gap: 4,
          }}>
            <IconTag size={11} color="var(--muted-foreground)" />
            {wish.shop}
          </p>
        )}

        {/* Price */}
        {wish.price != null && (
          <p style={{
            fontSize: 18, fontWeight: 800, color: "var(--accent)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 4, letterSpacing: "-0.02em",
          }}>
            {new Intl.NumberFormat("de-DE", { style: "currency", currency: wish.currency || "EUR" }).format(wish.price)}
          </p>
        )}

        {/* Notes */}
        {wish.notes && (
          <p style={{
            fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 8,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {wish.notes}
          </p>
        )}

        {/* CTA button */}
        <div onClick={e => e.stopPropagation()} style={{ marginTop: 12 }}>
          {hasLink ? (
            <a
              href={withAffiliateTag(wish.productUrl)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                width: "100%", padding: "10px 16px", borderRadius: 999,
                background: "var(--grad-primary)", color: "#FFFFFF",
                fontSize: 13, fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textDecoration: "none",
                transition: "opacity 0.15s, transform 0.15s",
                boxShadow: "0 4px 12px rgba(45,27,105,0.25)",
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <IconExternalLink size={13} color="currentColor" />
              Zum Produkt
            </a>
          ) : (
            <a
              href={buildAmazonSearchUrl(wish.title)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                width: "100%", padding: "10px 16px", borderRadius: 999,
                background: "linear-gradient(135deg,#FF9900,#FFB347)",
                color: "#FFFFFF",
                fontSize: 13, fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textDecoration: "none",
                transition: "opacity 0.15s, transform 0.15s",
                boxShadow: "0 4px 12px rgba(255,153,0,0.3)",
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <IconSearch size={13} color="currentColor" />
              Bei Amazon suchen
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
