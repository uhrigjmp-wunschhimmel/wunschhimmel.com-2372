import { useRef, useState, useEffect, useCallback } from "react";

// ── Theme config ─────────────────────────────────────────────────────────────
export type OccasionTheme = {
  id: string;
  label: string;
  icon: string;
  badge: string;
  headline: string;
  sub: string;
  bg: string;
  heroGradient: string;
  primary: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  muted: string;
  rainbowColors: string[];
  floatingEmojis: string[];
  ctaLabel: string;
  mockupTitle: string;
  mockupWishes: { icon: string; name: string; price: string; color: string; reserved: boolean }[];
};

export const OCCASIONS: OccasionTheme[] = [
  {
    id: "birthday",
    label: "Geburtstag",
    icon: "🎂",
    badge: "🌈 Kostenlos",
    headline: "Die virtuelle Wunschkiste\nfür deinen Kindergeburtstag 🎂",
    sub: "Erstelle eine bunte Wunschliste, teile sie mit Familie & Freunden — und sag Tschüss zu doppelten Geschenken!",
    bg: "#FFFBF5",
    heroGradient: "linear-gradient(180deg, #FFF5F8 0%, #FFFBF5 100%)",
    primary: "#2D1B69",
    accent: "#FF6B8A",
    accentSoft: "#FFE8F0",
    accentText: "#D63384",
    muted: "#7B6B8D",
    rainbowColors: ["#FF6B6B","#FF9F40","#FFD93D","#6BCB77","#4D96FF","#C77DFF"],
    floatingEmojis: ["🎈","⭐","🎀","✨","🎊","💫"],
    ctaLabel: "Wunschliste erstellen",
    mockupTitle: "Lenas 7. Geburtstag 🎉",
    mockupWishes: [
      { icon: "🧸", name: "Großes Kuscheltier-Einhorn", price: "€34", color: "#FFF0F8", reserved: false },
      { icon: "🎨", name: "Malset Deluxe 120 Farben", price: "€26", color: "#E8F5FF", reserved: true },
      { icon: "🛴", name: "Cityroller mit Leuchtrad", price: "€59", color: "#F0FFE8", reserved: false },
      { icon: "🎮", name: "Tamagotchi Uni", price: "€19", color: "#F5E8FF", reserved: false },
    ],
  },
  {
    id: "wedding",
    label: "Hochzeit",
    icon: "💍",
    badge: "✨ Für das schönste Ja",
    headline: "Eure Hochzeits-\nWunschliste 💍",
    sub: "Teilt eure Wünsche mit Gästen — elegant, einfach und ohne doppelte Geschenke.",
    bg: "#FDFAF6",
    heroGradient: "linear-gradient(180deg, #FFF8F0 0%, #FDFAF6 100%)",
    primary: "#4A3728",
    accent: "#C9956C",
    accentSoft: "#FDF0E6",
    accentText: "#8B5E3C",
    muted: "#8B7B6B",
    rainbowColors: ["#F5CBA7","#F0B27A","#E59866","#D4AC90","#C9956C","#A9714E"],
    floatingEmojis: ["💍","🌸","🕊️","🌿","💐","✨"],
    ctaLabel: "Hochzeitsliste erstellen",
    mockupTitle: "Lisa & Mikes Hochzeit 💍",
    mockupWishes: [
      { icon: "🍳", name: "Le Creuset Bräter 28cm", price: "€189", color: "#FDF0E6", reserved: true },
      { icon: "🛏️", name: "Bettwäsche-Set Leinen", price: "€120", color: "#FFF8F5", reserved: false },
      { icon: "✈️", name: "Reisegutschein Toskana", price: "€250", color: "#F0F7FF", reserved: false },
      { icon: "🕯️", name: "Kerzen-Set Diptyque", price: "€85", color: "#FFF5E6", reserved: false },
    ],
  },
  {
    id: "christmas",
    label: "Weihnachten",
    icon: "🎄",
    badge: "🎁 Ho ho ho!",
    headline: "Deine Wunschliste\nfür Weihnachten 🎄",
    sub: "Schick deinen Weihnachtswunschzettel digital an die ganze Familie — kein Vergessen mehr!",
    bg: "#FFFCF5",
    heroGradient: "linear-gradient(180deg, #FFF5F5 0%, #FFFCF5 100%)",
    primary: "#1A3A1A",
    accent: "#CC2936",
    accentSoft: "#FFEAEA",
    accentText: "#991B1B",
    muted: "#5A6B5A",
    rainbowColors: ["#CC2936","#E63946","#2D6A4F","#40916C","#F4A261","#E9C46A"],
    floatingEmojis: ["🎄","⭐","🎁","❄️","🦌","🔔"],
    ctaLabel: "Wunschzettel erstellen",
    mockupTitle: "Weihnachtswünsche 2024 🎄",
    mockupWishes: [
      { icon: "🎿", name: "Ski-Kurs Anfänger", price: "€120", color: "#FFEAEA", reserved: false },
      { icon: "📖", name: "Harry Potter Gesamtausgabe", price: "€49", color: "#F0FFF4", reserved: true },
      { icon: "🧣", name: "Kaschmir-Schal in Weinrot", price: "€65", color: "#FFF5F5", reserved: false },
      { icon: "🎲", name: "Brettspiel Wingspan", price: "€44", color: "#F0F8FF", reserved: false },
    ],
  },
  {
    id: "babyshower",
    label: "Babyparty",
    icon: "🍼",
    badge: "👶 Willkommen kleines Wunder",
    headline: "Alles für den\nkleinsten Neuzugang 🍼",
    sub: "Erstellt eure Baby-Wunschliste und lasst Familie & Freunde das Richtige schenken.",
    bg: "#F8FBFF",
    heroGradient: "linear-gradient(180deg, #F0F7FF 0%, #F8FBFF 100%)",
    primary: "#1A3A5C",
    accent: "#4A90D9",
    accentSoft: "#E8F2FF",
    accentText: "#1A5A9C",
    muted: "#5A7A9B",
    rainbowColors: ["#AED6F1","#85C1E9","#F8BBD9","#F48FB1","#B39DDB","#80DEEA"],
    floatingEmojis: ["🍼","👶","🌙","⭐","🧸","💙"],
    ctaLabel: "Babyliste erstellen",
    mockupTitle: "Baby Mila kommt bald! 👶",
    mockupWishes: [
      { icon: "🍼", name: "Philips Avent Flaschenwärmer", price: "€45", color: "#E8F2FF", reserved: true },
      { icon: "🛁", name: "Badewanne mit Thermometer", price: "€38", color: "#F0FAFF", reserved: false },
      { icon: "💤", name: "Babyschlafsack 70cm", price: "€42", color: "#EEF2FF", reserved: false },
      { icon: "🎵", name: "Musikmobile für Kinderbett", price: "€29", color: "#F5F0FF", reserved: false },
    ],
  },
  {
    id: "easter",
    label: "Ostern",
    icon: "🐣",
    badge: "🌷 Frohe Ostern",
    headline: "Deine Osterwünsche\nals bunte Liste 🐣",
    sub: "Teile deine Osterwnüsche mit der Familie — bunt, fröhlich und ohne Überraschungen.",
    bg: "#FAFFFA",
    heroGradient: "linear-gradient(180deg, #F0FFF4 0%, #FAFFFA 100%)",
    primary: "#1A4A2A",
    accent: "#52B788",
    accentSoft: "#E8FFF0",
    accentText: "#1A7A3A",
    muted: "#5A7A6A",
    rainbowColors: ["#52B788","#95D5B2","#FFD166","#FF9F1C","#F4A8D4","#B5EAD7"],
    floatingEmojis: ["🐣","🌷","🥚","🐰","🌸","🌿"],
    ctaLabel: "Osterliste erstellen",
    mockupTitle: "Oster-Wünsche von Tim 🐣",
    mockupWishes: [
      { icon: "🚲", name: "Laufrad 12 Zoll", price: "€89", color: "#E8FFF0", reserved: false },
      { icon: "🌱", name: "Kinder-Gartenset", price: "€22", color: "#F0FFF4", reserved: true },
      { icon: "🎭", name: "Kasperltheater-Set", price: "€35", color: "#FFFDE8", reserved: false },
      { icon: "🪁", name: "Drachen-Bausatz", price: "€18", color: "#F0FFFA", reserved: false },
    ],
  },
  {
    id: "anniversary",
    label: "Jubiläum",
    icon: "🥂",
    badge: "🎉 Auf viele weitere Jahre",
    headline: "Eure Wunschliste\nzum Jubiläum 🥂",
    sub: "Feiert besondere Meilensteine mit den richtigen Geschenken — ganz nach euren Wünschen.",
    bg: "#FDFAFF",
    heroGradient: "linear-gradient(180deg, #FAF5FF 0%, #FDFAFF 100%)",
    primary: "#3A1A6A",
    accent: "#8B5CF6",
    accentSoft: "#EDE9FE",
    accentText: "#6D28D9",
    muted: "#7A6A9B",
    rainbowColors: ["#8B5CF6","#A78BFA","#F59E0B","#FBBF24","#EC4899","#60A5FA"],
    floatingEmojis: ["🥂","🎉","💜","✨","🌟","🎊"],
    ctaLabel: "Jubiläumsliste erstellen",
    mockupTitle: "25 Jahre wir zwei 🥂",
    mockupWishes: [
      { icon: "🍾", name: "Champagner-Tasting für 2", price: "€95", color: "#EDE9FE", reserved: false },
      { icon: "💆", name: "Wellness-Wochenende Spa", price: "€280", color: "#F5F0FF", reserved: true },
      { icon: "📷", name: "Fotobuch 25 Jahre", price: "€55", color: "#FAF5FF", reserved: false },
      { icon: "🎭", name: "Theaterabo Spielzeit 2025", price: "€140", color: "#EEF2FF", reserved: false },
    ],
  },
];

// ── Hook: persist selection ───────────────────────────────────────────────────
const STORAGE_KEY = "wh_occasion";

export function useOccasion() {
  const [active, setActive] = useState<OccasionTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return OCCASIONS.find(o => o.id === saved) ?? OCCASIONS[0];
    } catch {
      return OCCASIONS[0];
    }
  });

  const select = useCallback((o: OccasionTheme) => {
    setActive(o);
    try { localStorage.setItem(STORAGE_KEY, o.id); } catch {}
  }, []);

  return { active, select };
}

// ── Slider component ──────────────────────────────────────────────────────────
type Props = {
  active: OccasionTheme;
  onSelect: (o: OccasionTheme) => void;
};

export function OccasionSlider({ active, onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeft.current = trackRef.current?.scrollLeft ?? 0;
    if (trackRef.current) trackRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.2;
  };
  const stopDrag = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  };

  // Scroll active item into view
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const idx = OCCASIONS.findIndex(o => o.id === active.id);
    const el = track.children[idx] as HTMLElement;
    if (el) {
      // el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [active.id]);

  return (
    <div style={{ position: "relative", marginBottom: 0 }}>
      {/* Fade edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 48, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to right, rgba(255,251,245,0.95), transparent)",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 48, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to left, rgba(255,251,245,0.95), transparent)",
      }} />

      <div
        ref={trackRef}
        role="listbox"
        aria-label="Anlass auswählen"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        style={{
          display: "flex", gap: 10, overflowX: "auto", padding: "8px 48px",
          cursor: "grab", userSelect: "none", scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {OCCASIONS.map((o) => {
          const isActive = o.id === active.id;
          return (
            <button
              key={o.id}
              role="option"
              aria-selected={isActive}
              aria-label={o.label}
              onClick={() => onSelect(o)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onSelect(o); }}
              style={{
                flexShrink: 0,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "12px 22px",
                borderRadius: 16,
                border: isActive ? `2px solid ${active.accent}` : "2px solid transparent",
                background: isActive ? active.accentSoft : "rgba(255,255,255,0.7)",
                cursor: "pointer", outline: "none",
                transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                transform: isActive ? "translateY(-2px) scale(1.05)" : "translateY(0) scale(1)",
                boxShadow: isActive ? `0 4px 16px ${active.accent}30` : "0 1px 4px rgba(0,0,0,0.06)",
                minWidth: 84,
              }}
            >
              <span style={{ fontSize: 34, lineHeight: 1 }}>{o.icon}</span>
              <span style={{
                fontSize: 14, fontWeight: isActive ? 800 : 500,
                color: isActive ? active.accentText : "#9CA3AF",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                whiteSpace: "nowrap",
                transition: "color 0.25s",
              }}>
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
