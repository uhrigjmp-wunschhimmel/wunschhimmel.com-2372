import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();

  return (
    <div style={{ minHeight: "100vh", background: "#FFFBF5", fontFamily: "Plus Jakarta Sans, sans-serif", overflowX: "hidden" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 100, paddingBottom: 0, position: "relative", background: "linear-gradient(180deg, #FFF5F8 0%, #FFFBF5 100%)" }}>

        {/* Rainbow arc background */}
        <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", width: "min(900px, 100%)", pointerEvents: "none", zIndex: 0 }}>
          <svg viewBox="0 0 900 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", opacity: 0.18 }}>
            <path d="M50,400 Q450,-100 850,400" stroke="#FF6B6B" strokeWidth="32" fill="none" strokeLinecap="round"/>
            <path d="M80,400 Q450,-60 820,400" stroke="#FF9F40" strokeWidth="28" fill="none" strokeLinecap="round"/>
            <path d="M110,400 Q450,-20 790,400" stroke="#FFD93D" strokeWidth="26" fill="none" strokeLinecap="round"/>
            <path d="M140,400 Q450,20 760,400" stroke="#6BCB77" strokeWidth="24" fill="none" strokeLinecap="round"/>
            <path d="M170,400 Q450,55 730,400" stroke="#4D96FF" strokeWidth="22" fill="none" strokeLinecap="round"/>
            <path d="M200,400 Q450,90 700,400" stroke="#C77DFF" strokeWidth="20" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Floating deco elements */}
        {[
          { emoji: "🎈", top: 120, left: "8%", size: 36, rot: -15 },
          { emoji: "⭐", top: 160, right: "10%", size: 28, rot: 20 },
          { emoji: "🎀", top: 220, left: "4%", size: 30, rot: 10 },
          { emoji: "✨", top: 140, right: "6%", size: 32, rot: -10 },
          { emoji: "🎊", top: 300, left: "12%", size: 26, rot: 5 },
          { emoji: "💫", top: 280, right: "14%", size: 24, rot: -20 },
        ].map((el, i) => (
          <div key={i} style={{
            position: "absolute", top: el.top,
            ...(el.left ? { left: el.left } : { right: (el as any).right }),
            fontSize: el.size, transform: `rotate(${el.rot}deg)`,
            pointerEvents: "none", zIndex: 1, opacity: 0.7,
          }}>{el.emoji}</div>
        ))}

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 2 }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#FFE8F0", color: "#D63384",
            borderRadius: 999, padding: "8px 20px", fontSize: 13,
            fontWeight: 700, marginBottom: 24,
            fontFamily: "Plus Jakarta Sans, Arial, sans-serif",
          }}>
            🌈 Kostenlos
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800,
            lineHeight: 1.15, marginBottom: 20, color: "#2D1B69",
            fontFamily: "Playfair Display, serif",
          }}>
            Die virtuelle{" "}
            <span style={{
              background: "linear-gradient(135deg, #FF6B8A, #FF8FA3)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Wunschkiste
            </span>
            <br />für deinen Kindergeburtstag 🎂
          </h1>

          <p style={{ fontSize: 18, color: "#7B6B8D", lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" }}>
            Erstelle eine bunte Wunschliste, teile sie mit Familie & Freunden —
            und sag Tschüss zu doppelten Geschenken!
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <button
              onClick={() => navigate(session ? "/dashboard" : "/sign-up")}
              style={{
                background: "linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%)",
                color: "#fff", border: "none", borderRadius: 999,
                padding: "16px 36px", fontSize: 16, fontWeight: 700,
                cursor: "pointer", boxShadow: "0 8px 28px rgba(255,107,138,0.35)",
                transition: "transform 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              Wunschkiste erstellen 🎁
            </button>
            <button
              onClick={() => navigate("/explore")}
              style={{
                background: "#fff", color: "#2D1B69", border: "2px solid #E0D4FF",
                borderRadius: 999, padding: "16px 36px", fontSize: 16, fontWeight: 700,
                cursor: "pointer", transition: "transform 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              Beispiele ansehen ✨
            </button>
          </div>

          {/* Trust bar */}
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 56 }}>
            {[
              { icon: "🎈", text: "Kostenlos" },
              { icon: "🌈", text: "Kinderleicht" },
              { icon: "🎁", text: "Keine Doppelgeschenke" },
              { icon: "💌", text: "Per Link teilen" },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#7B6B8D" }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span> {t.text}
              </div>
            ))}
          </div>

          {/* App mockup card */}
          <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: 480 }}>
            <div style={{
              background: "#fff", borderRadius: 28, boxShadow: "0 24px 64px rgba(45,27,105,0.12)",
              padding: 28, textAlign: "left", border: "1px solid #F0E8FF",
            }}>
              {/* List header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#FFD93D,#FF9F40)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🎂</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#2D1B69" }}>Lenas 6. Geburtstag 🎉</div>
                  <div style={{ fontSize: 12, color: "#A89BBD", marginTop: 2 }}>4 Wünsche · Geteilt mit Familie</div>
                </div>
              </div>
              {/* Wish items */}
              {[
                { icon: "🧸", name: "Großes Kuscheltier", price: "€29", color: "#FFE8F0", reserved: false },
                { icon: "🎨", name: "Malset Deluxe", price: "€24", color: "#E8F5FF", reserved: true },
                { icon: "📚", name: "Bücherset Conni", price: "€18", color: "#F0FFE8", reserved: false },
                { icon: "🎠", name: "Karussell-Spielzeug", price: "€35", color: "#F5E8FF", reserved: false },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 14, marginBottom: 8,
                  background: item.color,
                }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#2D1B69" }}>{item.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B8A" }}>{item.price}</div>
                  </div>
                  {item.reserved ? (
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "#6BCB77", color: "#fff", fontWeight: 700 }}>✓ Reserviert</span>
                  ) : (
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, border: "1.5px solid #FF6B8A", color: "#FF6B8A", fontWeight: 700 }}>Schenken</span>
                  )}
                </div>
              ))}
            </div>
            {/* Floating badge */}
            <div style={{
              position: "absolute", top: -14, right: -14,
              background: "linear-gradient(135deg,#6BCB77,#4DAF5F)",
              color: "#fff", borderRadius: 999, padding: "8px 14px",
              fontSize: 12, fontWeight: 700, boxShadow: "0 4px 16px rgba(107,203,119,0.4)",
            }}>🔒 Doppelschutz aktiv</div>
            <div style={{
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
      <section style={{ background: "#FFF0F8", padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B8A", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>So einfach geht's</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#2D1B69", marginBottom: 48, fontFamily: "Playfair Display, serif" }}>
            In 3 Schritten zur perfekten Wunschliste 🌟
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { step: "1", icon: "📝", title: "Liste erstellen", desc: "Lege deine bunte Wunschkiste an — mit Fotos, Preisen und Links.", color: "#E0D4FF", accent: "#9B59B6" },
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
        {/* Wave */}
        <div style={{ marginTop: 72, marginLeft: -24, marginRight: -24 }}>
          <svg viewBox="0 0 1440 70" style={{ width: "100%", display: "block", height: 70 }} preserveAspectRatio="none">
            <path fill="#FFFBF5" d="M0,40 C480,0 960,70 1440,20 L1440,70 L0,70 Z"/>
          </svg>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{ background: "#FFFBF5", padding: "72px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B8A", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Features</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#2D1B69", fontFamily: "Playfair Display, serif" }}>
              Alles was Eltern brauchen ✨
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
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
                boxShadow: "0 2px 16px rgba(45,27,105,0.06)", border: "1px solid #F0E8FF",
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
      <section style={{ background: "#F5F0FF", padding: "72px 24px" }}>
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
              { emoji: "🎓", label: "Schulanfang / Einschulung" },
              { emoji: "🥳", label: "Erwachsenengeburtstag" },
              { emoji: "💝", label: "Valentinstag" },
            ].map((u, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 999, padding: "12px 22px",
                display: "flex", alignItems: "center", gap: 10,
                fontWeight: 700, fontSize: 14, color: "#2D1B69",
                boxShadow: "0 2px 12px rgba(45,27,105,0.08)", border: "1px solid #E0D4FF",
              }}>
                <span style={{ fontSize: 22 }}>{u.emoji}</span> {u.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #2D1B69 0%, #1A1A4E 100%)",
        padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Rainbow top border */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg,#FF6B6B,#FF9F40,#FFD93D,#6BCB77,#4D96FF,#C77DFF)" }}/>
        {/* Deco */}
        {["🎈","🌟","🎊","✨","🎀","💫"].map((e, i) => (
          <div key={i} style={{ position: "absolute", fontSize: 28, opacity: 0.15, top: `${15 + i * 12}%`, left: i % 2 === 0 ? `${5 + i * 3}%` : undefined, right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined, pointerEvents: "none" }}>{e}</div>
        ))}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🌈</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#fff", marginBottom: 16, fontFamily: "Playfair Display, serif" }}>
            Bereit für die erste Wunschkiste?
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>
            Kostenlos, in weniger als einer Minute. Kein Stress mehr bei Geschenken!
          </p>
          <button
            onClick={() => navigate(session ? "/dashboard" : "/sign-up")}
            style={{
              background: "linear-gradient(135deg,#FF6B8A,#FF8FA3)",
              color: "#fff", border: "none", borderRadius: 999,
              padding: "18px 48px", fontSize: 18, fontWeight: 800,
              cursor: "pointer", boxShadow: "0 12px 36px rgba(255,107,138,0.45)",
              transition: "transform 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            Jetzt kostenlos starten 🎁
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ background: "#1A1A4E", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#FFD6D6", marginBottom: 4, fontFamily: "Playfair Display, serif" }}>Wunschhimmel</div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 12 }}>
          Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          <button onClick={() => navigate("/impressum")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer" }}>Impressum</button>
          <button onClick={() => navigate("/impressum")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer" }}>Datenschutz</button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 12 }}>© {new Date().getFullYear()} Wunschhimmel</p>
      </footer>

    </div>
  );
}
