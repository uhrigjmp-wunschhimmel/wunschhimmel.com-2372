import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const COOKIE_KEY = "wunschhimmel_cookie_consent";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export function getConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConsent(marketing: boolean, analytics: boolean) {
  const consent: CookieConsent = {
    necessary: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_KEY, JSON.stringify(consent));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    saveConsent(true, true);
    setVisible(false);
  };

  const acceptNecessary = () => {
    saveConsent(false, false);
    setVisible(false);
  };

  const saveCustom = () => {
    saveConsent(marketing, analytics);
    setVisible(false);
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, width: "min(560px, calc(100vw - 32px))",
      background: "#fff", borderRadius: 20,
      boxShadow: "0 8px 40px rgba(45,27,105,0.18), 0 2px 8px rgba(0,0,0,0.08)",
      border: "1.5px solid #EAD9D9",
      fontFamily: "Plus Jakarta Sans, Arial, sans-serif",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2D1B69 0%, #4A2C8C 100%)",
        padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 28 }}>🍪</span>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Cookies &amp; Datenschutz</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Wir respektieren deine Privatsphäre</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px" }}>
        <p style={{ fontSize: 13, color: "#6B6B9A", lineHeight: 1.6, margin: 0 }}>
          Wir nutzen Cookies und ähnliche Technologien. Technisch notwendige Cookies sind immer aktiv.
          Für Affiliate-Tracking (Awin, Amazon) bitten wir um deine Einwilligung.{" "}
          <button
            onClick={() => navigate("/datenschutz")}
            style={{ color: "#FF6B8A", background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0, textDecoration: "underline" }}
          >
            Mehr erfahren
          </button>
        </p>

        {/* Expanded settings */}
        {expanded && (
          <div style={{ marginTop: 14, borderTop: "1px solid #EAD9D9", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Necessary — always on */}
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "default" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#2D1B69" }}>Notwendig</div>
                <div style={{ fontSize: 11, color: "#6B6B9A" }}>Sitzung, Theme-Einstellung — immer aktiv</div>
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 99,
                background: "#2D1B69", position: "relative", flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute", top: 3, right: 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                }} />
              </div>
            </label>

            {/* Marketing */}
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
              onClick={() => setMarketing(m => !m)}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#2D1B69" }}>Affiliate-Tracking</div>
                <div style={{ fontSize: 11, color: "#6B6B9A" }}>Awin, Amazon Partnerprogramm</div>
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 99,
                background: marketing ? "#FF6B8A" : "#D1D5DB",
                position: "relative", flexShrink: 0,
                transition: "background 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: 3,
                  left: marketing ? "auto" : 3, right: marketing ? 3 : "auto",
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "all 0.2s",
                }} />
              </div>
            </label>

            {/* Analytics */}
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
              onClick={() => setAnalytics(a => !a)}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#2D1B69" }}>Analyse</div>
                <div style={{ fontSize: 11, color: "#6B6B9A" }}>Anonyme Nutzungsstatistiken</div>
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 99,
                background: analytics ? "#FF6B8A" : "#D1D5DB",
                position: "relative", flexShrink: 0,
                transition: "background 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: 3,
                  left: analytics ? "auto" : 3, right: analytics ? 3 : "auto",
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "all 0.2s",
                }} />
              </div>
            </label>
          </div>
        )}

        {/* Buttons */}
        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={acceptAll} style={{
            flex: 1, minWidth: 120,
            background: "linear-gradient(135deg, #FF6B8A, #FF8C69)",
            color: "#fff", border: "none", borderRadius: 50,
            padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            Alle akzeptieren
          </button>

          {expanded ? (
            <button onClick={saveCustom} style={{
              flex: 1, minWidth: 120,
              background: "#F5F0FF", color: "#2D1B69",
              border: "1.5px solid #C4B5FD", borderRadius: 50,
              padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Auswahl speichern
            </button>
          ) : (
            <button onClick={() => setExpanded(true)} style={{
              flex: 1, minWidth: 120,
              background: "#F5F0FF", color: "#2D1B69",
              border: "1.5px solid #C4B5FD", borderRadius: 50,
              padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Einstellungen
            </button>
          )}

          <button onClick={acceptNecessary} style={{
            width: "100%",
            background: "none", color: "#9CA3AF",
            border: "none", borderRadius: 50,
            padding: "6px 20px", fontSize: 12, cursor: "pointer",
          }}>
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  );
}
