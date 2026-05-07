import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { IconCompass, IconArrowRight, IconSparkle } from "@/components/Icons";

export default function Explore() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.explore().then(setLists).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: 88, paddingBottom: 64 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <span className="section-pill">
              <IconCompass size={13} color="currentColor" />
              Entdecken
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 900,
            fontSize: "clamp(28px, 5vw, 48px)", color: "var(--foreground)",
            letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1.15,
          }}>
            {t("explore_title")}{" "}
            <span style={{
              background: "var(--grad-accent)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              ✦
            </span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted-foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 480, margin: "0 auto" }}>
            {t("explore_sub")}
          </p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 20 }} />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "var(--card)", borderRadius: 28,
            border: "2px dashed var(--border)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {t("no_public")}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => navigate(`/shared/${list.shareToken}`)}
                className="list-card"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  width: "100%", textAlign: "left",
                }}
              >
                {/* Emoji + arrow */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 40, lineHeight: 1 }}>{list.emoji}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--muted)", color: "var(--muted-foreground)",
                    transition: "background 0.15s, color 0.15s",
                  }}>
                    <IconArrowRight size={14} color="currentColor" />
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Playfair Display', serif", fontWeight: 700,
                  fontSize: 17, color: "var(--foreground)", lineHeight: 1.3,
                  marginTop: 8,
                }}>
                  {list.title}
                </h3>

                {list.description && (
                  <p style={{
                    fontSize: 12, color: "var(--muted-foreground)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    lineHeight: 1.5, marginTop: 4,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {list.description}
                  </p>
                )}

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingTop: 12, marginTop: "auto",
                  borderTop: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {new Date(list.createdAt).toLocaleDateString("de-DE")}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "var(--accent)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    Ansehen →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
