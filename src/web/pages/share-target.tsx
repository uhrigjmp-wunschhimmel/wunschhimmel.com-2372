import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";

export default function ShareTarget() {
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();

  // Geteilte Daten aus URL-Params
  const params = new URLSearchParams(window.location.search);
  const sharedUrl = params.get("url") || params.get("text") || "";
  const sharedTitle = params.get("title") || "";

  // Formulardaten
  const [title, setTitle] = useState(sharedTitle);
  const [url, setUrl] = useState(sharedUrl);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedListId, setSelectedListId] = useState("");

  // Status
  const [lists, setLists] = useState<any[]>([]);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scraped, setScraped] = useState(false);

  // Weiterleitung wenn nicht eingeloggt
  useEffect(() => {
    if (session === null) {
      navigate(`/sign-in?redirect=/share-target?url=${encodeURIComponent(sharedUrl)}&title=${encodeURIComponent(sharedTitle)}`);
    }
  }, [session]);

  // Listen laden
  useEffect(() => {
    if (!session) return;
    api.getLists().then((data) => {
      setLists(data);
      if (data.length > 0) setSelectedListId(data[0].id);
    });
  }, [session]);

  // URL automatisch scrapen sobald vorhanden
  useEffect(() => {
    if (!sharedUrl || scraped) return;
    const urlToScrape = extractUrl(sharedUrl);
    if (!urlToScrape) return;

    setUrl(urlToScrape);
    setScraping(true);
    setScraped(true);

    api
      .scrape(urlToScrape)
      .then((data) => {
        if (data.title && !sharedTitle) setTitle(data.title);
        if (data.price) setPrice(String(data.price));
        if (data.image) setImageUrl(data.image);
      })
      .catch(() => {
        // Scraping fehlgeschlagen – kein Problem, Nutzer füllt manuell aus
      })
      .finally(() => setScraping(false));
  }, [sharedUrl]);

  // URL aus Text extrahieren (falls WhatsApp "Schau mal: https://..." schickt)
  function extractUrl(text: string): string {
    const urlRegex = /https?:\/\/[^\s]+/;
    const match = text.match(urlRegex);
    return match ? match[0] : text;
  }

  const handleSave = async () => {
    if (!selectedListId) {
      toast.error("Bitte wähle eine Liste aus.");
      return;
    }
    if (!title.trim()) {
      toast.error("Bitte gib einen Titel ein.");
      return;
    }

    setSaving(true);
    try {
      await api.addWish(selectedListId, {
        title: title.trim(),
        url: url || undefined,
        price: price ? parseFloat(price.replace(",", ".")) : undefined,
        note: note || undefined,
        imageUrl: imageUrl || undefined,
        priority: "medium",
      });
      toast.success("Wunsch hinzugefügt! ✨");
      navigate(`/list/${selectedListId}`);
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen.");
    } finally {
      setSaving(false);
    }
  };

  if (!session) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        paddingTop: 80,
        paddingBottom: 48,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 13,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "var(--muted-foreground)",
            fontWeight: 500,
            marginBottom: 4,
          }}>
            ✨ Neuer Wunsch
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--foreground)",
            lineHeight: 1.2,
          }}>
            Zur Wunschliste hinzufügen
          </h1>
        </div>

        {/* Scraping-Indikator */}
        {scraping && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 14,
            background: "var(--rose-soft)",
            border: "1px solid var(--border)",
            marginBottom: 20,
          }}>
            <div style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid var(--accent)",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }} />
            <span style={{
              fontSize: 13,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
            }}>
              Produktdaten werden geladen…
            </span>
          </div>
        )}

        {/* Produktvorschau */}
        {imageUrl && !scraping && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 14px",
            borderRadius: 16,
            background: "#fff",
            border: "1px solid var(--border)",
            marginBottom: 20,
            boxShadow: "0 2px 12px rgba(210,59,114,0.08)",
          }}>
            <img
              src={imageUrl}
              alt=""
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 10,
                flexShrink: 0,
              }}
              onError={() => setImageUrl("")}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--foreground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {title || "Produkt"}
              </p>
              {price && (
                <p style={{
                  fontSize: 12,
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Liste wählen */}
          <div>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}>
              Liste *
            </label>
            {lists.length === 0 ? (
              <div style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "var(--rose-soft)",
                fontSize: 13,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--muted-foreground)",
              }}>
                Noch keine Listen vorhanden.{" "}
                <button
                  onClick={() => navigate("/dashboard")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 13,
                  }}
                >
                  Liste erstellen →
                </button>
              </div>
            ) : (
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "2px solid var(--border)",
                  background: "#fff",
                  fontSize: 14,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "var(--foreground)",
                  outline: "none",
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.emoji} {list.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Titel */}
          <div>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}>
              Titel *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Nike Air Max 90"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "2px solid var(--border)",
                background: "#fff",
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

          {/* Preis */}
          <div>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}>
              Preis (optional)
            </label>
            <div style={{ position: "relative" }}>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                type="text"
                inputMode="decimal"
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 16px",
                  borderRadius: 12,
                  border: "2px solid var(--border)",
                  background: "#fff",
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
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: "var(--muted-foreground)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                pointerEvents: "none",
              }}>
                €
              </span>
            </div>
          </div>

          {/* Notiz */}
          <div>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}>
              Notiz (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="z. B. Größe 38, Farbe Schwarz…"
              rows={2}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "2px solid var(--border)",
                background: "#fff",
                fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--foreground)",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Link (schreibgeschützt, faltbar) */}
          {url && (
            <div style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--rose-soft)",
              border: "1px solid var(--border)",
            }}>
              <p style={{
                fontSize: 11,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--muted-foreground)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}>
                Link
              </p>
              <p style={{
                fontSize: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--muted-foreground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {url}
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              flex: 1,
              padding: "14px",
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
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !selectedListId}
            style={{
              flex: 2,
              padding: "14px",
              borderRadius: 50,
              border: "none",
              background: "linear-gradient(135deg, #F25990, #B02558)",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving || !title.trim() || !selectedListId ? 0.6 : 1,
              boxShadow: "0 4px 16px rgba(210,59,114,0.30)",
            }}
          >
            {saving ? "Speichere…" : "✨ Zur Liste hinzufügen"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
