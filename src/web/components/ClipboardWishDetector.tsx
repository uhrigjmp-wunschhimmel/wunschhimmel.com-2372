import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";

// Domains die als Produkt-URLs erkannt werden
const PRODUCT_DOMAINS = [
  "amazon.de", "amazon.com", "amzn.to", "amzn.eu",
  "zalando.de", "zalando.com",
  "otto.de",
  "ebay.de", "ebay.com",
  "aboutyou.de",
  "zara.com",
  "hm.com",
  "ikea.com",
  "mediamarkt.de",
  "saturn.de",
  "notebooksbilliger.de",
  "idealo.de",
  "etsy.com",
  "shop",
  "produkt",
  "product",
];

function isProductUrl(url: string): boolean {
  try {
    const lower = url.toLowerCase();
    return PRODUCT_DOMAINS.some((d) => lower.includes(d));
  } catch {
    return false;
  }
}

export function ClipboardWishDetector() {
  const { data: session } = authClient.useSession();
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

  useEffect(() => {
    if (!session) return;

    // Nur prüfen wenn App aus Hintergrund kommt oder frisch öffnet
    const checkClipboard = async () => {
      try {
        // Clipboard API braucht Fokus – kurz warten
        await new Promise((r) => setTimeout(r, 600));

        const text = await navigator.clipboard.readText();
        if (!text) return;

        // Nur echte URLs
        if (!text.startsWith("http")) return;

        // Nur Produkt-URLs
        if (!isProductUrl(text)) return;

        // Nicht nochmal zeigen wenn dieselbe URL schon verarbeitet wurde
        const lastUrl = sessionStorage.getItem("wh_last_clipboard");
        if (lastUrl === text) return;

        setDetectedUrl(text);
        setShow(true);

        // Listen laden
        api.getLists().then((data) => {
          setLists(data);
          if (data.length > 0) setSelectedListId(data[0].id);
        });

        // Produktdaten scrapen
        setScraping(true);
        api
          .scrape(text)
          .then((data) => {
            if (data.title) setTitle(data.title);
            if (data.price) setPrice(String(data.price));
            if (data.image) setImageUrl(data.image);
          })
          .catch(() => {})
          .finally(() => setScraping(false));
      } catch {
        // Clipboard-Zugriff verweigert – still ignorieren
      }
    };

    checkClipboard();

    // Auch prüfen wenn Nutzer zurück zur App wechselt
    const handleFocus = () => checkClipboard();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [session]);

  const handleDismiss = () => {
    sessionStorage.setItem("wh_last_clipboard", detectedUrl);
    setShow(false);
    setTitle("");
    setPrice("");
    setImageUrl("");
    setNote("");
  };

  const handleSave = async () => {
    if (!selectedListId || !title.trim()) return;
    setSaving(true);
    try {
      await api.addWish(selectedListId, {
        title: title.trim(),
        url: detectedUrl,
        price: price ? parseFloat(price.replace(",", ".")) : undefined,
        note: note || undefined,
        imageUrl: imageUrl || undefined,
        priority: "medium",
      });
      sessionStorage.setItem("wh_last_clipboard", detectedUrl);
      toast.success("Wunsch hinzugefügt! ✨");
      setShow(false);
      setTitle("");
      setPrice("");
      setImageUrl("");
      setNote("");
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen.");
    } finally {
      setSaving(false);
    }
  };

  if (!show || !session) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
        }}
      />

      {/* Bottom Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
          boxShadow: "0 -8px 40px rgba(18,32,80,0.18)",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div style={{
          width: 40,
          height: 4,
          borderRadius: 999,
          background: "#E5E7EB",
          margin: "0 auto 20px",
        }} />

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 4,
          }}>
            🎁 Link erkannt
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--foreground)",
            lineHeight: 1.2,
          }}>
            Zur Wunschliste hinzufügen?
          </h2>
        </div>

        {/* Scraping-Indikator */}
        {scraping && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 12,
            background: "#FFF5FA",
            border: "1px solid var(--border)",
            marginBottom: 16,
          }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid var(--accent)",
              borderTopColor: "transparent",
              animation: "wh-spin 0.8s linear infinite",
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
            }}>
              Produktdaten werden geladen…
            </span>
          </div>
        )}

        {/* Produktvorschau */}
        {!scraping && (imageUrl || title) && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 14,
            background: "#FFF5FA",
            border: "1px solid var(--border)",
            marginBottom: 16,
          }}>
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: 56,
                  height: 56,
                  objectFit: "cover",
                  borderRadius: 10,
                  flexShrink: 0,
                }}
                onError={() => setImageUrl("")}
              />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              {title && (
                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "var(--foreground)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {title}
                </p>
              )}
              {price && (
                <p style={{
                  fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "var(--accent)",
                  fontWeight: 700,
                  marginTop: 2,
                }}>
                  {price} €
                </p>
              )}
            </div>
          </div>
        )}

        {/* Formular */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Titel */}
          <div>
            <label style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 5,
            }}>
              Titel *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Produktname"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 12,
                border: "2px solid var(--border)",
                background: "#FAFAFA",
                fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--foreground)",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Liste wählen */}
          <div>
            <label style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 5,
            }}>
              Liste *
            </label>
            {lists.length === 0 ? (
              <p style={{
                fontSize: 13,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--muted-foreground)",
                padding: "10px 0",
              }}>
                Noch keine Listen vorhanden.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: `2px solid ${selectedListId === list.id ? "var(--accent)" : "var(--border)"}`,
                      background: selectedListId === list.id ? "#FFF0F5" : "#FAFAFA",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{list.emoji}</span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "var(--foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {list.title}
                    </span>
                    {selectedListId === list.id && (
                      <span style={{
                        marginLeft: "auto",
                        fontSize: 16,
                        flexShrink: 0,
                      }}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preis */}
          <div>
            <label style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 5,
            }}>
              Preis (optional)
            </label>
            <div style={{ position: "relative" }}>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                style={{
                  width: "100%",
                  padding: "11px 36px 11px 14px",
                  borderRadius: 12,
                  border: "2px solid var(--border)",
                  background: "#FAFAFA",
                  fontSize: 14,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "var(--foreground)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              <span style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 13,
                color: "var(--muted-foreground)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                pointerEvents: "none",
              }}>€</span>
            </div>
          </div>

          {/* Notiz */}
          <div>
            <label style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 5,
            }}>
              Notiz (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="z. B. Größe 38, Farbe Blau…"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 12,
                border: "2px solid var(--border)",
                background: "#FAFAFA",
                fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--foreground)",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: 50,
              border: "2px solid var(--border)",
              background: "transparent",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              cursor: "pointer",
            }}
          >
            Ignorieren
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !selectedListId}
            style={{
              flex: 2,
              padding: "13px",
              borderRadius: 50,
              border: "none",
              background: "linear-gradient(135deg, #F25990, #B02558)",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#fff",
              cursor: saving || !title.trim() || !selectedListId ? "not-allowed" : "pointer",
              opacity: saving || !title.trim() || !selectedListId ? 0.6 : 1,
              boxShadow: "0 4px 16px rgba(210,59,114,0.30)",
            }}
          >
            {saving ? "Speichere…" : "✨ Hinzufügen"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes wh-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
