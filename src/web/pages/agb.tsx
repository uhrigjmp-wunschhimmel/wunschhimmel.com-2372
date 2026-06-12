import { useEffect } from "react";

export default function AGBPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{
      backgroundColor: "#FDF8FC",
      minHeight: "100vh",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #122050, #1A2E65)",
        padding: "48px 24px 40px",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#F25990",
          margin: "0 0 12px",
        }}>
          Rechtliches
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 700,
          color: "#FFFFFF",
          margin: "0 0 12px",
        }}>
          Allgemeine Geschäftsbedingungen
        </h1>
        <p style={{ fontSize: 14, color: "#96ADDA", margin: 0 }}>
          Stand: Mai 2026 · wunschhimmel.com
        </p>
      </div>

      {/* Hinweis-Banner */}
      <div style={{
        backgroundColor: "#FFF0F5",
        borderBottom: "1px solid #FFB3D1",
        padding: "12px 24px",
        textAlign: "center",
        fontSize: 13,
        color: "#8A1A43",
      }}>
        Dieses Dokument wurde sorgfältig erstellt. Vor rechtlich verbindlicher Nutzung empfehlen wir eine anwaltliche Prüfung.
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}>

        {/* Inhaltsverzeichnis */}
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #F0D5E5",
          borderRadius: 20,
          padding: "28px 32px",
          marginBottom: 48,
          boxShadow: "0 4px 16px rgba(210,59,114,0.08)",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#122050",
            margin: "0 0 16px",
          }}>
            Inhaltsverzeichnis
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "6px 24px" }}>
            {[
              ["§ 1", "Geltungsbereich und Vertragsparteien"],
              ["§ 2", "Leistungsbeschreibung"],
              ["§ 3", "Registrierung und Nutzerkonto"],
              ["§ 4", "Pflichten und Verhalten der Nutzerin"],
              ["§ 5", "Inhalte und Nutzungsrechte"],
              ["§ 5a", "Öffentliche Wunschlisten und Profilsichtbarkeit"],
              ["§ 6", "Affiliate-Links und Produktempfehlungen"],
              ["§ 7", "Laufzeit und Kündigung"],
              ["§ 8", "Haftungsbeschränkung"],
              ["§ 9", "Datenschutz"],
              ["§ 10", "Änderungen der AGB"],
              ["§ 11", "Schlussbestimmungen"],
            ].map(([para, title]) => (
              <a
                key={para}
                href={`#${para.replace(" ", "").replace("§", "para")}`}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "baseline",
                  textDecoration: "none",
                  padding: "4px 0",
                  color: "#1A2E65",
                  fontSize: 14,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F25990")}
                onMouseLeave={e => (e.currentTarget.style.color = "#1A2E65")}
              >
                <span style={{ fontWeight: 700, minWidth: 36, color: "#F25990", fontSize: 13 }}>{para}</span>
                <span>{title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Paragraphen */}
        <Section id="para1" title="§ 1  Geltungsbereich und Vertragsparteien">
          <P>(1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für die Nutzung der Plattform Wunschhimmel, erreichbar unter https://wunschhimmel.com, sowie der zugehörigen mobilen Anwendungen (nachfolgend gemeinsam „Plattform").</P>
          <P>(2) Anbieterin der Plattform ist:</P>
          <div style={{ margin: "8px 0 8px 20px", lineHeight: 1.8, fontSize: 15, color: "#1A2E65", fontWeight: 600 }}>
            Marlene Uhrig<br />
            Heidelberger Str. 79, 12435 Berlin<br />
            E-Mail: kontakt@wunschhimmel.com
          </div>
          <P style={{ marginTop: 4 }}>(nachfolgend „Anbieterin")</P>
          <P>(3) Die Plattform richtet sich ausschließlich an Verbraucherinnen und Verbraucher im Sinne des § 13 BGB, die das 18. Lebensjahr vollendet haben und ihren Wohnsitz in der Europäischen Union haben.</P>
          <P>(4) Es gelten ausschließlich diese AGB. Abweichende Bedingungen der Nutzerin (die feminine Form schließt alle Geschlechter ein) werden nicht anerkannt, es sei denn, die Anbieterin stimmt ihrer Geltung ausdrücklich schriftlich zu.</P>
        </Section>

        <Section id="para2" title="§ 2  Leistungsbeschreibung">
          <P>(1) Wunschhimmel ist eine kostenlose Online-Plattform, die es registrierten Nutzerinnen ermöglicht:</P>
          <ul style={{ margin: "8px 0 8px 20px", padding: 0, listStyle: "none" }}>
            {[
              "Wunschlisten zu erstellen, zu verwalten und zu teilen",
              "Wünsche mit Produktlinks, Beschreibungen, Bildern und Prioritäten zu versehen",
              "Wunschlisten per Link oder E-Mail mit Dritten zu teilen",
              "Wünsche durch Dritte reservieren zu lassen",
              "Den KI-gestützten Wunschengel-Chat zur Geschenkfindung zu nutzen (nur für eingeloggte Mitglieder)",
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 15, color: "#5A3A4A", lineHeight: 1.6 }}>
                <span style={{ color: "#F25990", flexShrink: 0, marginTop: 2 }}>✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <P>(2) Die Plattform ist kostenlos nutzbar. Da es sich um einen unentgeltlichen Dienst handelt, besteht kein gesetzliches Widerrufsrecht. Die Anbieterin behält sich vor, künftig kostenpflichtige Premium-Funktionen einzuführen. Bestehende kostenlose Funktionen bleiben hiervon unberührt, solange nichts anderes angekündigt wird.</P>
          <P>(3) Die Anbieterin bemüht sich um eine möglichst hohe Verfügbarkeit der Plattform. Eine Verfügbarkeitsgarantie wird nicht übernommen. Wartungsarbeiten, technische Störungen sowie Umstände außerhalb des Einflussbereichs der Anbieterin können zu vorübergehenden Einschränkungen führen.</P>
          <P>(4) Die Anbieterin ist berechtigt, Funktionen der Plattform jederzeit zu ändern, zu erweitern oder einzustellen, sofern dies der Nutzerin zumutbar ist.</P>
        </Section>

        <Section id="para3" title="§ 3  Registrierung und Nutzerkonto">
          <P>(1) Die Nutzung der Plattform in vollem Umfang setzt eine kostenlose Registrierung voraus. Zur Registrierung sind folgende Angaben erforderlich: E-Mail-Adresse, Anzeigename (Pseudonym möglich) und Passwort.</P>
          <P>(2) Mit Abschluss der Registrierung kommt zwischen der Nutzerin und der Anbieterin ein Nutzungsvertrag zustande. Voraussetzung ist die Akzeptanz dieser AGB sowie der Datenschutzerklärung.</P>
          <P>(3) Die Nutzerin ist verpflichtet, ihre Zugangsdaten vertraulich zu behandeln und vor dem Zugriff Dritter zu schützen. Bei Verdacht auf unbefugten Zugriff ist die Anbieterin unverzüglich zu informieren.</P>
          <P>(4) Pro Person ist nur ein Nutzerkonto zulässig. Die Übertragung des Kontos auf Dritte ist nicht gestattet.</P>
          <P>(5) Die Anbieterin speichert den Zeitpunkt und die Version der AGB-Akzeptanz als Nachweis der Einwilligung.</P>
        </Section>

        <Section id="para4" title="§ 4  Pflichten und Verhalten der Nutzerin">
          <P>(1) Die Nutzerin verpflichtet sich, die Plattform ausschließlich bestimmungsgemäß und im Einklang mit diesen AGB sowie den geltenden Gesetzen zu nutzen.</P>
          <P>(2) Es ist der Nutzerin insbesondere untersagt:</P>
          <ul style={{ margin: "8px 0 8px 20px", padding: 0, listStyle: "none" }}>
            {[
              "Inhalte zu veröffentlichen, die rechtswidrig, beleidigend, diskriminierend, pornografisch oder gewaltverherrlichend sind",
              "Inhalte hochzuladen, an denen keine Nutzungsrechte bestehen (z. B. urheberrechtlich geschützte Bilder ohne Erlaubnis)",
              "Die Plattform für gewerbliche Zwecke zu nutzen, ohne vorherige Zustimmung der Anbieterin",
              "Automatisierte Abfragen (Bots, Scraping) durchzuführen",
              "Sicherheitsmechanismen der Plattform zu umgehen oder zu manipulieren",
              "Dritte durch die Nutzung der Plattform zu belästigen oder zu schädigen",
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 15, color: "#5A3A4A", lineHeight: 1.6 }}>
                <span style={{ color: "#D93B72", flexShrink: 0, marginTop: 2 }}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <P>(3) Die Nutzerin ist für alle von ihr eingestellten Inhalte (Wunschtitel, Beschreibungen, Bilder) selbst verantwortlich. Sie stellt sicher, dass diese Inhalte keine Rechte Dritter verletzen.</P>
        </Section>

        <Section id="para5" title="§ 5  Inhalte und Nutzungsrechte">
          <P>(1) Die Nutzerin behält alle Rechte an den von ihr hochgeladenen Inhalten (Texte, Bilder etc.).</P>
          <P>(2) Mit dem Hochladen von Inhalten räumt die Nutzerin der Anbieterin ein nicht-exklusives, übertragbares, weltweites und kostenloses Nutzungsrecht ein, die Inhalte zum Zweck des Betriebs und der Darstellung der Plattform zu speichern, zu verarbeiten und anzuzeigen. Dieses Recht erlischt mit Löschung der Inhalte bzw. des Kontos.</P>
          <P>(3) Die Anbieterin ist berechtigt, offensichtlich rechtswidrige Inhalte ohne vorherige Ankündigung zu entfernen.</P>
        </Section>

        {/* §5a — NEU */}
        <Section id="para5a" title="§ 5a  Öffentliche Wunschlisten und Profilsichtbarkeit" isNew>
          <P>(1) Wunschhimmel bietet Nutzerinnen die Möglichkeit, ihre Wunschlisten als öffentlich zu kennzeichnen. Öffentliche Listen sind über einen teilbaren Link für Personen ohne Konto einsehbar. Standardmäßig sind alle Listen privat.</P>
          <P>(2) Die Aktivierung einer öffentlichen Liste setzt die ausdrückliche Einwilligung der Nutzerin voraus. Diese Einwilligung umfasst die Zustimmung, dass ihr Anzeigename sowie ihr Profilbild (sofern hinterlegt) auf der öffentlichen Liste für eingeloggte Nutzerinnen des Dienstes sichtbar sind.</P>
          <P>(3) Nicht eingeloggte Besucherinnen können den Inhalt einer öffentlichen Liste einsehen, jedoch werden Anzeigename und Profilbild in dieser Ansicht nicht angezeigt.</P>
          <P>(4) Die Anbieterin weist darauf hin, dass öffentliche Listen technisch von beliebigen Personen mit Kenntnis des Links aufgerufen werden können. Die Anbieterin übernimmt keine Haftung für die Weiterverbreitung des Links oder des sichtbaren Listeninhalts durch Dritte.</P>
          <P>(5) Die Nutzerin kann die Einwilligung jederzeit widerrufen, indem sie die betreffende Liste in den Einstellungen wieder auf privat stellt. Nach dem Widerruf sind Name und Profilbild nicht mehr sichtbar. Ein Widerruf löscht keine bereits von Dritten gespeicherten Kopien des Listeninhalts.</P>
          <P>(6) Die Aktivierung öffentlicher Listen steht ausschließlich volljährigen Nutzerinnen oder Nutzerinnen zu, die mit nachweisbarer Zustimmung einer erziehungsberechtigten Person handeln. Nutzerinnen unter 16 Jahren dürfen öffentliche Listen ohne elterliche Einwilligung nicht aktivieren.</P>
        </Section>

        <Section id="para6" title="§ 6  Affiliate-Links und Produktempfehlungen">
          <P>(1) Wunschhimmel nimmt am Amazon PartnerNet und dem Awin-Affiliate-Netzwerk teil. Produktlinks auf der Plattform können Affiliate-Links sein. Wenn Nutzerinnen über diese Links Produkte kaufen, erhält die Anbieterin eine Provision vom jeweiligen Händler. Affiliate-Links sind auf der Plattform entsprechend gekennzeichnet.</P>
          <P>(2) Die Provision verändert den Kaufpreis für die Nutzerin nicht.</P>
          <P>(3) Der gesetzlich vorgeschriebene Pflichthinweis gemäß den Amazon-Partnerprogramm-Richtlinien „Als Amazon-Partner verdiene ich an qualifizierten Verkäufen" ist dauerhaft und gut sichtbar auf jeder Seite angebracht, auf der Amazon-Affiliate-Links erscheinen.</P>
          <P>(4) Der „Wunschengel"-Chat ist ein KI-gestütztes Hilfsmittel zur Inspiration bei der Geschenk- und Wunschfindung. Die Vorschläge basieren auf verfügbaren Partnerangeboten und den Angaben der Nutzerin. Die angezeigten Ergebnisse sind keine vollständige oder neutrale Marktübersicht. Produktverfügbarkeit, Preise und Verlinkungen können sich jederzeit ändern.</P>
          <P>(5) Der Wunschengel stellt keine Rechts-, Finanz-, Medizin- oder sonstige Fachberatung dar und ersetzt keine individuelle Prüfung.</P>
          <P>(6) Die Anbieterin übernimmt keine Gewähr für Richtigkeit, Vollständigkeit oder Eignung der KI-Ausgaben für einen bestimmten Zweck. Zwingende gesetzliche Haftung bleibt unberührt.</P>
          <P>(7) Die Nutzerin darf den Wunschengel nicht dazu verwenden, rechtswidrige Inhalte zu erzeugen oder Dritte zu belästigen.</P>
          <P>(8) Die Anbieterin übernimmt keine Haftung für die Verfügbarkeit, Qualität, Sicherheit oder den Preis verlinkter Produkte auf externen Plattformen.</P>
        </Section>

        <Section id="para7" title="§ 7  Laufzeit und Kündigung">
          <P>(1) Der Nutzungsvertrag wird auf unbestimmte Zeit geschlossen.</P>
          <P>(2) Die Nutzerin kann den Vertrag jederzeit ohne Angabe von Gründen kündigen, indem sie ihr Konto löscht. Die Account-Löschfunktion ist unter Einstellungen / Profil verfügbar.</P>
          <P>(3) Nach Bestätigung der Löschung werden alle personenbezogenen Daten der Nutzerin gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Daten, die aufgrund steuerrechtlicher (§ 147 AO: 6–10 Jahre) oder handelsrechtlicher (§ 257 HGB: 6–10 Jahre) Vorschriften aufzubewahren sind, werden nach Ablauf der jeweiligen Frist gelöscht.</P>
          <P>(4) Die Anbieterin ist berechtigt, das Konto einer Nutzerin mit sofortiger Wirkung zu sperren oder zu löschen, wenn die Nutzerin gegen diese AGB verstößt, ein begründeter Verdacht auf missbräuchliche Nutzung besteht oder gesetzliche Verpflichtungen dies erfordern.</P>
          <P>(5) Mit Beendigung des Nutzungsvertrags werden alle personenbezogenen Daten der Nutzerin gemäß der Datenschutzerklärung und den geltenden gesetzlichen Aufbewahrungsfristen gelöscht.</P>
        </Section>

        <Section id="para8" title="§ 8  Haftungsbeschränkung">
          <P>(1) Die Anbieterin haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für vorsätzlich oder grob fahrlässig verursachte Schäden.</P>
          <P>(2) Für leicht fahrlässig verursachte Schäden haftet die Anbieterin nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht) und nur bis zur Höhe des vorhersehbaren, vertragstypischen Schadens.</P>
          <P>(3) Vorbehaltlich der Regelungen in Abs. 1 und 2 haftet die Anbieterin nicht für: Inhalte externer Websites, die über Affiliate-Links erreichbar sind; Schäden durch nicht autorisierte Nutzung des Kontos der Nutzerin; Datenverluste durch höhere Gewalt; Empfehlungen des KI-Wunschengels.</P>
          <P>(4) Die Haftungsbeschränkungen gelten nicht, soweit die Anbieterin einen Schaden arglistig verschwiegen oder eine Garantie übernommen hat.</P>
        </Section>

        <Section id="para9" title="§ 9  Datenschutz">
          <P>(1) Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung von Wunschhimmel, abrufbar unter <a href="/datenschutz" style={{ color: "#F25990", textDecoration: "none" }}>wunschhimmel.com/datenschutz</a>.</P>
          <P>(2) Mit der Registrierung bestätigt die Nutzerin, die Datenschutzerklärung zur Kenntnis genommen zu haben.</P>
          <P>(3) Die Nutzerin hat das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung ihrer personenbezogenen Daten. Anfragen sind zu richten an: <a href="mailto:kontakt@wunschhimmel.com" style={{ color: "#F25990", textDecoration: "none" }}>kontakt@wunschhimmel.com</a>.</P>
        </Section>

        <Section id="para10" title="§ 10  Änderungen der AGB">
          <P>(1) Die Anbieterin behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern. Über Änderungen wird die Nutzerin per E-Mail oder durch einen deutlichen Hinweis auf der Plattform informiert, und zwar mindestens 30 Tage vor Inkrafttreten der Änderungen.</P>
          <P>(2) Änderungen der AGB bedürfen der aktiven Zustimmung der Nutzerin. Bei der nächsten Anmeldung nach Zugang der Änderungsbenachrichtigung wird die Nutzerin aufgefordert, den geänderten AGB durch aktives Bestätigen zuzustimmen. Eine stillschweigende Zustimmung durch bloße Weiternutzung ist nicht möglich.</P>
          <P>(3) Stimmt die Nutzerin den geänderten AGB nicht zu, ist die Anbieterin berechtigt, das Nutzungsverhältnis zum Zeitpunkt des Inkrafttretens der Änderungen zu beenden.</P>
        </Section>

        <Section id="para11" title="§ 11  Schlussbestimmungen">
          <P>(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Für Verbraucherinnen in der EU gelten zusätzlich die zwingenden Schutzvorschriften des jeweiligen Wohnsitzlandes.</P>
          <P>(2) Gegenüber Verbraucherinnen gelten die gesetzlichen Gerichtsstände. Gegenüber Unternehmerinnen ist – soweit gesetzlich zulässig – ausschließlicher Gerichtsstand Berlin.</P>
          <P>(3) Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" style={{ color: "#F25990", textDecoration: "none" }}>https://ec.europa.eu/consumers/odr</a>. Die Anbieterin ist nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</P>
          <P>(4) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</P>
        </Section>

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

// ─── Hilfskomponenten ─────────────────────────────────────────

function Section({
  id,
  title,
  children,
  isNew = false,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  isNew?: boolean;
}) {
  return (
    <div
      id={id}
      style={{
        backgroundColor: "#FFFFFF",
        border: isNew ? "2px solid #F25990" : "1px solid #F0D5E5",
        borderRadius: 20,
        padding: "28px 32px",
        marginBottom: 20,
        boxShadow: isNew
          ? "0 4px 20px rgba(242,89,144,0.15)"
          : "0 2px 8px rgba(18,32,80,0.05)",
        scrollMarginTop: 24,
        position: "relative",
      }}
    >
      {isNew && (
        <span style={{
          position: "absolute",
          top: -12,
          left: 24,
          backgroundColor: "#F25990",
          color: "#FFFFFF",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "3px 10px",
          borderRadius: 50,
        }}>
          Neu
        </span>
      )}
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 20,
        fontWeight: 700,
        color: "#122050",
        margin: "0 0 16px",
        paddingBottom: 12,
        borderBottom: `2px solid ${isNew ? "#FFB3D1" : "#F0D5E5"}`,
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontSize: 15,
      color: "#5A3A4A",
      lineHeight: 1.75,
      margin: "0 0 10px",
      ...style,
    }}>
      {children}
    </p>
  );
}
