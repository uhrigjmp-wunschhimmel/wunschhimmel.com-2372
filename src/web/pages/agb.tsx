import { useLocation } from "wouter";
import { useTheme } from "@/lib/theme";

export default function AGBPage() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isPine = theme === "pine";

  const bg = isPine ? "#F1FDF4" : "#FFF8F0";
  const cardBg = isPine ? "#FFFFFF" : "#FFFFFF";
  const border = isPine ? "#6EE7B7" : "#EAD9D9";
  const foreground = isPine ? "#1A3A2A" : "#1A1A4E";
  const muted = isPine ? "#10B981" : "#6B6B9A";
  const accent = isPine ? "#10B981" : "#FF6B8A";
  const sectionBg = isPine ? "#E8FAF0" : "#FFFBFF";
  const newBadgeBg = isPine ? "#10B981" : "#F25990";

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
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: foreground }}>
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="font-body text-sm mb-8" style={{ color: muted }}>
            Stand: Mai 2026 · wunschhimmel.com
          </p>

          {/* §1 */}
          <Section title="§ 1  Geltungsbereich und Vertragsparteien" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für die Nutzung der Plattform Wunschhimmel, erreichbar unter https://wunschhimmel.com, sowie der zugehörigen mobilen Anwendungen.</P>
            <P muted={muted}>(2) Anbieterin der Plattform ist:</P>
            <p className="font-body font-semibold my-2 ml-4" style={{ color: foreground, lineHeight: 1.8 }}>
              Marlene Uhrig<br />
              Heidelberger Str. 79, 12435 Berlin<br />
              E-Mail: kontakt@wunschhimmel.com
            </p>
            <P muted={muted}>(3) Die Plattform richtet sich ausschließlich an Verbraucherinnen und Verbraucher im Sinne des § 13 BGB, die das 18. Lebensjahr vollendet haben und ihren Wohnsitz in der Europäischen Union haben.</P>
            <P muted={muted}>(4) Es gelten ausschließlich diese AGB. Abweichende Bedingungen der Nutzerin werden nicht anerkannt, es sei denn, die Anbieterin stimmt ihrer Geltung ausdrücklich schriftlich zu.</P>
          </Section>

          {/* §2 */}
          <Section title="§ 2  Leistungsbeschreibung" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Wunschhimmel ist eine kostenlose Online-Plattform, die es registrierten Nutzerinnen ermöglicht: Wunschlisten zu erstellen, zu verwalten und zu teilen; Wünsche mit Produktlinks, Beschreibungen, Bildern und Prioritäten zu versehen; Wunschlisten per Link oder E-Mail mit Dritten zu teilen; Wünsche durch Dritte reservieren zu lassen; den KI-gestützten Wunschengel-Chat zur Geschenkfindung zu nutzen.</P>
            <P muted={muted}>(2) Die Plattform ist kostenlos nutzbar. Da es sich um einen unentgeltlichen Dienst handelt, besteht kein gesetzliches Widerrufsrecht. Die Anbieterin behält sich vor, künftig kostenpflichtige Premium-Funktionen einzuführen.</P>
            <P muted={muted}>(3) Die Anbieterin bemüht sich um eine möglichst hohe Verfügbarkeit der Plattform. Eine Verfügbarkeitsgarantie wird nicht übernommen.</P>
            <P muted={muted}>(4) Die Anbieterin ist berechtigt, Funktionen der Plattform jederzeit zu ändern, zu erweitern oder einzustellen, sofern dies der Nutzerin zumutbar ist.</P>
          </Section>

          {/* §3 */}
          <Section title="§ 3  Registrierung und Nutzerkonto" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Die Nutzung der Plattform in vollem Umfang setzt eine kostenlose Registrierung voraus. Zur Registrierung sind folgende Angaben erforderlich: E-Mail-Adresse, Anzeigename (Pseudonym möglich) und Passwort.</P>
            <P muted={muted}>(2) Mit Abschluss der Registrierung kommt zwischen der Nutzerin und der Anbieterin ein Nutzungsvertrag zustande. Voraussetzung ist die Akzeptanz dieser AGB sowie der Datenschutzerklärung.</P>
            <P muted={muted}>(3) Die Nutzerin ist verpflichtet, ihre Zugangsdaten vertraulich zu behandeln und vor dem Zugriff Dritter zu schützen.</P>
            <P muted={muted}>(4) Pro Person ist nur ein Nutzerkonto zulässig. Die Übertragung des Kontos auf Dritte ist nicht gestattet.</P>
            <P muted={muted}>(5) Die Anbieterin speichert den Zeitpunkt und die Version der AGB-Akzeptanz als Nachweis der Einwilligung.</P>
          </Section>

          {/* §4 */}
          <Section title="§ 4  Pflichten und Verhalten der Nutzerin" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Die Nutzerin verpflichtet sich, die Plattform ausschließlich bestimmungsgemäß und im Einklang mit diesen AGB sowie den geltenden Gesetzen zu nutzen.</P>
            <P muted={muted}>(2) Es ist der Nutzerin insbesondere untersagt: rechtswidrige oder beleidigende Inhalte zu veröffentlichen; Inhalte hochzuladen, an denen keine Nutzungsrechte bestehen; die Plattform für gewerbliche Zwecke ohne Zustimmung zu nutzen; automatisierte Abfragen (Bots, Scraping) durchzuführen; Sicherheitsmechanismen zu umgehen; Dritte zu belästigen oder zu schädigen.</P>
            <P muted={muted}>(3) Die Nutzerin ist für alle von ihr eingestellten Inhalte selbst verantwortlich und stellt sicher, dass diese keine Rechte Dritter verletzen.</P>
          </Section>

          {/* §5 */}
          <Section title="§ 5  Inhalte und Nutzungsrechte" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Die Nutzerin behält alle Rechte an den von ihr hochgeladenen Inhalten (Texte, Bilder etc.).</P>
            <P muted={muted}>(2) Mit dem Hochladen von Inhalten räumt die Nutzerin der Anbieterin ein nicht-exklusives, übertragbares, weltweites und kostenloses Nutzungsrecht ein, die Inhalte zum Zweck des Betriebs und der Darstellung der Plattform zu speichern, zu verarbeiten und anzuzeigen. Dieses Recht erlischt mit Löschung der Inhalte bzw. des Kontos.</P>
            <P muted={muted}>(3) Die Anbieterin ist berechtigt, offensichtlich rechtswidrige Inhalte ohne vorherige Ankündigung zu entfernen.</P>
          </Section>

          {/* §5a — NEU */}
          <Section title="§ 5a  Öffentliche Wunschlisten und Profilsichtbarkeit" foreground={foreground} border={border} sectionBg={sectionBg} isNew newBadgeBg={newBadgeBg}>
            <P muted={muted}>(1) Wunschhimmel bietet Nutzerinnen die Möglichkeit, ihre Wunschlisten als öffentlich zu kennzeichnen. Öffentliche Listen sind über einen teilbaren Link für Personen ohne Konto einsehbar. Standardmäßig sind alle Listen privat.</P>
            <P muted={muted}>(2) Die Aktivierung einer öffentlichen Liste setzt die ausdrückliche Einwilligung der Nutzerin voraus. Diese Einwilligung umfasst die Zustimmung, dass ihr Anzeigename sowie ihr Profilbild (sofern hinterlegt) auf der öffentlichen Liste für eingeloggte Nutzerinnen des Dienstes sichtbar sind.</P>
            <P muted={muted}>(3) Nicht eingeloggte Besucherinnen können den Inhalt einer öffentlichen Liste einsehen, jedoch werden Anzeigename und Profilbild in dieser Ansicht nicht angezeigt.</P>
            <P muted={muted}>(4) Die Anbieterin weist darauf hin, dass öffentliche Listen technisch von beliebigen Personen mit Kenntnis des Links aufgerufen werden können. Die Anbieterin übernimmt keine Haftung für die Weiterverbreitung des Links oder des sichtbaren Listeninhalts durch Dritte.</P>
            <P muted={muted}>(5) Die Nutzerin kann die Einwilligung jederzeit widerrufen, indem sie die betreffende Liste in den Einstellungen wieder auf privat stellt. Nach dem Widerruf sind Name und Profilbild nicht mehr sichtbar. Ein Widerruf löscht keine bereits von Dritten gespeicherten Kopien des Listeninhalts.</P>
            <P muted={muted}>(6) Die Aktivierung öffentlicher Listen steht ausschließlich volljährigen Nutzerinnen oder Nutzerinnen zu, die mit nachweisbarer Zustimmung einer erziehungsberechtigten Person handeln. Nutzerinnen unter 16 Jahren dürfen öffentliche Listen ohne elterliche Einwilligung nicht aktivieren.</P>
          </Section>

          {/* §6 */}
          <Section title="§ 6  Affiliate-Links und Produktempfehlungen" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Wunschhimmel nimmt am Amazon PartnerNet und dem Awin-Affiliate-Netzwerk teil. Produktlinks auf der Plattform können Affiliate-Links sein. Wenn Nutzerinnen über diese Links Produkte kaufen, erhält die Anbieterin eine Provision vom jeweiligen Händler.</P>
            <P muted={muted}>(2) Die Provision verändert den Kaufpreis für die Nutzerin nicht.</P>
            <P muted={muted}>(3) Der Pflichthinweis gemäß den Amazon-Partnerprogramm-Richtlinien „Als Amazon-Partner verdiene ich an qualifizierten Verkäufen" ist dauerhaft und gut sichtbar auf jeder Seite angebracht, auf der Amazon-Affiliate-Links erscheinen.</P>
            <P muted={muted}>(4) Der „Wunschengel"-Chat ist ein KI-gestütztes Hilfsmittel zur Inspiration bei der Geschenk- und Wunschfindung. Die Vorschläge basieren auf verfügbaren Partnerangeboten und den Angaben der Nutzerin. Die angezeigten Ergebnisse sind keine vollständige oder neutrale Marktübersicht.</P>
            <P muted={muted}>(5) Der Wunschengel stellt keine Rechts-, Finanz-, Medizin- oder sonstige Fachberatung dar und ersetzt keine individuelle Prüfung.</P>
            <P muted={muted}>(6) Die Anbieterin übernimmt keine Gewähr für Richtigkeit, Vollständigkeit oder Eignung der KI-Ausgaben. Zwingende gesetzliche Haftung bleibt unberührt.</P>
            <P muted={muted}>(7) Die Nutzerin darf den Wunschengel nicht dazu verwenden, rechtswidrige Inhalte zu erzeugen oder Dritte zu belästigen.</P>
            <P muted={muted}>(8) Die Anbieterin übernimmt keine Haftung für die Verfügbarkeit, Qualität, Sicherheit oder den Preis verlinkter Produkte auf externen Plattformen.</P>
          </Section>

          {/* §7 */}
          <Section title="§ 7  Laufzeit und Kündigung" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Der Nutzungsvertrag wird auf unbestimmte Zeit geschlossen.</P>
            <P muted={muted}>(2) Die Nutzerin kann den Vertrag jederzeit ohne Angabe von Gründen kündigen, indem sie ihr Konto löscht. Die Account-Löschfunktion ist unter Einstellungen / Profil verfügbar.</P>
            <P muted={muted}>(3) Nach Bestätigung der Löschung werden alle personenbezogenen Daten der Nutzerin gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen (steuerrechtlich § 147 AO: 6–10 Jahre; handelsrechtlich § 257 HGB: 6–10 Jahre).</P>
            <P muted={muted}>(4) Die Anbieterin ist berechtigt, das Konto einer Nutzerin mit sofortiger Wirkung zu sperren oder zu löschen, wenn die Nutzerin gegen diese AGB verstößt, ein begründeter Verdacht auf missbräuchliche Nutzung besteht oder gesetzliche Verpflichtungen dies erfordern.</P>
            <P muted={muted}>(5) Mit Beendigung des Nutzungsvertrags werden alle personenbezogenen Daten gemäß der Datenschutzerklärung und den geltenden gesetzlichen Aufbewahrungsfristen gelöscht.</P>
          </Section>

          {/* §8 */}
          <Section title="§ 8  Haftungsbeschränkung" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Die Anbieterin haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für vorsätzlich oder grob fahrlässig verursachte Schäden.</P>
            <P muted={muted}>(2) Für leicht fahrlässig verursachte Schäden haftet die Anbieterin nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht) und nur bis zur Höhe des vorhersehbaren, vertragstypischen Schadens.</P>
            <P muted={muted}>(3) Vorbehaltlich der Regelungen in Abs. 1 und 2 haftet die Anbieterin nicht für: Inhalte externer Websites über Affiliate-Links; Schäden durch nicht autorisierte Kontonutzung; Datenverluste durch höhere Gewalt; Empfehlungen des KI-Wunschengels.</P>
            <P muted={muted}>(4) Die Haftungsbeschränkungen gelten nicht, soweit die Anbieterin einen Schaden arglistig verschwiegen oder eine Garantie übernommen hat.</P>
          </Section>

          {/* §9 */}
          <Section title="§ 9  Datenschutz" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung von Wunschhimmel, abrufbar unter{" "}
              <a href="/datenschutz" style={{ color: accent }}>wunschhimmel.com/datenschutz</a>.
            </P>
            <P muted={muted}>(2) Mit der Registrierung bestätigt die Nutzerin, die Datenschutzerklärung zur Kenntnis genommen zu haben.</P>
            <P muted={muted}>(3) Die Nutzerin hat das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung ihrer personenbezogenen Daten. Anfragen sind zu richten an:{" "}
              <a href="mailto:kontakt@wunschhimmel.com" style={{ color: accent }}>kontakt@wunschhimmel.com</a>.
            </P>
          </Section>

          {/* §10 */}
          <Section title="§ 10  Änderungen der AGB" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Die Anbieterin behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern. Über Änderungen wird die Nutzerin per E-Mail oder durch einen deutlichen Hinweis auf der Plattform informiert, und zwar mindestens 30 Tage vor Inkrafttreten.</P>
            <P muted={muted}>(2) Änderungen der AGB bedürfen der aktiven Zustimmung der Nutzerin. Eine stillschweigende Zustimmung durch bloße Weiternutzung ist nicht möglich.</P>
            <P muted={muted}>(3) Stimmt die Nutzerin den geänderten AGB nicht zu, ist die Anbieterin berechtigt, das Nutzungsverhältnis zum Zeitpunkt des Inkrafttretens der Änderungen zu beenden.</P>
          </Section>

          {/* §11 */}
          <Section title="§ 11  Schlussbestimmungen" foreground={foreground} border={border} sectionBg={sectionBg}>
            <P muted={muted}>(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Für Verbraucherinnen in der EU gelten zusätzlich die zwingenden Schutzvorschriften des jeweiligen Wohnsitzlandes.</P>
            <P muted={muted}>(2) Gegenüber Verbraucherinnen gelten die gesetzlichen Gerichtsstände. Gegenüber Unternehmerinnen ist ausschließlicher Gerichtsstand Berlin.</P>
            <P muted={muted}>(3) Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" style={{ color: accent }}>
                https://ec.europa.eu/consumers/odr
              </a>. Die Anbieterin ist nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren teilzunehmen.
            </P>
            <P muted={muted}>(4) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</P>
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
    </div>
  );
}

function Section({
  title,
  children,
  foreground,
  border,
  sectionBg,
  isNew = false,
  newBadgeBg = "#F25990",
}: {
  title: string;
  children: React.ReactNode;
  foreground: string;
  border: string;
  sectionBg: string;
  isNew?: boolean;
  newBadgeBg?: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 mb-4"
      style={{
        background: sectionBg,
        border: isNew ? `2px solid ${newBadgeBg}` : `1px solid ${border}`,
        position: "relative",
      }}
    >
      {isNew && (
        <span
          style={{
            position: "absolute",
            top: -11,
            left: 16,
            background: newBadgeBg,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "2px 10px",
            borderRadius: 50,
          }}
        >
          Neu
        </span>
      )}
      <h2 className="font-display text-lg font-bold mb-3" style={{ color: foreground }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function P({ children, muted }: { children: React.ReactNode; muted: string }) {
  return (
    <p className="font-body text-sm mb-2" style={{ color: muted, lineHeight: 1.75 }}>
      {children}
    </p>
  );
}
