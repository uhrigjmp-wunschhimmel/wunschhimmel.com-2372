import { useState } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";

const PRODUCT_DOMAINS = [
  "amazon.de", "amazon.com", "amzn.to", "amzn.eu",
  "zalando.de", "zalando.com", "otto.de",
  "ebay.de", "ebay.com", "aboutyou.de",
  "zara.com", "hm.com", "ikea.com",
  "mediamarkt.de", "saturn.de",
  "notebooksbilliger.de", "idealo.de", "etsy.com",
];

function isProductUrl(url: string): boolean {
  try {
    const lower = url.toLowerCase();
    return lower.startsWith("http") && PRODUCT_DOMAINS.some((d) => lower.includes(d));
  } catch { return false; }
}

export function ClipboardWishDetector() {
  const { data: session } = authClient.useSession();
  const [location] = useLocation();

  const [show, setShow] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState("");
  const [lists, setLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [note, setNote] = useState("");
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  // Nur auf Dashboard und List-Seiten anzeigen
  const showButton = session && (location === "/dashboard" || location.startsWith("/list/"));

  const handleButtonClick = async () => {
    setChecking(true);
    try {
      const text = await navigator.clipboard.readText();

      if (!text || !isProductUrl(text)) {
        // Kein Produkt-Link — manuell eingeben lassen
        setDetectedUrl("");
        setTitle("");
        setPrice("");
        setImageUrl("");
        openSheet("", false);
        return;
      }

      const lastUrl = sessionStorage.getItem("wh_last_clipboard");
      if (lastUrl === text) {
        toast.info("Dieser Link wurde bereits hinzugefügt.");
        setChecking(false);
        return;
      }

      openSheet(text, true);
    } catch {
      // Clipboard verweigert — manuelles Eingabe-Sheet öffnen
      setDetectedUrl("");
      setTitle("");
      setPrice("");
      setImageUrl("");
      openSheet("", false);
    } finally {
      setChecking(false);
    }
  };

  const openSheet = (url: string, scrape: boolean) => {
    setDetectedUrl(url);
    setShow(true);

    api.getLists().then((data) => {
      setLists(data);
      if (data.length > 0) setSelectedListId(data[0].id);
    });

    if (scrape && url) {
      setScraping(true);
      api.scrape(url)
        .then((data) => {
          if (data.title) setTitle(data.title);
          if (data.price) setPrice(String(data.price));
          if (data.image) setImageUrl(data.image);
        })
        .catch(() => {})
        .finally(() => setScraping(false));
    }
  };

  const handleDismiss = () => {
    if (detectedUrl) sessionStorage.setItem("wh_last_clipboard", detectedUrl);
    setShow(false);
    setTitle(""); setPrice(""); setImageUrl(""); setNote("");
  };

  const handleSave = async () => {
    if (!selectedListId || !title.trim()) return;
    setSaving(true);
    try {
      await api.addWish(selectedListId, {
        title: title.trim(),
        url: detectedUrl || undefined,
        price: price ? parseFloat(price.replace(",", ".")) : undefined,
        note: note || undefined,
        imageUrl: imageUrl || undefined,
        priority: "medium",
      });
      if (detectedUrl) sessionStorage.setItem("wh_last_clipboard", detectedUrl);
      toast.success("Wunsch hinzugefügt! ✨");
      setShow(false);
      setTitle(""); setPrice(""); setImageUrl(""); setNote("");
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen.");
    } finally {
      setSaving(false);
    }
  };

  if (!showButton) return null;

  return (
    <>
      {/* Floating Button */}
      {!show && (
        <button
          onClick={handleButtonClick}
          disabled={checking}
          style={{
            position: "fixed",
            bottom: 24,
            right: 20,
            zIndex: 9990,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 50,
            border: "none",
            background: "linear-gradient(135deg, #F25990, #B02558)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: checking ? "wait" : "pointer",
            boxShadow: "0 4px 20px rgba(210,59,114,0.40)",
            transition: "transform 0.15s, opacity 0.15s",
            opacity: checking ? 0.8 : 1,
          }}
          onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: 16 }}>🔗</span>
          {checking ? "Prüfe…" : "Link hinzufügen"}
        </button>
      )}

      {/* Backdrop */}
      {show && (
        <div
          onClick={handleDismiss}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 9998,
          }}
        />
      )}

      {/* Bottom Sheet */}
      {show && (
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 9999,
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 40px",
          boxShadow: "0 -8px 40px rgba(18,32,80,0.18)",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}>
          {/* Handle */}
          <div style={{
            width: 40, height: 4, borderRadius: 999,
            background: "#E5E7EB", margin: "0 auto 18px",
          }} />

          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <p style={{
              fontSize: 11, fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--accent)", textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: 3,
            }}>
              {detectedUrl ? "🎁 Link erkannt" : "🔗 Link hinzufügen"}
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700,
              color: "var(--foreground)", lineHeight: 1.2,
            }}>
              Zur Wunschliste hinzufügen
            </h2>
          </div>

          {/* Scraping Indikator */}
          {scraping && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 12,
              background: "#FFF5FA", border: "1px solid var(--border)",
              marginBottom: 14,
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                border: "2px solid var(--accent)", borderTopColor: "transparent",
                animation: "wh-spin 0.8s linear infinite", flexShrink: 0,
              }} />
              <span style={{
                fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--muted-foreground)",
              }}>
                Produktdaten werden geladen…
              </span>
            </div>
          )}

          {/* Produktvorschau */}
          {!scraping && (imageUrl || title) && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 12,
              background: "#FFF5FA", border: "1px solid var(--border)",
              marginBottom: 14,
            }}>
              {imageUrl && (
                <img src={imageUrl} alt=""
                  style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  onError={() => setImageUrl("")}
                />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                {title && (
                  <p style={{
                    fontSize: 13, fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "var(--foreground)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{title}</p>
                )}
                {price && (
                  <p style={{
                    fontSize: 13, color: "var(--accent)", fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 2,
                  }}>{price} €</p>
                )}
              </div>
            </div>
          )}

          {/* Formular */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>

            {/* URL manuell eingeben falls kein Link erkannt */}
            {!detectedUrl && (
              <div>
                <label style={labelStyle}>Link (optional)</label>
                <input
                  value={detectedUrl}
                  onChange={(e) => setDetectedUrl(e.target.value)}
                  placeholder="https://www.amazon.de/..."
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                />
              </div>
            )}

            {/* Titel */}
            <div>
              <label style={labelStyle}>Titel *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Produktname"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Liste wählen */}
            <div>
              <label style={labelStyle}>Liste *</label>
              {lists.length === 0 ? (
                <p style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--muted-foreground)" }}>
                  Noch keine Listen vorhanden.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 12,
                        border: `2px solid ${selectedListId === list.id ? "var(--accent)" : "var(--border)"}`,
                        background: selectedListId === list.id ? "#FFF0F5" : "#FAFAFA",
                        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{list.emoji}</span>
                      <span style={{
                        fontSize: 14, fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: "var(--foreground)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                      }}>{list.title}</span>
                      {selectedListId === list.id && (
                        <span style={{ marginLeft: "auto", color: "var(--accent)", flexShrink: 0 }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preis */}
            <div>
              <label style={labelStyle}>Preis (optional)</label>
              <div style={{ position: "relative" }}>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                  style={{ ...inputStyle, paddingRight: 36 }}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                />
                <span style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)", fontSize: 13,
                  color: "var(--muted-foreground)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  pointerEvents: "none",
                }}>€</span>
              </div>
            </div>

            {/* Notiz */}
            <div>
              <label style={labelStyle}>Notiz (optional)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="z. B. Größe 38, Farbe Blau…"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={handleDismiss} style={cancelBtnStyle}>
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !selectedListId}
              style={{
                ...saveBtnStyle,
                opacity: saving || !title.trim() || !selectedListId ? 0.6 : 1,
                cursor: saving || !title.trim() || !selectedListId ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Speichere…" : "✨ Hinzufügen"}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes wh-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: "var(--muted-foreground)", textTransform: "uppercase",
  letterSpacing: "0.05em", marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 12,
  border: "2px solid var(--border)", background: "#FAFAFA",
  fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: "var(--foreground)", outline: "none", boxSizing: "border-box",
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1, padding: "13px", borderRadius: 50,
  border: "2px solid var(--border)", background: "transparent",
  fontSize: 14, fontWeight: 600,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: "var(--muted-foreground)", cursor: "pointer",
};

const saveBtnStyle: React.CSSProperties = {
  flex: 2, padding: "13px", borderRadius: 50,
  border: "none",
  background: "linear-gradient(135deg, #F25990, #B02558)",
  fontSize: 14, fontWeight: 700,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: "#fff",
  boxShadow: "0 4px 16px rgba(210,59,114,0.30)",
};
