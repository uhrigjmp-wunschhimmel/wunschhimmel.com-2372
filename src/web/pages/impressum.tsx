import { useLocation } from "wouter";
import { useTheme } from "@/lib/theme";
import { ContactForm } from "@/components/ContactForm";

export default function Impressum() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isTeal = theme === "teal";
  const bg = isTeal ? "#0F1923" : "#FFF8F0";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const foreground = isTeal ? "#E8F5F3" : "#1A1A4E";
  const muted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const accent = isTeal ? "#2DD4BF" : "#FF6B8A";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: bg }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="font-body text-sm mb-6 block transition-colors hover:opacity-80"
          style={{ color: muted }}
        >
          ← Zurück
        </button>
        <div className="rounded-3xl p-8 md:p-10" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <h1 className="font-display text-3xl font-bold mb-8" style={{ color: foreground }}>Impressum</h1>

          {/* Angaben gemäß § 5 DDG */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>Angaben gemäß § 5 DDG</h2>
            <p className="font-body" style={{ color: muted, lineHeight: "1.8" }}>
              Marlene Uhrig<br />
              Einzelunternehmen<br />
              Heidelberger Str. 79<br />
              12435 Berlin<br />
              Deutschland
            </p>
          </section>

          <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />

          {/* Kontakt */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>Kontakt</h2>
            <p className="font-body mb-4" style={{ color: muted, lineHeight: "1.8" }}>
              E-Mail: <a href="mailto:kontakt@wunschhimmel.com" style={{ color: accent }}>kontakt@wunschhimmel.com</a>
            </p>
            <p className="font-body text-sm mb-4" style={{ color: muted }}>
              Du erreichst uns auch über das folgende Kontaktformular. Wir antworten in der Regel innerhalb von 48 Stunden (Mo–So).
            </p>
            <ContactForm />
          </section>

          <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />

          {/* Verantwortlich */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="font-body" style={{ color: muted, lineHeight: "1.8" }}>
              Marlene Uhrig<br />
              Heidelberger Str. 79<br />
              12435 Berlin
            </p>
          </section>

          <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />

          {/* Haftung für Inhalte */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>Haftung für Inhalte</h2>
            <p className="font-body text-sm leading-relaxed" style={{ color: muted }}>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="font-body text-sm leading-relaxed mt-3" style={{ color: muted }}>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />

          {/* Haftung für Links */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>Haftung für Links</h2>
            <p className="font-body text-sm leading-relaxed" style={{ color: muted }}>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
          </section>

          <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />

          {/* Urheberrecht */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>Urheberrecht</h2>
            <p className="font-body text-sm leading-relaxed" style={{ color: muted }}>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
          </section>

          <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />

          {/* Amazon Partnerprogramm */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>Hinweis zum Amazon Partnerprogramm</h2>
            <p className="font-body text-sm leading-relaxed" style={{ color: muted }}>
              Als Amazon-Partner verdiene ich an qualifizierten Verkäufen. Amazon und das Amazon-Logo sind Warenzeichen von Amazon.com, Inc. oder eines seiner verbundenen Unternehmen. Diese Website nutzt das Amazon-Partnerprogramm, ein Affiliate-Werbeprogramm, das es Websites ermöglicht, Werbeentgelte durch Werbung und Verlinkung zu Amazon.de zu verdienen.
            </p>
          </section>

          <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />

          {/* Steuerliche Angaben */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>Steuerliche Angaben</h2>
            <p className="font-body text-sm leading-relaxed" style={{ color: muted }}>
              Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).
            </p>
          </section>

          <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />

          {/* Footer */}
          <div className="text-center mt-8 font-body text-sm" style={{ color: muted }}>
            <button onClick={() => navigate("/")} style={{ color: accent }} className="hover:underline">
              Zurück zur Startseite
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
