import { useState } from "react";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export function useClipboardWish() {
  const { theme } = useTheme();
  const isTeal = theme === "teal";

  // Theme-Tokens — identisch zu list-detail.tsx
  const accent      = isTeal ? "#2DD4BF" : "#F25990";
  const foreground  = isTeal ? "#E8F5F3" : "#122050";
  const muted       = isTeal ? "#7FBFB5" : "#9A7085";
  const cardBg      = isTeal ? "#162230" : "#FFFFFF";
  const inputBg     = isTeal ? "#1A2D3E" : "#FAFAFA";
  const border      = isTeal ? "#1E3A4A" : "#F0D5E5";
  const labelColor  = isTeal ? "#7FBFB5" : "#9A7085";
  const selectedBg  = isTeal ? "#1E3A4A" : "#FFF0F5";
  const textDark    = isTeal ? "#E8F5F3" : "#122050";
  const textMid     = isTeal ? "#B0D8D4" : "#5A3A4A";

  const [show, setShow] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [lists, setLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [note, setNote] = useState("");
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  const openSheet = (url: string, scrape: boolean) => {
    setDetectedUrl(url);
    setManualUrl(url);
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
          if (data.price) {
            setPrice(String(data.price));
          } else {
            toast("Preis konnte nicht zuverlässig übertragen werden, bitte gib ihn manuell ein 🩷", {
              duration: 4000,
            });
          }
          if (data.image) setImageUrl(data.image);
        })
        .catch(() => {})
        .finally(() => setScraping(false));
    }
  };

  const handleTrigger = async () => {
    setChecking(true);
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith("http")) {
        const lastUrl = sessionStorage.getItem("wh_last_clipboard");
        if (lastUrl === text) {
          openSheet("", false);
        } else {
          openSheet(text, true);
        }
      } else {
        openSheet("", false);
      }
    } catch {
      openSheet("", false);
    } finally {
      setChecking(false);
    }
  };

  const handleDismiss = () => {
    if (detectedUrl) sessionStorage.setItem("wh_last_clipboard", detectedUrl);
    setShow(false);
    setTitle(""); setPrice(""); setImageUrl(""); setNote(""); setManualUrl("");
  };

  const handleSave = async () => {
    if (!selectedListId || !title.trim()) return;
    setSaving(true);
    try {
      await api.addWish(selectedListId, {
        title: title.trim(),
        url: manualUrl || undefined,
        price: price ? parseFloat(price.replace(",", ".")) : undefined,
        note: note || undefined,
        imageUrl: imageUrl || undefined,
        priority: "medium",
      });
      if (detectedUrl) sessionStorage.setItem("wh_last_clipboard", detectedUrl);
      toast.success("Wunsch hinzugefügt! ✨");
      handleDismiss();
    } catch (e: any) {
      toast.error(e.message || "Etwas ist schiefgelaufen.");
    } finally {
      setSaving(false);
    }
  };

  const lbl: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: labelColor, textTransform: "uppercase",
    letterSpacing: "0.05em", marginBottom: 5,
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 12,
    border: `2px solid ${border}`, background: inputBg,
    fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: textDark, outline: "none", boxSizing: "border-box",
  };

  const Sheet = () => {
    if (!show) return null;
    return (
      <>
        {/* Backdrop */}
        <div onClick={handleDismiss} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)", zIndex: 9998,
        }} />

        {/* Bottom Sheet */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: cardBg,
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 40px",
          boxShadow: "0 -8px 40px rgba(18,32,80,0.18)",
          maxHeight: "90dvh", overflowY: "auto",
        }}>
          {/* Handle */}
          <div style={{
            width: 40, height: 4, borderRadius: 999,
            background: isTeal ? "#2A4A5A" : "#E5E7EB",
            margin: "0 auto 18px",
          }} />

          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <p style={{
              fontSize: 11, fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: accent, textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: 3,
            }}>
              {detectedUrl ? "🎁 Link erkannt" : "🔗 Link hinzufügen"}
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700,
              color: foreground, lineHeight: 1.2,
            }}>
              Zur Wunschliste hinzufügen
            </h2>
          </div>

          {/* Scraping Indikator */}
          {scraping && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 12,
              background: isTeal ? "#1A2D3E" : "#FFF5FA",
              border: `1px solid ${border}`, marginBottom: 14,
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                border: `2px solid ${accent}`, borderTopColor: "transparent",
                animation: "wh-spin 0.8s linear infinite", flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", color: muted }}>
                Produktdaten werden geladen…
              </span>
            </div>
          )}

          {/* Produktvorschau */}
          {!scraping && (imageUrl || title) && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 12,
              background: isTeal ? "#1A2D3E" : "#FFF5FA",
              border: `1px solid ${border}`, marginBottom: 14,
            }}>
              {imageUrl && (
                <img src={imageUrl} alt=""
                  style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  onError={() => setImageUrl("")} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                {title && (
                  <p style={{
                    fontSize: 13, fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: foreground,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{title}</p>
                )}
                {price && (
                  <p style={{
                    fontSize: 13, color: accent, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 2,
                  }}>{price} €</p>
                )}
              </div>
            </div>
          )}

          {/* Formular */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>

            {/* Link */}
            <div>
              <label style={lbl}>Link</label>
              <input value={manualUrl} onChange={e => setManualUrl(e.target.value)}
                placeholder="https://www.amazon.de/..."
                style={inp}
                onFocus={e => e.currentTarget.style.borderColor = accent}
                onBlur={e => e.currentTarget.style.borderColor = border} />
            </div>

            {/* Titel */}
            <div>
              <label style={lbl}>Titel *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Produktname"
                style={inp}
                onFocus={e => e.currentTarget.style.borderColor = accent}
                onBlur={e => e.currentTarget.style.borderColor = border} />
            </div>

            {/* Liste wählen */}
            <div>
              <label style={lbl}>Liste *</label>
              {lists.length === 0 ? (
                <p style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: muted }}>
                  Noch keine Listen vorhanden.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {lists.map((list) => (
                    <button key={list.id} onClick={() => setSelectedListId(list.id)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 12,
                      border: `2px solid ${selectedListId === list.id ? accent : border}`,
                      background: selectedListId === list.id ? selectedBg : inputBg,
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{list.emoji}</span>
                      <span style={{
                        fontSize: 14, fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: foreground,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                      }}>{list.title}</span>
                      {selectedListId === list.id && (
                        <span style={{ marginLeft: "auto", color: accent, flexShrink: 0 }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preis */}
            <div>
              <label style={lbl}>Preis (optional)</label>
              <div style={{ position: "relative" }}>
                <input value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="0,00" inputMode="decimal"
                  style={{ ...inp, paddingRight: 36 }}
                  onFocus={e => e.currentTarget.style.borderColor = accent}
                  onBlur={e => e.currentTarget.style.borderColor = border} />
                <span style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)", fontSize: 13,
                  color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  pointerEvents: "none",
                }}>€</span>
              </div>
            </div>

            {/* Notiz */}
            <div>
              <label style={lbl}>Notiz (optional)</label>
              <input value={note} onChange={e => setNote(e.target.value)}
                placeholder="z. B. Größe 38, Farbe Blau…"
                style={inp}
                onFocus={e => e.currentTarget.style.borderColor = accent}
                onBlur={e => e.currentTarget.style.borderColor = border} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={handleDismiss} style={{
              flex: 1, padding: "13px", borderRadius: 50,
              border: `2px solid ${border}`, background: "transparent",
              fontSize: 14, fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: muted, cursor: "pointer",
            }}>
              Abbrechen
            </button>
            <button onClick={handleSave}
              disabled={saving || !title.trim() || !selectedListId}
              style={{
                flex: 2, padding: "13px", borderRadius: 50, border: "none",
                background: isTeal
                  ? "linear-gradient(135deg, #2DD4BF, #0F9B8E)"
                  : "linear-gradient(135deg, #F25990, #B02558)",
                fontSize: 14, fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: isTeal ? "#0F1923" : "#fff",
                boxShadow: isTeal
                  ? "0 4px 16px rgba(45,212,191,0.30)"
                  : "0 4px 16px rgba(210,59,114,0.30)",
                opacity: saving || !title.trim() || !selectedListId ? 0.6 : 1,
                cursor: saving || !title.trim() || !selectedListId ? "not-allowed" : "pointer",
              }}>
              {saving ? "Speichere…" : "✨ Hinzufügen"}
            </button>
          </div>
        </div>
        <style>{`@keyframes wh-spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  };

  return { handleTrigger, checking, Sheet };
}
