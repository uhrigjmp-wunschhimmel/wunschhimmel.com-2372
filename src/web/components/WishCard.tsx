import { useState, useEffect } from "react";
import { CATEGORIES } from "./AddWishSheet";
import {
  IconTag, IconFlame, IconCheck, IconExternalLink, IconSearch, IconBookmark
} from "./Icons";
import { authClient } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface WishCardProps {
  wish: any;
  isOwner?: boolean;
  shareToken?: string;
  onClick?: (wish: any) => void;
  onDelete?: (id: string) => void;
  onReserved?: () => void;
  onImageUpdated?: () => void;
  showCopyButton?: boolean;
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

export function WishCard({ wish, isOwner, shareToken, onClick, onDelete, onReserved, showCopyButton = false }: WishCardProps) {
  const [imgError, setImgError] = useState(false);
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();

  // Copy-to-list state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [userLists, setUserLists] = useState<any[]>([]);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const catObj = CATEGORIES.find(c => c.id === wish.category);
  const displayImage = wish.imageUrl;
  const hasLink = !!wish.productUrl;
  const pConf = priorityConfig[wish.priority] || priorityConfig.medium;

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    // Eingeloggt — Listen laden und Dropdown zeigen
    try {
      const lists = await api.getLists();
      setUserLists(lists);
      setShowListDropdown(true);
    } catch {
      toast.error("Listen konnten nicht geladen werden.");
    }
  };

  const handleCopyToList = async (listId: string) => {
    setCopying(true);
    setShowListDropdown(false);
    try {
      await api.addWish(listId, {
        title: wish.title,
        productUrl: wish.productUrl || null,
        imageUrl: wish.imageUrl || null,
        price: wish.price || null,
        currency: wish.currency || "EUR",
        shop: wish.shop || null,
        notes: wish.notes || null,
        priority: wish.priority || "medium",
        category: wish.category || null,
      });
      setCopied(true);
      toast.success("Wunsch wurde zu deiner Liste hinzugefügt! ✨");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Wunsch konnte nicht hinzugefügt werden.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <>
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
            fontWeight: 700, fontSize: 14, lineHeight: 1.4,
            color: "var(--foreground)", marginBottom: 6,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
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
              fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {wish.notes}
            </p>
          )}

          {/* CTA Buttons */}
          <div onClick={e => e.stopPropagation()} style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>

            {/* Produkt-Button */}
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
                  textDecoration: "none", transition: "opacity 0.15s, transform 0.15s",
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
                  background: "linear-gradient(135deg,#FF9900,#FFB347)", color: "#FFFFFF",
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textDecoration: "none", transition: "opacity 0.15s, transform 0.15s",
                  boxShadow: "0 4px 12px rgba(255,153,0,0.3)",
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              >
                <IconSearch size={13} color="currentColor" />
                Bei Amazon suchen
              </a>
            )}

            {/* Zu meiner Liste hinzufügen — nur auf öffentlichen Listen */}
            {showCopyButton && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={handleCopyClick}
                  disabled={copying}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    width: "100%", padding: "10px 16px", borderRadius: 999,
                    background: copied ? "#2CA96E" : "transparent",
                    border: `2px solid ${copied ? "#2CA96E" : "var(--border)"}`,
                    color: copied ? "#fff" : "var(--foreground)",
                    fontSize: 13, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: copying ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? "✓ Hinzugefügt!" : copying ? "..." : "✦ Zu meiner Liste hinzufügen"}
                </button>

                {/* Listen-Dropdown */}
                {showListDropdown && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 16, boxShadow: "0 8px 32px rgba(18,32,80,0.15)",
                    zIndex: 100, overflow: "hidden",
                  }}>
                    <p style={{
                      fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      padding: "10px 14px 6px", textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      In welche Liste?
                    </p>
                    {userLists.length === 0 ? (
                      <p style={{ fontSize: 13, color: "var(--muted-foreground)", padding: "8px 14px 12px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Keine Listen gefunden.
                      </p>
                    ) : (
                      userLists.map((list: any) => (
                        <button
                          key={list.id}
                          onClick={(e) => { e.stopPropagation(); handleCopyToList(list.id); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            width: "100%", padding: "10px 14px",
                            background: "transparent", border: "none",
                            cursor: "pointer", textAlign: "left",
                            fontSize: 13, fontWeight: 600, color: "var(--foreground)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            transition: "background 0.15s",
                          }}
                          onMouseOver={e => (e.currentTarget.style.background = "var(--muted)")}
                          onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <span style={{ fontSize: 18 }}>{list.emoji}</span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{list.title}</span>
                        </button>
                      ))
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowListDropdown(false); }}
                      style={{
                        width: "100%", padding: "8px 14px 12px",
                        background: "transparent", border: "none",
                        fontSize: 12, color: "var(--muted-foreground)",
                        cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login-Modal für nicht eingeloggte User */}
      {showLoginModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            style={{
              background: "var(--card)", borderRadius: 24, padding: "32px 28px",
              maxWidth: 380, width: "100%",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 32px rgba(18,32,80,0.18)",
              textAlign: "center",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700,
              color: "var(--foreground)", marginBottom: 8,
            }}>
              Deine eigene Wunschliste
            </h2>
            <p style={{
              fontSize: 14, color: "var(--muted-foreground)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.7, marginBottom: 24,
            }}>
              Erstelle einen kostenlosen Account und füge diesen Wunsch direkt zu deiner eigenen Liste hinzu.
            </p>
            <button
              onClick={() => { setShowLoginModal(false); navigate("/sign-up"); }}
              style={{
                width: "100%", padding: "14px", borderRadius: 999,
                background: "linear-gradient(135deg, #F25990, #B02558)",
                color: "#fff", border: "none", cursor: "pointer",
                fontSize: 15, fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 10,
              }}
            >
              Kostenlos registrieren
            </button>
            <button
              onClick={() => { setShowLoginModal(false); navigate("/sign-in"); }}
              style={{
                width: "100%", padding: "12px", borderRadius: 999,
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--muted-foreground)", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Ich habe bereits einen Account
            </button>
          </div>
        </div>
      )}
    </>
  );
}
