import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { authClient } from "@/lib/auth";

export default function LandingPage() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();

  const isTeal = theme === "teal";
  const accent = isTeal ? "#2DD4BF" : "#FF6B8A";
  const navy = isTeal ? "#0F1923" : "#1A1A4E";
  const rose = isTeal ? "#1E3040" : "#FFD6D6";
  const lavender = isTeal ? "#1A3545" : "#E8DEFF";
  const textMuted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const bg = isTeal ? "#0F1923" : "#FFF8F0";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const foreground = isTeal ? "#E8F5F3" : "#1A1A4E";

  const features = [
    { icon: "🔗", title: t("feat1_title"), desc: t("feat1_desc") },
    { icon: "📨", title: t("feat2_title"), desc: t("feat2_desc") },
    { icon: "🎀", title: t("feat3_title"), desc: t("feat3_desc") },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg, color: foreground }}>
      {/* Hero */}
      <section className="blob-bg pt-32 pb-0 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 text-sm font-body font-semibold px-4 py-2 rounded-full mb-6"
            style={{ background: rose, color: navy }}
          >
            <span>✦</span> Kostenlos & ohne Kreditkarte
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: foreground }}>
            {t("hero_title").split("\n").map((line, i) => (
              <span key={i}>
                {i === 1 ? <em style={{ color: accent }} className="not-italic">{line}</em> : line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>

          <p className="font-body text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: textMuted }}>
            {t("hero_sub")}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate(session ? "/dashboard" : "/sign-up")}
              className="font-body font-semibold px-8 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
              style={{ background: accent, color: isTeal ? navy : "#fff", boxShadow: `0 8px 24px ${accent}40` }}
            >
              {t("hero_cta")} ✨
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="font-body font-semibold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
              style={{ background: navy, color: isTeal ? "#2DD4BF" : "#fff", border: isTeal ? `1px solid #1E3A4A` : "none" }}
            >
              {t("hero_explore")}
            </button>
          </div>

          {/* Mock preview */}
          <div className="mt-16 relative">
            <div
              className="rounded-3xl shadow-2xl p-6 max-w-lg mx-auto"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎂</span>
                <div>
                  <div className="font-display font-bold" style={{ color: foreground }}>Meine Geburtstagsliste</div>
                  <div className="text-xs font-body" style={{ color: textMuted }}>3 Wünsche · Privat</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Nike Air Max 2024", price: "€129", img: "👟", reserved: false },
                  { name: "Kindle Paperwhite", price: "€149", img: "📚", reserved: true },
                  { name: "Spotify Premium", price: "€12/Mo", img: "🎵", reserved: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: isTeal ? "#1A2D3E" : "#FFF8F0" }}
                  >
                    <span className="text-2xl">{item.img}</span>
                    <div className="flex-1">
                      <div className="font-body font-semibold text-sm" style={{ color: foreground }}>{item.name}</div>
                      <div className="text-xs font-body font-bold" style={{ color: accent }}>{item.price}</div>
                    </div>
                    {item.reserved ? (
                      <span className="text-xs px-2 py-1 rounded-full font-body" style={{ background: lavender, color: foreground }}>✓ Reserviert</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full font-body" style={{ border: `1px solid ${accent}`, color: accent }}>Reservieren</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="absolute -top-4 -right-4 text-xs font-body font-semibold px-3 py-2 rounded-full shadow-lg hidden md:block"
              style={{ background: navy, color: isTeal ? "#2DD4BF" : "white", border: isTeal ? `1px solid #1E3A4A` : "none" }}
            >
              🔗 Link → Produkt ✓
            </div>
            <div
              className="absolute -bottom-4 -left-4 text-xs font-body font-semibold px-3 py-2 rounded-full shadow-lg hidden md:block"
              style={{ background: accent, color: isTeal ? navy : "#fff" }}
            >
              📨 Per E-Mail teilen
            </div>
          </div>
        </div>

        <div className="mt-20">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ height: 60, display: "block" }}>
            <path fill={bg} d="M0,0 C360,60 1080,0 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: bg }} className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16" style={{ color: foreground }}>
            {t("features_title")} <span style={{ color: accent }}>✦</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                style={{ background: cardBg, border: `1px solid ${border}` }}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: foreground }}>{f.title}</h3>
                <p className="font-body leading-relaxed" style={{ color: textMuted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: navy }} className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-8 text-8xl" style={{ color: accent }}>✦</div>
          <div className="absolute bottom-8 right-8 text-8xl" style={{ color: accent }}>✦</div>
          <div className="absolute top-1/2 left-1/3 text-6xl" style={{ color: accent }}>✦</div>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">
            Bereit für deine <em style={{ color: isTeal ? "#2DD4BF" : "#FFD6D6" }} className="not-italic">erste Liste?</em>
          </h2>
          <p className="font-body text-white/70 text-lg mb-8">Kostenlos, in weniger als einer Minute.</p>
          <button
            onClick={() => navigate(session ? "/dashboard" : "/sign-up")}
            className="font-body font-semibold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
            style={{ background: accent, color: isTeal ? navy : "#fff" }}
          >
            Jetzt starten ✨
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: navy, borderTop: `1px solid ${border}` }} className="py-8 text-center font-body">
        <p className="text-white/40 text-sm mb-2">© {new Date().getFullYear()} Wunschhimmel</p>
        <p className="text-white/30 text-xs max-w-lg mx-auto px-4 mb-3">
          Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.
        </p>
        <button onClick={() => navigate("/impressum")} className="text-white/30 hover:text-white/60 text-xs transition-colors">
          Impressum
        </button>
      </footer>
    </div>
  );
}
