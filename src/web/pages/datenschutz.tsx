import { useLocation } from "wouter";
import { useTheme } from "@/lib/theme";

export default function Datenschutz() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isTeal = theme === "teal";

  const bg = isTeal ? "#0F1923" : "#FFF8F0";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const foreground = isTeal ? "#E8F5F3" : "#1A1A4E";
  const muted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const accent = isTeal ? "#2DD4BF" : "#FF6B8A";

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
      <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>{title}</h2>
      <div className="font-body text-sm leading-relaxed space-y-3" style={{ color: muted }}>
        {children}
      </div>
    </section>
  );

  const Divider = () => <div style={{ borderTop: `1px solid ${border}` }} className="mb-8" />;

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
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: foreground }}>Datenschutzerklärung</h1>
          <p className="font-body text-sm mb-8" style={{ color: muted }}>Stand: April 2026</p>

          {/* 1. Verantwortlicher */}
          <Section title="1. Verantwortlicher">
            <p>
              Verantwortlicher im Sinne der DSGVO ist:<br /><br />
              Marlene Uhrig (Einzelunternehmen)<br />
              Heidelberger Str. 79<br />
              12435 Berlin<br />
              Deutschland<br /><br />
              E-Mail: <a href="mailto:kontakt@wunschhimmel.com" style={{ color: accent }}>kontakt@wunschhimmel.com</a>
            </p>
          </Section>
          <Divider />

          {/* 2. Erhobene Daten */}
          <Section title="2. Welche Daten wir erheben">
            <p><strong style={{ color: foreground }}>Bei der Registrierung:</strong><br />
            Name (oder Spitzname), E-Mail-Adresse und Passwort (verschlüsselt gespeichert). Diese Angaben sind zur Nutzung des Dienstes erforderlich.</p>
            <p><strong style={{ color: foreground }}>Bei der Nutzung:</strong><br />
            Wunschlisten, Wünsche und Profilangaben, die du selbst einträgst. Außerdem technische Verbindungsdaten (IP-Adresse, Browser-Typ, Zugriffszeitpunkt), die beim Besuch der Website automatisch anfallen.</p>
            <p><strong style={{ color: foreground }}>Beim Teilen einer Liste:</strong><br />
            Personen, die über einen Teillink auf eine Liste zugreifen, können Wünsche reservieren. Dabei wird ein frei wählbarer Name gespeichert. Es wird kein Konto benötigt.</p>
          </Section>
          <Divider />

          {/* 3. Zweck und Rechtsgrundlage */}
          <Section title="3. Zweck der Verarbeitung und Rechtsgrundlage">
            <p>Wir verarbeiten deine Daten ausschließlich zum Betrieb von Wunschhimmel:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Bereitstellung und Verwaltung deines Kontos (Art. 6 Abs. 1 lit. b DSGVO – Vertragserfüllung)</li>
              <li>Versand von Benachrichtigungen (z. B. Reservierungen) per E-Mail (Art. 6 Abs. 1 lit. b DSGVO)</li>
              <li>Sicherheit und Missbrauchsschutz (Art. 6 Abs. 1 lit. f DSGVO – berechtigtes Interesse)</li>
              <li>Erfüllung gesetzlicher Pflichten (Art. 6 Abs. 1 lit. c DSGVO)</li>
            </ul>
          </Section>
          <Divider />

          {/* 4. Auftragsverarbeiter */}
          <Section title="4. Auftragsverarbeiter und Drittanbieter">
            <p>Wir setzen folgende externe Dienste ein, mit denen ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO besteht:</p>

            <div className="space-y-4 mt-2">
              <div className="rounded-xl p-4" style={{ background: isTeal ? "#1E3A4A" : "#FFF0F8", border: `1px solid ${border}` }}>
                <p className="font-semibold mb-1" style={{ color: foreground }}>Cloudflare, Inc.</p>
                <p>Zweck: DNS-Verwaltung, DDoS-Schutz, E-Mail-Weiterleitung (Email Routing)<br />
                Sitz: USA – abgesichert durch Data Processing Addendum (DPA) und EU-Standardvertragsklauseln (SCC)<br />
                DPA: <a href="https://www.cloudflare.com/cloudflare-customer-dpa/" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>cloudflare.com/cloudflare-customer-dpa</a></p>
              </div>

              <div className="rounded-xl p-4" style={{ background: isTeal ? "#1E3A4A" : "#FFF0F8", border: `1px solid ${border}` }}>
                <p className="font-semibold mb-1" style={{ color: foreground }}>Resend (Resend Inc.)</p>
                <p>Zweck: Versand von Transaktions-E-Mails (Registrierung, Passwort-Reset, Reservierungsbenachrichtigungen)<br />
                Sitz: USA – abgesichert durch DPA und SCCs<br />
                Datenschutz: <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>resend.com/privacy</a></p>
              </div>

              <div className="rounded-xl p-4" style={{ background: isTeal ? "#1E3A4A" : "#FFF0F8", border: `1px solid ${border}` }}>
                <p className="font-semibold mb-1" style={{ color: foreground }}>Amazon Partnerprogramm (Amazon Europe Core S.à r.l.)</p>
                <p>Zweck: Affiliate-Links zu Amazon-Produkten. Wenn du auf einen Produktlink klickst, kann Amazon Cookies setzen und Daten über das Klickverhalten erfassen.<br />
                Datenschutz: <a href="https://www.amazon.de/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>Amazon Datenschutzhinweis</a></p>
              </div>

              <div className="rounded-xl p-4" style={{ background: isTeal ? "#1E3A4A" : "#FFF0F8", border: `1px solid ${border}` }}>
                <p className="font-semibold mb-1" style={{ color: foreground }}>Awin AG</p>
                <p>Zweck: Affiliate-Marketing. Wunschhimmel ist Mitglied im Awin-Partnerprogramm. Wenn du auf Affiliate-Links klickst, kann Awin Cookies und ein Tracking-Pixel einsetzen, um die Vermittlung von Käufen nachzuverfolgen. Dabei können Daten wie IP-Adresse, Browser-Typ und Klickverhalten erhoben werden.<br /><br />
                Die Nutzung dieser Tracking-Technologien erfolgt nur mit deiner Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG.<br /><br />
                Sitz: Awin AG, Eichhornstraße 3, 10785 Berlin, Deutschland<br />
                Datenschutz: <a href="https://www.awin.com/de/rechtliches/datenschutzrichtlinie" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>awin.com/de/rechtliches/datenschutzrichtlinie</a></p>
              </div>
            </div>
          </Section>
          <Divider />

          {/* 5. Cookies */}
          <Section title="5. Cookies und lokale Speicherung">
            <p>Wunschhimmel verwendet ausschließlich technisch notwendige Cookies und den lokalen Browserspeicher (localStorage) für:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Aufrechterhaltung deiner Anmeldesitzung</li>
              <li>Speicherung deiner Theme-Einstellung</li>
            </ul>
            <p>Es werden keine Tracking- oder Werbe-Cookies eingesetzt. Eine Einwilligung ist daher für diese technisch notwendigen Cookies nicht erforderlich (§ 25 Abs. 2 TTDSG).</p>
          </Section>
          <Divider />

          {/* 6. Speicherdauer */}
          <Section title="6. Speicherdauer">
            <p>Deine Daten werden solange gespeichert, wie dein Konto aktiv ist. Nach Löschung deines Kontos werden alle personenbezogenen Daten innerhalb von 30 Tagen gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
            <p>Technische Verbindungsprotokolle werden nach spätestens 7 Tagen automatisch gelöscht.</p>
          </Section>
          <Divider />

          {/* 7. Deine Rechte */}
          <Section title="7. Deine Rechte">
            <p>Du hast gegenüber uns folgende Rechte bezüglich deiner personenbezogenen Daten:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong style={{ color: foreground }}>Auskunft</strong> (Art. 15 DSGVO) – Welche Daten wir über dich speichern</li>
              <li><strong style={{ color: foreground }}>Berichtigung</strong> (Art. 16 DSGVO) – Korrektur unrichtiger Daten</li>
              <li><strong style={{ color: foreground }}>Löschung</strong> (Art. 17 DSGVO) – „Recht auf Vergessenwerden"</li>
              <li><strong style={{ color: foreground }}>Einschränkung</strong> (Art. 18 DSGVO) – Eingeschränkte Verarbeitung</li>
              <li><strong style={{ color: foreground }}>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong style={{ color: foreground }}>Widerspruch</strong> (Art. 21 DSGVO) – Gegen Verarbeitungen auf Basis berechtigter Interessen</li>
            </ul>
            <p>Zur Ausübung dieser Rechte wende dich an: <a href="mailto:kontakt@wunschhimmel.com" style={{ color: accent }}>kontakt@wunschhimmel.com</a></p>
            <p>Du hast außerdem das Recht, dich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren. Für Berlin ist das die <strong style={{ color: foreground }}>Berliner Beauftragte für Datenschutz und Informationsfreiheit</strong> (<a href="https://www.datenschutz-berlin.de" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>datenschutz-berlin.de</a>).</p>
          </Section>
          <Divider />

          {/* 8. Datensicherheit */}
          <Section title="8. Datensicherheit">
            <p>Wunschhimmel überträgt alle Daten ausschließlich über verschlüsselte HTTPS-Verbindungen. Passwörter werden gehasht gespeichert und sind für uns nicht einsehbar. Wir treffen technische und organisatorische Maßnahmen zum Schutz deiner Daten gemäß Art. 32 DSGVO.</p>
          </Section>
          <Divider />

          {/* 9. Änderungen */}
          <Section title="9. Änderungen dieser Datenschutzerklärung">
            <p>Wir behalten uns vor, diese Datenschutzerklärung bei Änderungen des Dienstes oder der Rechtslage anzupassen. Die aktuelle Version ist stets unter <a href="/datenschutz" style={{ color: accent }}>wunschhimmel.com/datenschutz</a> abrufbar. Bei wesentlichen Änderungen werden registrierte Nutzer per E-Mail informiert.</p>
          </Section>
        </div>

      {/* Footer */}
<div className="text-center mt-8 font-body text-sm" style={{ color: muted }}>
  <button onClick={() => navigate("/")} style={{ color: accent }} className="hover:underline">
    Zurück zur Startseite
  </button>
  <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
  <button onClick={() => navigate("/impressum")} style={{ color: accent }} className="hover:underline">
    Impressum
  </button>
  <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
  <button onClick={() => navigate("/datenschutz")} style={{ color: accent }} className="hover:underline">
    Datenschutz
  </button>
  <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
  <button onClick={() => navigate("/agb")} style={{ color: accent }} className="hover:underline">
    AGB
  </button>
</div>
      </div>
    </div>
  );
}
