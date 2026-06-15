import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { useRef, useState, useEffect } from "react";
import { OccasionSlider, useOccasion, type OccasionTheme } from "@/components/OccasionSlider";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const { active, select } = useOccasion();

  // Smooth theme transition via CSS transition on wrapper
  const [displayed, setDisplayed] = useState<OccasionTheme>(active);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (active.id === displayed.id) return;
    setFading(true);
    const t = setTimeout(() => {
      setDisplayed(active);
      setFading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [active.id]);

  const t = displayed;

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg,
      fontFamily: "Plus Jakarta Sans, sans-serif",
      overflowX: "hidden",
      opacity: fading ? 0.6 : 1,
      transition: "opacity 0.18s ease, background 0.4s ease",
    }}>
      {/* Mobile: hide floating emojis below 480px */}
      <style>{`
        @media (max-width: 480px) {
          :root { --floating-emoji-display: none; }
          .landing-hero-section { padding-top: 72px !important; }
          .landing-section-pad { padding: 48px 16px !important; }
          .landing-cta-wrap { flex-direction: column !important; align-items: stretch !important; }
          .landing-cta-wrap button { width: 100% !important; text-align: center !important; }
          .landing-trust-bar { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 12px !important; justify-items: start !important; }
          .landing-mockup-badge-tr { top: 8px !important; right: 8px !important; }
          .landing-mockup-badge-bl { bottom: 8px !important; left: 8px !important; }
          .landing-mockup-wrap { padding: 0 12px 0 !important; }
          .landing-grid-steps { grid-template-columns: 1fr !important; }
          .landing-grid-features { grid-template-columns: 1fr !important; }
          .landing-banner-pad { padding: 56px 16px !important; }
        }
        @media (max-width: 640px) {
          .landing-cta-banner-btn { padding: 14px 28px !important; font-size: 16px !important; }
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="landing-hero-section" style={{
        paddingTop: 100, paddingBottom: 0, position: "relative",
        background: t.heroGradient,
        transition: "background 0.4s ease",
      }}>

        {/* Rainbow arc */}
        <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", width: "min(900px, 100%)", pointerEvents: "none", zIndex: 0 }}>
          <svg viewBox="0 0 900 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", opacity: 0.18 }}>
            {t.rainbowColors.map((color, i) => (
              <path
                key={i}
                d={`M${50 + i*30},400 Q450,${-100 + i*40} ${850 - i*30},400`}
                stroke={color}
                strokeWidth={32 - i * 2}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        {/* Floating emojis — hidden on narrow screens */}
        {t.floatingEmojis.map((emoji, i) => (
          <div key={i} style={{
            position: "absolute",
            top: [120, 160, 220, 140, 300, 280][i] ?? 180,
            ...(i % 2 === 0 ? { left: `${6 + i * 2}%` } : { right: `${6 + i * 2}%` }),
            fontSize: [36, 28, 30, 32, 26, 24][i] ?? 28,
            transform: `rotate(${[-15, 20, 10, -10, 5, -20][i] ?? 0}deg)`,
            pointerEvents: "none", zIndex: 1, opacity: 0.7,
            transition: "all 0.4s ease",
            display: "var(--floating-emoji-display, block)",
          }}>{emoji}</div>
        ))}

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 2 }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: t.accentSoft, color: t.accentText,
            borderRadius: 999, padding: "8px 20px", fontSize: 13,
            fontWeight: 700, marginBottom: 24,
            fontFamily: "Plus Jakarta Sans, Arial, sans-serif",
            transition: "background 0.4s, color 0.4s",
          }}>
            {t.badge}
          </div>

          {/* Headline + Slider */}
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800,
            lineHeight: 1.3, marginBottom: 16, color: t.primary,
            fontFamily: "Playfair Display, serif",
            transition: "color 0.4s",
          }}>
            Die virtuelle Wunschkiste für
          </h1>

          {/* ── Occasion Slider ── directly in headline */}
          <div style={{ marginBottom: 28 }}>
            <OccasionSlider active={active} onSelect={select} />
          </div>

          <p style={{ fontSize: 18, color: t.muted, lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: "0 auto 36px", transition: "color 0.4s" }}>
            {t.sub}
          </p>

          {/* CTAs */}
          <div className="landing-cta-wrap" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
            <button
              onClick={() => navigate(session ? "/dashboard" : "/sign-up")}
              style={{
                background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accent}CC 100%)`,
                color: "#fff", border: "none", borderRadius: 999,
                padding: "16px 36px", fontSize: 16, fontWeight: 700,
                cursor: "pointer", boxShadow: `0 8px 28px ${t.accent}50`,
                transition: "transform 0.2s, background 0.4s, box-shadow 0.4s",
              }}
              onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              {t.ctaLabel} 🎁
            </button>
            <button
              onClick={() => navigate("/explore")}
              style={{
                background: "#fff", color: t.primary, border: `2px solid ${t.accent}40`,
                borderRadius: 999, padding: "16px 36px", fontSize: 16, fontWeight: 700,
                cursor: "pointer", transition: "transform 0.2s, border-color 0.4s, color 0.4s",
              }}
              onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              Beispiele ansehen ✨
            </button>
          </div>

          {/* Trust bar */}
          <div className="landing-trust-bar" style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap", marginBottom: 40 }}>
            {[
              { icon: "🎈", text: "Kostenlos" },
              { icon: "🌈", text: "Kinderleicht" },
              { icon: "🎁", text: "Keine Doppelgeschenke" },
              { icon: "💌", text: "Per Link teilen" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: t.muted, transition: "color 0.4s" }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>

        </div>

        {/* App mockup card */}
        <div className="landing-mockup-wrap" style={{ display: "flex", justifyContent: "center", padding: "0 24px 0" }}>
          <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: 480 }}>
            <div style={{
              background: "#fff", borderRadius: 28, boxShadow: `0 24px 64px ${t.primary}1A`,
              padding: 28, textAlign: "left", border: `1px solid ${t.accent}22`,
              transition: "border-color 0.4s, box-shadow 0.4s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg,${t.accent},${t.accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, transition: "background 0.4s" }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: t.primary, transition: "color 0.4s" }}>{t.mockupTitle}</div>
                  <div style={{ fontSize: 12, color: "#A89BBD", marginTop: 2 }}>4 Wünsche · Geteilt mit Familie</div>
                </div>
              </div>
              {t.mockupWishes.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 14, marginBottom: 8,
                  background: item.color, transition: "background 0.4s",
                }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: t.primary }}>{item.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, transition: "color 0.4s" }}>{item.price}</div>
                  </div>
                  {item.reserved ? (
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "#6BCB77", color: "#fff", fontWeight: 700 }}>✓ Reserviert</span>
                  ) : (
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, border: `1.5px solid ${t.accent}`, color: t.accent, fontWeight: 700, transition: "color 0.4s, border-color 0.4s" }}>Schenken</span>
                  )}
                </div>
              ))}
            </div>
            <div className="landing-mockup-badge-tr" style={{
              position: "absolute", top: -14, right: -14,
              background: "linear-gradient(135deg,#6BCB77,#4DAF5F)",
              color: "#fff", borderRadius: 999, padding: "8px 14px",
              fontSize: 12, fontWeight: 700, boxShadow: "0 4px 16px rgba(107,203,119,0.4)",
            }}>🔒 Doppelschutz aktiv</div>
            <div className="landing-mockup-badge-bl" style={{
              position: "absolute", bottom: -14, left: -14,
              background: "linear-gradient(135deg,#4D96FF,#3D7FE0)",
              color: "#fff", borderRadius: 999, padding: "8px 14px",
              fontSize: 12, fontWeight: 700, boxShadow: "0 4px 16px rgba(77,150,255,0.4)",
            }}>💌 Link geteilt ✓</div>
          </div>
        </div>

        {/* Wave divider */}
        <div style={{ marginTop: 80 }}>
          <svg viewBox="0 0 1440 70" style={{ width: "100%", display: "block", height: 70 }} preserveAspectRatio="none">
            <path fill="#FFF0F8" d="M0,20 C360,70 1080,0 1440,40 L1440,70 L0,70 Z"/>
          </svg>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="landing-section-pad" style={{ background: "#FFF0F8", padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, transition: "color 0.4s" }}>So einfach geht's</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#2D1B69", marginBottom: 48, fontFamily: "Playfair Display, serif" }}>
            In 3 Schritten zur perfekten Wunschliste 🌟
          </h2>
          <div className="landing-grid-steps" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 24 }}>
            {[
              { step: "1", icon: "📝", title: "Liste erstellen", desc: "Lege deine bunte Wunschkiste an — mit Fotos, Preisen und Links.", color: `${t.accent}22`, accent: t.accent },
              { step: "2", icon: "💌", title: "Mit Familie teilen", desc: "Schick den Link per WhatsApp, E-Mail oder einfach copy-paste.", color: "#FFD6E8", accent: "#E91E8C" },
              { step: "3", icon: "🎁", title: "Wünsche werden reserviert", desc: "Verwandte reservieren Geschenke — du siehst was schon vergeben ist.", color: "#D4F5E0", accent: "#27AE60" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 24, padding: "32px 24px", boxShadow: "0 4px 24px rgba(45,27,105,0.07)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 999, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: s.accent }}>{s.step}</div>
                <div style={{ fontSize: 44, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: "#2D1B69", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#7B6B8D", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 72, marginLeft: -24, marginRight: -24 }}>
          <svg viewBox="0 0 1440 70" style={{ width: "100%", display: "block", height: 70 }} preserveAspectRatio="none">
            <path fill="#FFFBF5" d="M0,40 C480,0 960,70 1440,20 L1440,70 L0,70 Z"/>
          </svg>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="landing-section-pad" style={{ background: "#FFFBF5", padding: "72px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, transition: "color 0.4s" }}>Features</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#2D1B69", fontFamily: "Playfair Display, serif" }}>
              Alles was du brauchst ✨
            </h2>
          </div>
          <div className="landing-grid-features" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 20 }}>
            {[
              { icon: "🔗", title: "Produktlinks speichern", desc: "Link einfügen — Wunschhimmel holt Titel, Bild & Preis automatisch." },
              { icon: "📨", title: "Per E-Mail & Link teilen", desc: "Oma bekommt einen Link, kein App-Download nötig." },
              { icon: "🔒", title: "Kein Doppelschutz-Stress", desc: "Reservierte Geschenke sind für andere als vergeben markiert." },
              { icon: "🌈", title: "Schöne Ansicht für Gäste", desc: "Deine Wunschliste sieht für Beschenkende toll aus — ohne Login." },
              { icon: "🛍️", title: "Amazon-Links inklusive", desc: "Direkt auf Amazon verlinken — einfach für alle Schenkenden." },
              { icon: "📱", title: "Auf allen Geräten", desc: "Egal ob Handy, Tablet oder PC — überall schön." },
            ].map((f, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 20, padding: "28px 24px",
                boxShadow: "0 2px 16px rgba(45,27,105,0.06)", border: `1px solid ${t.accent}18`,
                transition: "border-color 0.4s",
              }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: "#2D1B69", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#7B6B8D", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ────────────────────────────────────────────────────── */}
      <section className="landing-section-pad" style={{ background: "#F5F0FF", padding: "72px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "#2D1B69", marginBottom: 16, fontFamily: "Playfair Display, serif" }}>
            Perfekt für jeden Anlass 🎉
          </h2>
          <p style={{ fontSize: 16, color: "#7B6B8D", marginBottom: 48 }}>Nicht nur Geburtstage — Wunschhimmel passt zu allen Festen</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
            {[
              { emoji: "🎂", label: "Kindergeburtstag" },
              { emoji: "🎄", label: "Weihnachten" },
              { emoji: "🐣", label: "Ostern" },
              { emoji: "👶", label: "Babyshower" },
              { emoji: "💍", label: "Hochzeit" },
              { emoji: "🎓", label: "Einschulung" },
              { emoji: "🥳", label: "Erwachsenengeburtstag" },
              { emoji: "💝", label: "Valentinstag" },
            ].map((u, i) => (
              <div
                key={i}
                style={{
                  background: "#fff", borderRadius: 999, padding: "12px 22px",
                  display: "flex", alignItems: "center", gap: 10,
                  fontWeight: 700, fontSize: 14, color: "#2D1B69",
                  boxShadow: "0 2px 12px rgba(45,27,105,0.08)", border: `1px solid ${t.accent}30`,
                  cursor: "pointer", transition: "border-color 0.4s, box-shadow 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.boxShadow = `0 4px 20px ${t.accent}30`)}
                onMouseOut={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(45,27,105,0.08)")}
              >
                <span style={{ fontSize: 22 }}>{u.emoji}</span> {u.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="landing-banner-pad" style={{
        background: `linear-gradient(135deg, ${t.primary} 0%, ${t.primary}CC 100%)`,
        padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden",
        transition: "background 0.4s",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg,${t.rainbowColors.join(",")})` }}/>
        {t.floatingEmojis.map((e, i) => (
          <div key={i} style={{ position: "absolute", fontSize: 28, opacity: 0.12, top: `${15 + i * 12}%`, left: i % 2 === 0 ? `${5 + i * 3}%` : undefined, right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined, pointerEvents: "none" }}>{e}</div>
        ))}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{t.icon}</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#fff", marginBottom: 16, fontFamily: "Playfair Display, serif" }}>
            Bereit für deine Wunschliste?
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>
            Kostenlos, in weniger als einer Minute. Kein Stress mehr bei Geschenken!
          </p>
          <button
            className="landing-cta-banner-btn"
            onClick={() => navigate(session ? "/dashboard" : "/sign-up")}
            style={{
              background: `linear-gradient(135deg,${t.accent},${t.accent}CC)`,
              color: "#fff", border: "none", borderRadius: 999,
              padding: "18px 48px", fontSize: 18, fontWeight: 800,
              cursor: "pointer", boxShadow: `0 12px 36px ${t.accent}55`,
              transition: "transform 0.2s, background 0.4s",
            }}
            onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            Jetzt kostenlos starten 🎁
          </button>
        </div>
      </section>     
    </div>
  );
}
