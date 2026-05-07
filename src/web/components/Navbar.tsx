import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import {
  IconCompass, IconList, IconUser, IconLogOut, IconMenu, IconX,
  IconSun, IconMoon, IconGlobe, IconSettings, IconGift
} from "./Icons";

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isTeal = theme === "teal";

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

  const navBg = scrolled
    ? isTeal ? "rgba(15,25,35,0.98)" : "rgba(45,27,105,0.98)"
    : isTeal ? "rgba(15,25,35,0.92)" : "rgba(45,27,105,0.92)";

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
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.75); border-radius: 999px;
          padding: 6px 14px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .nav-pill-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .nav-text-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.72); font-size: 13.5px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 6px 8px; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .nav-text-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }
      `}</style>

      <nav
        className="wh-nav"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: navBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${isTeal ? "rgba(45,212,191,0.1)" : "rgba(255,107,157,0.12)"}`,
          transition: "background 0.3s",
        }}
      >
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <button
            onClick={() => go("/")}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
          >
            <img
              src="/logo-icon.png?v=3"
              alt="Wunschhimmel"
              style={{ width: 32, height: 32, borderRadius: 10, objectFit: "cover", border: `1.5px solid ${isTeal ? "rgba(45,212,191,0.3)" : "rgba(255,107,157,0.3)"}` }}
            />
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700, fontSize: 17,
              color: isTeal ? "#2DD4BF" : "#FFD6E7",
              letterSpacing: "-0.02em",
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
              </>
            ) : null}

            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isTeal ? "rose" : "teal")}
              className="nav-pill-btn"
              title={isTeal ? "Zum Rose-Design wechseln" : "Zum Dark-Design wechseln"}
            >
              {isTeal ? <IconSun size={13} color="currentColor" /> : <IconMoon size={13} color="currentColor" />}
            </button>

            {/* Lang toggle */}
            <button
              onClick={() => setLang(lang === "de" ? "en" : "de")}
              className="nav-pill-btn"
            >
              <IconGlobe size={13} color="currentColor" />
              {lang === "de" ? "EN" : "DE"}
            </button>

            {isAdmin && (
              <button
                onClick={() => go("/admin")}
                className="nav-pill-btn"
                style={{ background: "rgba(255,179,71,0.15)", borderColor: "rgba(255,179,71,0.3)", color: "#FFB347" }}
              >
                <IconSettings size={13} color="currentColor" />
                Admin
              </button>
            )}

            {session ? (
              <button
                onClick={signOut}
                className="nav-pill-btn"
                style={{ background: "rgba(255,107,157,0.1)", borderColor: "rgba(255,107,157,0.2)", color: "#FF8FB3" }}
              >
                <IconLogOut size={13} color="currentColor" />
                {t("nav_signout")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => go("/sign-in")}
                  className="nav-text-btn"
                >
                  {t("nav_signin")}
                </button>
                <button
                  onClick={() => go("/sign-up")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "linear-gradient(135deg,#FF6B9D,#FF8FB3)",
                    color: "#fff", border: "none", borderRadius: 999,
                    padding: "8px 20px", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", boxShadow: "0 4px 16px rgba(255,107,157,0.4)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  🎁 {t("nav_signup")}
                </button>
              </>
            )}
          </div>

          {/* Mobile: right side */}
          <div className="navbar-hamburger" style={{ display: "none", alignItems: "center", gap: 10 }}>
            {!session && (
              <button
                onClick={() => go("/sign-up")}
                style={{
                  background: "linear-gradient(135deg,#FF6B9D,#FF8FB3)",
                  color: "#fff", border: "none", borderRadius: 999,
                  padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Starten 🎁
              </button>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, padding: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 40, height: 40,
                transition: "background 0.15s",
              }}
              aria-label="Menü"
            >
              {menuOpen
                ? <IconX size={18} color="#fff" />
                : <IconMenu size={18} color="#fff" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div
          className="navbar-mobile-menu"
          style={{
            display: menuOpen ? "flex" : "none",
            flexDirection: "column",
            background: isTeal ? "#0F1923" : "#2D1B69",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "8px 0 20px",
            animation: "wh-slide-down 0.2s ease",
          }}
        >
          <MobileItem icon={<IconCompass size={16} color="currentColor" />} label="Entdecken" onClick={() => go("/explore")} />
          {session ? (
            <>
              <MobileItem icon={<IconList size={16} color="currentColor" />} label="Meine Listen" onClick={() => go("/dashboard")} />
              <MobileItem icon={<IconGift size={16} color="currentColor" />} label="Feed" onClick={() => go("/feed")} />
              <MobileItem icon={<IconUser size={16} color="currentColor" />} label="Profil" onClick={() => go("/profile")} />
              {isAdmin && <MobileItem icon={<IconSettings size={16} color="currentColor" />} label="Admin" onClick={() => go("/admin")} />}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 20px" }} />
              <MobileItem
                icon={isTeal ? <IconSun size={16} color="currentColor" /> : <IconMoon size={16} color="currentColor" />}
                label={isTeal ? "Rose-Design" : "Dark-Design"}
                onClick={() => { setTheme(isTeal ? "rose" : "teal"); setMenuOpen(false); }}
              />
              <MobileItem
                icon={<IconGlobe size={16} color="currentColor" />}
                label={lang === "de" ? "English" : "Deutsch"}
                onClick={() => { setLang(lang === "de" ? "en" : "de"); setMenuOpen(false); }}
              />
              <MobileItem icon={<IconLogOut size={16} color="currentColor" />} label="Abmelden" onClick={signOut} muted />
            </>
          ) : (
            <>
              <MobileItem label="Anmelden" onClick={() => go("/sign-in")} />
              <div style={{ padding: "8px 16px" }}>
                <button
                  onClick={() => go("/sign-up")}
                  style={{
                    width: "100%", background: "linear-gradient(135deg,#FF6B9D,#FF8FB3)",
                    color: "#fff", border: "none", borderRadius: 16,
                    padding: 16, fontSize: 15, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: "0 4px 16px rgba(255,107,157,0.35)",
                  }}
                >
                  Kostenlos registrieren 🎁
                </button>
              </div>
              <MobileItem
                icon={<IconGlobe size={16} color="currentColor" />}
                label={lang === "de" ? "English" : "Deutsch"}
                onClick={() => { setLang(lang === "de" ? "en" : "de"); setMenuOpen(false); }}
              />
            </>
          )}
        </div>
      </nav>
    </>
  );
}

function MobileItem({ icon, label, onClick, muted }: { icon?: React.ReactNode; label: string; onClick: () => void; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", textAlign: "left",
        padding: "12px 20px", fontSize: 14, fontWeight: 600,
        color: muted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.82)",
        cursor: "pointer", width: "100%",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: "flex", alignItems: "center", gap: 12,
        transition: "background 0.1s",
      }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
    >
      {icon && <span style={{ opacity: muted ? 0.4 : 0.7 }}>{icon}</span>}
      {label}
    </button>
  );
}
