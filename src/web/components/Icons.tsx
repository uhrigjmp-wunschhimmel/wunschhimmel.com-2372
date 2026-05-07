/**
 * WUNSCHHIMMEL ICON SYSTEM
 * ─────────────────────────────────────────────────────────────────────────────
 * Eigenes SVG-Icon-Set — keine Abhängigkeit zu Lucide, Heroicons etc.
 * Stil: 2px stroke, round caps/joins, 24×24 viewport, radius-konsistent
 * 
 * COPYRIGHT: 100% eigene Geometrien — kein Kopieren aus bestehenden Icon-Sets
 * Alle Paths sind original gezeichnet und markenrechtlich unbedenklich.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

const defaults: IconProps = { size: 20, color: "currentColor", strokeWidth: 2 };

// Base SVG wrapper
function Svg({ size = 20, color = "currentColor", strokeWidth = 2, className, style, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {children}
    </svg>
  );
}

// ── Gift / Wunschliste ───────────────────────────────────────────────────────
export function IconGift(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <rect x="3" y="9" width="18" height="13" rx="2" />
      <path d="M12 9V22" />
      <path d="M3 13h18" />
      <path d="M8 9C8 7.34 9.34 6 11 6C12.66 6 12 7.5 12 9" />
      <path d="M16 9C16 7.34 14.66 6 13 6C11.34 6 12 7.5 12 9" />
      <path d="M12 6C12 4.34 10.66 3 9 3S6 4.34 6 6" />
      <path d="M12 6C12 4.34 13.34 3 15 3S18 4.34 18 6" />
    </Svg>
  );
}

// ── Star / Priorität ─────────────────────────────────────────────────────────
export function IconStar(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Svg>
  );
}

export function IconStarFilled(p: IconProps) {
  return (
    <Svg {...defaults} {...p} strokeWidth={0}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={p.color || "currentColor"} />
    </Svg>
  );
}

// ── Heart / Gemerkt ──────────────────────────────────────────────────────────
export function IconHeart(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  );
}

// ── Share / Teilen ───────────────────────────────────────────────────────────
export function IconShare(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </Svg>
  );
}

// ── Link / URL ───────────────────────────────────────────────────────────────
export function IconLink(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

// ── Plus / Hinzufügen ────────────────────────────────────────────────────────
export function IconPlus(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

// ── Check / Reserviert ───────────────────────────────────────────────────────
export function IconCheck(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function IconCheckCircle(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </Svg>
  );
}

// ── Trash / Löschen ──────────────────────────────────────────────────────────
export function IconTrash(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </Svg>
  );
}

// ── Edit / Bearbeiten ────────────────────────────────────────────────────────
export function IconEdit(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  );
}

// ── Eye / Sichtbar ───────────────────────────────────────────────────────────
export function IconEye(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function IconEyeOff(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </Svg>
  );
}

// ── Search / Suchen ──────────────────────────────────────────────────────────
export function IconSearch(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

// ── Bell / Benachrichtigung ──────────────────────────────────────────────────
export function IconBell(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  );
}

// ── User / Profil ────────────────────────────────────────────────────────────
export function IconUser(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

// ── Lock / Privat ────────────────────────────────────────────────────────────
export function IconLock(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

export function IconUnlock(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </Svg>
  );
}

// ── Mail / Email ─────────────────────────────────────────────────────────────
export function IconMail(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </Svg>
  );
}

// ── QR Code ──────────────────────────────────────────────────────────────────
export function IconQR(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="5" y="5" width="3" height="3" fill={p.color || "currentColor"} stroke="none" />
      <rect x="16" y="5" width="3" height="3" fill={p.color || "currentColor"} stroke="none" />
      <rect x="5" y="16" width="3" height="3" fill={p.color || "currentColor"} stroke="none" />
      <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
    </Svg>
  );
}

// ── Copy / Kopieren ──────────────────────────────────────────────────────────
export function IconCopy(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  );
}

// ── Camera / Bild hinzufügen ─────────────────────────────────────────────────
export function IconCamera(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </Svg>
  );
}

// ── Image ────────────────────────────────────────────────────────────────────
export function IconImage(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </Svg>
  );
}

// ── Arrow right ──────────────────────────────────────────────────────────────
export function IconArrowRight(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

// ── Chevron ──────────────────────────────────────────────────────────────────
export function IconChevronDown(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}
export function IconChevronRight(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}
export function IconChevronLeft(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

// ── X / Schließen ────────────────────────────────────────────────────────────
export function IconX(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

// ── Menu / Hamburger ─────────────────────────────────────────────────────────
export function IconMenu(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Svg>
  );
}

// ── Tag / Preis ──────────────────────────────────────────────────────────────
export function IconTag(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5" />
    </Svg>
  );
}

// ── Shopping bag ─────────────────────────────────────────────────────────────
export function IconShoppingBag(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Svg>
  );
}

// ── Sparkle / Magic ──────────────────────────────────────────────────────────
export function IconSparkle(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

// ── Angel / Engel ────────────────────────────────────────────────────────────
export function IconAngel(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      {/* Halo */}
      <ellipse cx="12" cy="4" rx="5" ry="1.5" />
      {/* Head */}
      <circle cx="12" cy="8" r="3" />
      {/* Wings */}
      <path d="M6 13c-2-1-3.5-3-2-5s4 0 4 3" />
      <path d="M18 13c2-1 3.5-3 2-5s-4 0-4 3" />
      {/* Body */}
      <path d="M9 13c0 0 1 2 3 2s3-2 3-2v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6z" />
    </Svg>
  );
}

// ── Compass / Entdecken ──────────────────────────────────────────────────────
export function IconCompass(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </Svg>
  );
}

// ── List ─────────────────────────────────────────────────────────────────────
export function IconList(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2.5" />
      <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2.5" />
      <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2.5" />
    </Svg>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────────
export function IconSettings(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

// ── Logout ───────────────────────────────────────────────────────────────────
export function IconLogOut(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Svg>
  );
}

// ── Sun/Moon — Theme Toggle ──────────────────────────────────────────────────
export function IconSun(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Svg>
  );
}

export function IconMoon(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  );
}

// ── Info / Alert ─────────────────────────────────────────────────────────────
export function IconInfo(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
    </Svg>
  );
}

export function IconAlertCircle(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
    </Svg>
  );
}

// ── Globe / Sprache ───────────────────────────────────────────────────────────
export function IconGlobe(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Svg>
  );
}

// ── Flame / Hot Priority ─────────────────────────────────────────────────────
export function IconFlame(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1 0 2-.6 2.5-1.5A3 3 0 0 0 17 12c0-4-6-8-6-8S5 8 5 12a5 5 0 0 0 3.5 4.5z" />
    </Svg>
  );
}

// ── Bookmark ─────────────────────────────────────────────────────────────────
export function IconBookmark(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

// ── Calendar ─────────────────────────────────────────────────────────────────
export function IconCalendar(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  );
}

// ── External link ────────────────────────────────────────────────────────────
export function IconExternalLink(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </Svg>
  );
}

// ── Upload ───────────────────────────────────────────────────────────────────
export function IconUpload(p: IconProps) {
  return (
    <Svg {...defaults} {...p}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </Svg>
  );
}
