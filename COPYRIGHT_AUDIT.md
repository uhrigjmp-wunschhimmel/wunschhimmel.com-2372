# WUNSCHHIMMEL — Copyright & Marken-Audit
## CI: Konzept 1 "Festlich-verspielt"

---

## A. SCHRIFTARTEN

| Schrift | Lizenz | Status | Empfehlung |
|---------|--------|--------|-----------|
| Playfair Display | SIL Open Font License 1.1 | ✅ SICHER | Frei für kommerzielle Nutzung via Google Fonts |
| Plus Jakarta Sans | SIL Open Font License 1.1 | ✅ SICHER | Frei für kommerzielle Nutzung via Google Fonts |

---

## B. FARBEN

| Element | Einschätzung | Risiko | Empfehlung |
|---------|-------------|--------|-----------|
| Deep Violet `#2D1B69` | Originaler Farbton | ✅ Niedrig | Farben sind nicht schutzfähig als solche |
| Strawberry Pink `#FF6B9D` | Originaler Farbton | ✅ Niedrig | Kein Konflikt mit Cadbury-Lila (komplett andere Kategorie) |
| Gold `#FFB347` | Originaler Farbton | ✅ Niedrig | Unbedenklich |
| Rose Background `#FFF5F7` | Originaler Farbton | ✅ Niedrig | Unbedenklich |

**Hinweis:** Cadbury besitzt Markenschutz auf einen spezifischen Lila-Farbton (Pantone 2685C) NUR für Schokoladenprodukte. Völlig irrelevant für Wunschhimmel.

---

## C. ICONS & GRAFIK-ELEMENTE

| Element | Quelle | Risiko | Empfehlung |
|---------|--------|--------|-----------|
| Icon-System (Icons.tsx) | **100% eigene SVG-Geometrien** | ✅ Niedrig | Original gezeichnet, keine Kopie aus Lucide/Heroicons/FA |
| Emojis (🎁 🌟 etc.) | Unicode-Standard | ✅ Niedrig | Emojis selbst sind nicht geschützt; eigene Rendering-Implementierung empfohlen |
| Regenbogen-Bogen (SVG) | Eigene SVG-Implementierung | ✅ Niedrig | Geometrisches Element, nicht schutzfähig |
| Konfetti-Muster | Eigene CSS-Implementierung | ✅ Niedrig | Unbedenklich |
| Wellenform (wave-divider) | Eigene SVG-Kurve | ✅ Niedrig | Unbedenklich |

---

## D. DESIGN-PATTERNS & UI-MUSTER

| Pattern | Risiko | Details | Empfehlung |
|---------|--------|---------|-----------|
| Floating cards mit Schatten | ✅ Niedrig | Generisches UI-Muster, kein Markenschutz möglich | Unbedenklich |
| Pill-/Badge-System | ✅ Niedrig | Ubiquitäres Web-Design-Element | Unbedenklich |
| Blob-Hintergrund-Gradienten | ✅ Niedrig | Kein Markenschutz auf generische Gradienten | Unbedenklich |
| Scroll-Slider für Kategorien | ✅ Niedrig | Standard-Karussell-Pattern | Unbedenklich |
| "Wunschengel" als Chatbot-Konzept | ⚠️ Mittel | PRÜFEN: Gibt es eingetragene Marken für "Wunscherfüller"-Chatbot-Konzepte im DACH-Raum? | DENIC/DPMA-Check empfohlen |

---

## E. MARKENNAME & DOMAIN

| Element | Risiko | Details | Empfehlung |
|---------|--------|---------|-----------|
| "Wunschhimmel" (Wortmarke) | ⚠️ Mittel | DPMA-Check noch ausstehend? | Markenanmeldung Klasse 42 (Software/SaaS) & 35 (Vermittlung) empfehlenswert |
| wunschhimmel.de | ✅ Sicher | Domain bereits registriert | Gesichert |
| "Wunschengel" (Chatbot-Name) | ⚠️ Mittel | Beschreibend, aber überprüfen | Als Wortmarke anmelden wenn Kernfeature |

---

## F. SOCIAL-MEDIA-ASSETS

| Element | Risiko | Details | Empfehlung |
|---------|--------|---------|-----------|
| Instagram/TikTok Post-Templates | ✅ Niedrig | Eigene Layouts, keine Kopie von Plattform-eigenen Templates | Unbedenklich |
| Platform-Logos in Marktkommunikation | ⚠️ Mittel | Instagram/TikTok-Logos NUR nach Brand Guidelines verwenden | Aktuelle Brand Guidelines der Plattformen beachten |
| "Teile deinen Wunsch auf Instagram" | ✅ Niedrig | Verweisende Nutzung ist erlaubt | Unbedenklich |

---

## G. AMAZON-AFFILIATE

| Element | Risiko | Details | Empfehlung |
|---------|--------|---------|-----------|
| Amazon-Affiliate-Links | ✅ Sicher | Vollständig reguliert durch Amazon Associates-Programm | Offenlegungspflicht beachten (§ 5a UWG) |
| "Bei Amazon suchen"-Button | ⚠️ Niedrig-Mittel | Amazon-Markenname im UI | Formulierung "Auf Amazon suchen" ist erlaubt; kein Amazon-Logo ohne Genehmigung |
| Amazon-Logo | 🔴 NICHT VERWENDEN | Amazon-Logo ist geschützte Marke | Nur Text, kein Logo |

---

## H. OFFENLEGUNGSPFLICHTEN (Deutschland)

### Pflichtangaben:
1. **Affiliate-Kennzeichnung**: "Dieser Link ist ein Affiliate-Link. Wenn du darüber kaufst, erhalten wir eine Provision ohne Mehrkosten für dich." — Muss auf der Seite sichtbar sein (§ 5a UWG, TMG)
2. **Impressum**: Vollständige Anbieterangaben (§ 5 TMG) — ✅ bereits vorhanden
3. **Datenschutzerklärung**: DSGVO-konform — ✅ bereits vorhanden
4. **Cookie-Banner**: ✅ bereits vorhanden

### Empfohlene Ergänzungen:
- Affiliate-Disclaimer im Footer dauerhaft einblenden
- Beim Wunschengel-Chat: Hinweis, dass Produktempfehlungen Affiliate-Links enthalten

---

## I. ZUSAMMENFASSUNG RISIKO-MATRIX

| Kategorie | Gesamt-Risiko | Handlungsbedarf |
|-----------|--------------|----------------|
| Schriftarten | 🟢 Niedrig | Keine Maßnahme |
| Farben | 🟢 Niedrig | Keine Maßnahme |
| Icons/Grafik | 🟢 Niedrig | Keine Maßnahme |
| Markenname | 🟡 Mittel | DPMA-Anmeldung prüfen |
| Amazon-Integration | 🟡 Mittel | Offenlegung sicherstellen |
| Social-Media-Assets | 🟢 Niedrig | Platform-Guidelines beachten |
| Wunschengel-Marke | 🟡 Mittel | Markenanmeldung prüfen |

---

## J. SOFORT-MASSNAHMEN (Priorität)

1. **JETZT**: Affiliate-Disclaimer in Footer sichtbar platzieren
2. **DIESE WOCHE**: DPMA-Markenrecherche für "Wunschhimmel" (https://register.dpma.de/DPMAregister/marke/einsteiger)
3. **OPTIONAL**: Markenanmeldung DE-Klasse 42 + 35 für "Wunschhimmel" und "Wunschengel" (~310€ pro Klasse)

---
*Erstellt: Mai 2026 | Kein Rechtsrat — für professionelle Absicherung Anwalt hinzuziehen*
