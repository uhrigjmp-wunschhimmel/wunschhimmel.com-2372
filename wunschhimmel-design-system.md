# Wunschhimmel – Design System Zusammenfassung
**CI-Konzept: Festlich-verspielt** · Stand: Mai 2026

---

## 1. Markenidentität

**Tonalität:** Verspielt-festlich, warm, zart aber selbstbewusst, jung aber nicht infantil.  
**Zielgruppe:** Mütter, die Wünsche ihrer Kinder und Familie organisieren und teilen.  
**Kernmetapher:** Sternenhimmel + Regenbogen = Magie des Wünschens, Leichtigkeit des Schenkens.

---

## 2. Logo

### Aufbau
- **Symbol:** 3-streifiger Regenbogenbogen mit 6-Farb-Verlauf (Rose → Orange → Gelb → Mint → Blau → Lila)
- **Sterne:** 5 goldene 5-Zack-Sterne unter dem Bogen, mittig, leicht versetzt in der Höhe
- **Schriftzug:** „Wunschhimmel" in Playfair Display 700, Navy-700, mit klarem Abstand zum Symbol

### Varianten
| Variante | Einsatz |
|---|---|
| Stacked (Bogen über Text) | Website-Hero, OG-Image, große Anzeigen |
| Horizontal (Icon + Text) | Navigation, E-Mail-Header, Briefkopf |
| Icon solo | Favicon (32px+), App-Icon, Instagram-Highlight |
| Dunkel (weiße Schrift) | Navy-Hintergrund in Nav-Bar und E-Mails |

### Logo-Verlauf (6 Stops, alle Varianten gleich)
```
Außen (Bogen 1):  #F25990 → #FF8C42 → #FFD600 → #4DC9A0 → #4A90D9 → #9B59E8
Mitte (Bogen 2):  #FF85B3 → #FFB347 → #FFE44D → #7DDFC4 → #74B3F0 → #BC8AF5
Innen (Bogen 3):  #FFB3D4 → #FFD0A0 → #FFF0A0 → #B0EEE0 → #B0D8FF → #DCC8FF
```

### Sterne (Gold)
```
Primär:   #FFD700
Sekundär: #FFBF3A
```

---

## 3. Farbpalette

### Primärfarben
| Token | Hex | Einsatz |
|---|---|---|
| `--color-rose-400` | `#F25990` | Primär-CTA, Hover-Akzente |
| `--color-rose-500` | `#D93B72` | Hover-Zustand Buttons |
| `--color-navy-700` | `#122050` | Backgrounds, Navigation |
| `--color-navy-600` | `#1A2E65` | Headings, Text-Primär |
| `--color-gold` | `#FFBF3A` | Sterne, Premium-Badges |

### Vollständige Rose-Palette
```
--color-rose-50:  #FFF0F5   (Page-BG, Hover-Fill)
--color-rose-100: #FFD6E7   (Karten-BG, Badges)
--color-rose-200: #FFB3D1   (Border, Divider)
--color-rose-300: #FF85B3   (Dekorativ)
--color-rose-400: #F25990   ★ Primär
--color-rose-500: #D93B72   (Hover)
--color-rose-600: #B02558   (Pressed)
--color-rose-700: #8A1A43   (Text auf hellem BG)
--color-rose-800: #641230
--color-rose-900: #3E0A1E
```

### Vollständige Navy-Palette
```
--color-navy-50:  #EEF2F8
--color-navy-100: #C8D5EC
--color-navy-200: #96ADDA
--color-navy-300: #6485C5
--color-navy-400: #3A5DA8
--color-navy-500: #243D7A
--color-navy-600: #1A2E65   (Headings)
--color-navy-700: #122050   ★ Primär-BG
--color-navy-800: #0C163A   (Tiefstes Navy)
--color-navy-900: #060D24
```

### Akzentfarben
```
--color-gold:       #FFBF3A
--color-peach-200:  #FFC9AD
--color-mint-300:   #7DD6C4
--color-mint-400:   #4DC2AE
--color-lavender-300: #B7A8F0
```

### Semantische Farben
```
--color-success:  #2CA96E
--color-error:    #E83B3B
--color-warning:  #F5A500
--color-info:     #4A90D9
```

### Hintergrundtöne
```
--color-bg-page:   #FDF8FC   (Elfenbein-Rosa, Seiten-BG)
--color-bg-light:  #FFF5FA   (Sektions-BG)
--color-bg-white:  #FFFFFF
--color-border:    #F0D5E5   (Standard-Border)
```

---

## 4. Typografie

### Schriftpaarung
```
Display: 'Playfair Display'  → Google Fonts, OFL-Lizenz ✓
Body:    'Plus Jakarta Sans' → Google Fonts, OFL-Lizenz ✓
```

### CSS-Import
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
```

### Hierarchie
| Stufe | Font | Size | Weight | Color | Einsatz |
|---|---|---|---|---|---|
| H1 | Playfair Display | 42px | 700 | navy-700 | Page-Titel |
| H2 | Playfair Display | 30px | 700 | navy-600 | Section-Titel |
| H3 | Playfair Display | 22px | 600 | navy-600 | Subsection |
| H4 | Plus Jakarta Sans | 16px | 700 | navy-700 | UI-Heading |
| Body | Plus Jakarta Sans | 15px | 400 | #5A3A4A | Fließtext, 1.7 Zeilenhöhe |
| Small | Plus Jakarta Sans | 12px | 400 | #9A7085 | Meta, Captions |
| Caption | Plus Jakarta Sans | 11px | 700 | rose-500 | Tags, Labels, Uppercase |

---

## 5. Spacing & Formen

### Eckenradien
```css
--radius-sm:   8px    /* kleine Elemente, Tags */
--radius-md:   14px   /* Inputs, Cards klein */
--radius-lg:   20px   /* Cards, Modals */
--radius-xl:   24px   /* große Container */
--radius-pill: 50px   /* Buttons, Badges */
```

### Schatten
```css
--shadow-soft:   0 4px 16px rgba(210, 59, 114, 0.12);   /* Karten, Hover */
--shadow-medium: 0 8px 32px rgba(18, 32, 80, 0.12);     /* Modals, Dropdowns */
--shadow-gold:   0 4px 16px rgba(245, 165, 0, 0.20);    /* Premium-Elemente */
```

---

## 6. CSS Design Tokens (vollständig, kopierbereit)

```css
:root {
  /* Rose */
  --color-rose-50:  #FFF0F5;
  --color-rose-100: #FFD6E7;
  --color-rose-200: #FFB3D1;
  --color-rose-300: #FF85B3;
  --color-rose-400: #F25990;
  --color-rose-500: #D93B72;
  --color-rose-600: #B02558;
  --color-rose-700: #8A1A43;

  /* Navy */
  --color-navy-50:  #EEF2F8;
  --color-navy-100: #C8D5EC;
  --color-navy-300: #6485C5;
  --color-navy-500: #243D7A;
  --color-navy-600: #1A2E65;
  --color-navy-700: #122050;
  --color-navy-800: #0C163A;

  /* Akzente */
  --color-gold:         #FFBF3A;
  --color-gold-light:   #FFD700;
  --color-peach:        #FFC9AD;
  --color-mint:         #4DC2AE;
  --color-mint-light:   #7DD6C4;
  --color-lavender:     #B7A8F0;

  /* Semantisch */
  --color-success:      #2CA96E;
  --color-error:        #E83B3B;
  --color-warning:      #F5A500;

  /* Hintergründe */
  --color-bg-page:      #FDF8FC;
  --color-bg-light:     #FFF5FA;
  --color-border:       #F0D5E5;

  /* Text */
  --color-text-dark:    #1A0A14;
  --color-text-mid:     #5A3A4A;
  --color-text-muted:   #9A7085;

  /* Typografie */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Plus Jakarta Sans', sans-serif;

  /* Radien */
  --radius-sm:   8px;
  --radius-md:   14px;
  --radius-lg:   20px;
  --radius-xl:   24px;
  --radius-pill: 50px;

  /* Schatten */
  --shadow-soft:   0 4px 16px rgba(210, 59, 114, 0.12);
  --shadow-medium: 0 8px 32px rgba(18, 32, 80, 0.12);
}
```

---

## 7. Komponenten-Regeln

### Buttons
```css
/* Primär */
background: linear-gradient(135deg, #F25990, #B02558);
color: white;
border-radius: var(--radius-pill);
padding: 12px 28px;
font: 700 14px var(--font-body);
box-shadow: 0 4px 16px rgba(210, 59, 114, 0.30);

/* Sekundär */
background: transparent;
border: 2px solid #6485C5;
color: #1A2E65;
border-radius: var(--radius-pill);

/* Ghost */
background: #FFF0F5;
border: 1px solid #FFB3D1;
color: #B02558;
border-radius: var(--radius-pill);
```

### Inputs
```css
border: 2px solid #F0D5E5;
border-radius: 12px;
padding: 12px 16px;
font: 400 14px var(--font-body);
/* Focus: */  border-color: #F25990;
/* Error: */  border-color: #E83B3B;
/* Success: */ border-color: #2CA96E;
```

### Wish-Karte
```css
background: white;
border-radius: 20px;
border: 1px solid #F0D5E5;
overflow: hidden;
/* Hover: */  box-shadow: var(--shadow-soft); transform: translateY(-2px);
```

### Farbverläufe (benannt)
```css
--grad-night:      linear-gradient(135deg, #122050, #F25990);
--grad-sunset:     linear-gradient(135deg, #F25990, #FFBF3A);
--grad-candy:      linear-gradient(135deg, #FFD6E7, #FFC9AD);
--grad-morning:    linear-gradient(135deg, #B7A8F0, #4DC2AE);
--grad-starnight:  linear-gradient(160deg, #1A2E65, #243D7A, #3A5DA8);
--grad-dreamcloud: linear-gradient(135deg, #FFE4D6, #EDE8FF);
```

---

## 8. Dekorative Elemente

### SVG-Regenbogen (Logo-Bogen, wiederverwendbar)
```svg
<defs>
  <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#F25990"/>
    <stop offset="20%"  stop-color="#FF8C42"/>
    <stop offset="40%"  stop-color="#FFD600"/>
    <stop offset="60%"  stop-color="#4DC9A0"/>
    <stop offset="80%"  stop-color="#4A90D9"/>
    <stop offset="100%" stop-color="#9B59E8"/>
  </linearGradient>
</defs>
<!-- Bogenpfad: cx=130, Basislinie y=68, Radius ~100 -->
<path d="M 30 68 A 100 100 0 0 1 230 68"
      stroke="url(#rainbow)" stroke-width="13"
      fill="none" stroke-linecap="round"/>
```

### SVG-Stern (5-zackig, wiederverwendbar)
```svg
<!-- Größe M (r≈7), zentriert auf 0,0, dann transform="translate(x,y)" -->
<polygon
  points="0,-7 2,-2.5 7,-2.5 3,1.2 4.3,6.5 0,3.8 -4.3,6.5 -3,1.2 -7,-2.5 -2,-2.5"
  fill="#FFD700"/>
```

### Dekor-Symbole (Unicode, lizenzfrei)
```
Stern-Akzente:    ✦ ✧ ⋆ ✩ ★
Festlich:         🎀 🎁 🎂
Natur/Himmel:     🌸 🌙 ☁️
```

### Jakobsmuschel-Divider (CSS)
```css
.scallop-divider {
  height: 16px;
  background: radial-gradient(circle at 50% 0%, #FFF0F5 33%, transparent 33%),
              radial-gradient(circle at 16.67% 0%, #FFF0F5 33%, transparent 33%),
              radial-gradient(circle at 83.33% 0%, #FFF0F5 33%, transparent 33%);
  background-size: 24px 16px;
  background-color: #FFD6E7;
}
```

---

## 9. Social-Media-Formate

| Plattform | Format | Maße |
|---|---|---|
| Instagram Feed | 1:1 | 1080 × 1080 px |
| Instagram Story / Reel | 9:16 | 1080 × 1920 px |
| TikTok Video | 9:16 | 1080 × 1920 px |
| Pinterest Pin | 2:3 | 1000 × 1500 px |
| YouTube Thumbnail | 16:9 | 1280 × 720 px |
| YouTube Banner | — | 2560 × 1440 px |
| Instagram Highlight | 1:1 | 1080 × 1080 px (rund beschnitten) |

**Highlight-Cover-Hintergründe (6 Varianten):**
- 🎁 Rose: `linear-gradient(135deg, #F25990, #B02558)`
- 🌙 Navy: `linear-gradient(135deg, #1A2E65, #0C163A)`
- ★ Gold: `linear-gradient(135deg, #FFD57A, #F5A500)`
- ✓ Mint: `linear-gradient(135deg, #7DD6C4, #4DC2AE)`
- 💜 Lavendel: `linear-gradient(135deg, #D4CAF8, #9480E6)`
- 🎂 Pfirsich: `linear-gradient(135deg, #FFE4D6, #F5865A)`

---

## 10. Copyright-Checkliste

| Element | Status | Maßnahme |
|---|---|---|
| Playfair Display | ✅ OFL-Lizenz | Google Fonts, frei nutzbar |
| Plus Jakarta Sans | ✅ OFL-Lizenz | Google Fonts, frei nutzbar |
| Regenbogen-Logo | ✅ Eigenständig | Eigene SVG-Pfade, eigene Farbwelt |
| Farbpalette | ✅ Nicht schutzfähig | Spezifische Töne dokumentieren |
| Social-Media-Icons | ⚠️ Geschützt | Nur offizielle Brand-Assets nutzen |
| Amazon Affiliate | ⚠️ Pflicht-Disclosure | „Als Amazon-Partner verdiene ich..." im Footer |
| Produktbilder in Demos | ❌ Risiko | Nur CC0 / selbst erstellte Bilder |
| KI-generierte Assets | ⚠️ Ungeklärt (DE) | Prompts + Tool dokumentieren |

---

## 11. Empfohlene nächste Schritte

1. **CSS-Tokens** aus Abschnitt 6 in `src/styles/tokens.css` oder `tailwind.config.ts` übernehmen
2. **Google Fonts** im `<head>` oder via Vite-Plugin einbinden
3. **Logo-SVG** als Komponente `<WunschhimmelLogo />` bauen (Varianten via Props: `variant="stacked|horizontal|icon"`, `theme="light|dark"`)
4. **Amazon Disclaimer** im Footer und auf allen Produktseiten ergänzen
5. **Wortmarke „Wunschhimmel"** beim DPMA anmelden (Klasse 35 + 42, ca. 300 €)
6. **Figma-Bibliothek** anlegen: Tokens + Komponenten aus diesem System als Shared Library

---

*Erstellt mit Claude für Wunschhimmel.com · Alle Hex-Werte und Code-Snippets sind produktionsbereit.*
