import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import {
  IconCompass, IconList, IconUser, IconLogOut, IconMenu, IconX,
  IconSun, IconMoon, IconGlobe, IconSettings, IconGift
} from "./Icons";
import { useClipboardWish } from "./ClipboardWishDetector";

function WunschhimmelIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: Math.round(size * 0.17), flexShrink: 0, display: "block" }}>
      <rect width="140" height="140" rx="24" fill="#122050" />
      <defs>
        <linearGradient id="nav-g1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#F25990" />
          <stop offset="20%"  stopColor="#FF8C42" />
          <stop offset="40%"  stopColor="#FFD600" />
          <stop offset="60%"  stopColor="#4DC9A0" />
          <stop offset="80%"  stopColor="#4A90D9" />
          <stop offset="100%" stopColor="#9B59E8" />
        </linearGradient>
        <linearGradient id="nav-g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FF85B3" />
          <stop offset="20%"  stopColor="#FFB347" />
          <stop offset="40%"  stopColor="#FFE44D" />
          <stop offset="60%"  stopColor="#7DDFC4" />
          <stop offset="80%"  stopColor="#74B3F0" />
          <stop offset="100%" stopColor="#BC8AF5" />
        </linearGradient>
        <linearGradient id="nav-g3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FFB3D4" />
          <stop offset="20%"  stopColor="#FFD0A0" />
          <stop offset="40%"  stopColor="#FFF0A0" />
          <stop offset="60%"  stopColor="#B0EEE0" />
          <stop offset="80%"  stopColor="#B0D8FF" />
          <stop offset="100%" stopColor="#DCC8FF" />
        </linearGradient>
      </defs>
      <path d="M 8 90 A 62 62 0 0 1 132 90" stroke="url(#nav-g1)" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M 22 90 A 48 48 0 0 1 118 90" stroke="url(#nav-g2)" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M 36 90 A 34 34 0 0 1 104 90" stroke="url(#nav-g3)" strokeWidth="13" strokeLinecap="round" fill="none" />
      <polygon transform="translate(34,103)" points="0,-7 2,-2.5 7,-2.5 3,1.2 4.3,6.5 0,3.8 -4.3,6.5 -3,1.2 -7,-2.5 -2,-2.5" fill="#FFD700" />
      <polygon transform="translate(52,103)" points="0,-7 2,-2.5 7,-2.5 3,1.2 4.3,6.5 0,3.8 -4.3,6.5 -3,1.2 -7,-2.5 -2,-2.5" fill="#FFD700" />
      <polygon transform="translate(70,103)" points="0,-8 2.3,-2.9 8,-2.9 3.5,1.4 5,7.6 0,4.4 -5,7.6 -3.5,1.4 -8,-2.9 -2.3,-2.9" fill="#FFBF3A" />
      <polygon transform="translate(88,103)" points="0,-7 2,-2.5 7,-2.5 3,1.2 4.3,6.5 0,3.8 -4.3,6.5 -3,1.2 -7,-2.5 -2,-2.5" fill="#FFD700" />
      <polygon transform="translate(106,103)" points="0,-7 2,-2.5 7,-2.5 3,1.2 4.3,6.5 0,3.8 -4.3,6.5 -3,1.2 -7,-2.5 -2,-2.5" fill="#FFD700" />
    </svg>
  );
}

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { handleTrigger, checking, Sheet } = useClipboardWish();

  const isPine = theme === "pine";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!session?.user) { setIsAdmin(false); return; }
    fetch("/api/profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((p: any) => { if (p?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, [session?.user?.id]);

  const go = (path: string) => { setMenuOpen(false); navigate(path); };
  const signOut = async () => { await authClient.signOut(); go("/"); };

  const navBg = scrolled ? "rgba(12, 22, 58, 0.98)" : "rgba(18, 32, 80, 0.95)";
  const navBorder = scrolled ? "rgba(242,89,144,0.18)" : "rgba(255,255,255,0.08)";

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .navbar-desktop { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
        @media (min-width: 641px) {
          .navbar-mobile-menu { display: none !important; }
          .navbar-hamburger { display: none !important; }
        }
        .nav-pill-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.80);
          border-radius: 999px;
          padding: 6px 14px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .nav-pill-btn:hover {
          background: rgba(242,89,144,0.18);
          color: #FF85B3;
          border-color: rgba(242,89,144,0.3);
        }
        .nav-text-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.75);
          font-size: 13.5px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 6px 8px; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .nav-text-btn:hover {
          color: #FF85B3;
          background: rgba(242,89,144,0.10);
        }
      `}</style>

      <nav className="wh-nav" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: navBg, backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${navBorder}`,
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{
          maxWidth: 1152, margin: "0 auto", padding: "0 20px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>

          {/* Logo */}
          <button onClick={() => go("/")} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "none", border: "none", cursor: "pointer", padding: "4px 0"
          }}>
            <WunschhimmelIcon size={36} />
            <span style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17,
              color: "#ffffff", letterSpacing: "-0.02em",
            }}>
              Wunschhimmel
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="navbar-desktop" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button className="nav-text-btn" onClick={() => go("/explore")}>
              <IconCompass size={15} color="currentColor" />
              {t("nav_explore")}
            </button>

            {session ? (
              <>
                <button className="nav-text-btn" onClick={() => go("/dashboard")}>
                  <IconList size={15} color="currentColor" />
                  {t("nav_dashboard")}
                </button>
                <button className="nav-text-btn" onClick={() => go("/feed")}>
                  <IconGift size={15} color="currentColor" />
                  Feed
                </button>
                <button className="nav-text-btn" onClick={() => go("/profile")}>
                  <IconUser size={15} color="currentColor" />
                  Profil
                </button>

                {/* Link hinzufügen Button */}
                <button
                  onClick={handleTrigger}
                  disabled={checking}
                  className="nav-pill-btn"
                  style={{
                    background: "linear-gradient(135deg, rgba(242,89,144,0.25), rgba(176,37,88,0.25))",
                    borderColor: "rgba(242,89,144,0.4)",
                    color: "#FF85B3",
                  }}
                >
                  <span>🔗</span>
                  {checking ? "Prüfe…" : "Link hinzufügen"}
                </button>
              </>
            ) : null}

            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

            <button onClick={() => setTheme(isPine ? "rose" : "pine")} className="nav-pill-btn"
              title={isPine ? "Zum Rose-Design wechseln" : "Zum Dark-Design wechseln"}>
              {isPine ? <IconSun size={13} color="currentColor" /> : <IconMoon size={13} color="currentColor" />}
            </button>

            <button onClick={() => setLang(lang === "de" ? "en" : "de")} className="nav-pill-btn">
              <IconGlobe size={13} color="currentColor" />
              {lang === "de" ? "EN" : "DE"}
            </button>

            {isAdmin && (
              <button onClick={() => go("/admin")} className="nav-pill-btn"
                style={{ background: "rgba(255,179,71,0.15)", borderColor: "rgba(255,179,71,0.3)", color: "#FFB347" }}>
                <IconSettings size={13} color="currentColor" />
                Admin
              </button>
            )}

            {session ? (
              <button onClick={signOut} className="nav-pill-btn"
                style={{ background: "rgba(255,107,157,0.1)", borderColor: "rgba(255,107,157,0.2)", color: "#FF8FB3" }}>
                <IconLogOut size={13} color="currentColor" />
                {t("nav_signout")}
              </button>
            ) : (
              <>
                <button className="nav-text-btn" onClick={() => go("/sign-in")}>{t("nav_signin")}</button>
                <button onClick={() => go("/sign-up")} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "linear-gradient(135deg,#F25990,#D93B72)",
                  color: "#fff", border: "none", borderRadius: 999,
                  padding: "8px 20px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 4px 16px rgba(242,89,144,0.40)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap",
                }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}>
                  🎁 {t("nav_signup")}
                </button>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="navbar-hamburger" style={{ display: "none", alignItems: "center", gap: 10 }}>
            {session && (
              <button onClick={handleTrigger} disabled={checking} style={{
                background: "linear-gradient(135deg, rgba(242,89,144,0.25), rgba(176,37,88,0.25))",
                border: "1px solid rgba(242,89,144,0.4)",
                borderRadius: 999, padding: "7px 14px",
                color: "#FF85B3", fontSize: 13, fontWeight: 700,
                cursor: checking ? "wait" : "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span>🔗</span>
                {checking ? "…" : "Link"}
              </button>
            )}
            {!session && (
              <button onClick={() => go("/sign-up")} style={{
                background: "linear-gradient(135deg,#F25990,#D93B72)",
                color: "#fff", border: "none", borderRadius: 999,
                padding: "8px 16px", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Starten 🎁
              </button>
            )}
            <button onClick={() => setMenuOpen(o => !o)} style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 12, padding: 8, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40,
            }} aria-label="Menü">
              {menuOpen ? <IconX size={18} color="#fff" /> : <IconMenu size={18} color="#fff" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className="navbar-mobile-menu" style={{
          display: menuOpen ? "flex" : "none", flexDirection: "column",
          background: "#0C163A", borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "8px 0 20px",
        }}>
          <MobileItem icon={<IconCompass size={16} color="currentColor" />} label="Entdecken" onClick={() => go("/explore")} />
          {session ? (
            <>
              <MobileItem icon={<IconList size={16} color="currentColor" />} label="Meine Listen" onClick={() => go("/dashboard")} />
              <MobileItem icon={<IconGift size={16} color="currentColor" />} label="Feed" onClick={() => go("/feed")} />
              <MobileItem icon={<IconUser size={16} color="currentColor" />} label="Profil" onClick={() => go("/profile")} />
              {isAdmin && <MobileItem icon={<IconSettings size={16} color="currentColor" />} label="Admin" onClick={() => go("/admin")} />}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 20px" }} />
              <MobileItem
                icon={isPine ? <IconSun size={16} color="currentColor" /> : <IconMoon size={16} color="currentColor" />}
                label={isPine ? "Rose-Design" : "Dark-Design"}
                onClick={() => { setTheme(isPine ? "rose" : "pine"); setMenuOpen(false); }}
              />
              <MobileItem icon={<IconGlobe size={16} color="currentColor" />}
                label={lang === "de" ? "English" : "Deutsch"}
                onClick={() => { setLang(lang === "de" ? "en" : "de"); setMenuOpen(false); }} />
              <MobileItem icon={<IconLogOut size={16} color="currentColor" />} label="Abmelden" onClick={signOut} muted />
            </>
          ) : (
            <>
              <MobileItem label="Anmelden" onClick={() => go("/sign-in")} />
              <div style={{ padding: "8px 16px" }}>
                <button onClick={() => go("/sign-up")} style={{
                  width: "100%", background: "linear-gradient(135deg,#F25990,#D93B72)",
                  color: "#fff", border: "none", borderRadius: 16,
                  padding: 16, fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: "0 4px 16px rgba(242,89,144,0.35)",
                }}>
                  Kostenlos registrieren 🎁
                </button>
              </div>
              <MobileItem icon={<IconGlobe size={16} color="currentColor" />}
                label={lang === "de" ? "English" : "Deutsch"}
                onClick={() => { setLang(lang === "de" ? "en" : "de"); setMenuOpen(false); }} />
            </>
          )}
        </div>
      </nav>

      {/* Bottom Sheet global */}
      <Sheet />
    </>
  );
}

function MobileItem({ icon, label, onClick, muted }: {
  icon?: React.ReactNode; label: string; onClick: () => void; muted?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", textAlign: "left",
      padding: "12px 20px", fontSize: 14, fontWeight: 600,
      color: muted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
      cursor: "pointer", width: "100%",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      display: "flex", alignItems: "center", gap: 12,
    }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
      {icon && <span style={{ opacity: muted ? 0.4 : 0.7 }}>{icon}</span>}
      {label}
    </button>
  );
}
