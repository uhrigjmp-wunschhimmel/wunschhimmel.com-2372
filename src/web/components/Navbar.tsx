import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isTeal = theme === "teal";
  const accent = isTeal ? "#2DD4BF" : "#FF6B8A";
  const accentText = isTeal ? "#0F1923" : "#fff";

  useEffect(() => {
    if (!session?.user) { setIsAdmin(false); return; }
    fetch("/api/profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((p: any) => { if (p?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, [session?.user?.id]);

  // Close menu on navigate
  const go = (path: string) => { setMenuOpen(false); navigate(path); };

  const signOut = async () => {
    await authClient.signOut();
    go("/");
  };

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
      `}</style>

      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: isTeal ? "#0F1923" : "#1A1A4E", borderBottom: `1px solid ${isTeal ? "#1E3A4A" : "rgba(255,107,138,0.15)"}` }}
      >
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <button onClick={() => go("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
            <img src="/logo-icon.png" alt="Wunschhimmel" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
            <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: 18, color: isTeal ? "#2DD4BF" : "#FFD6D6" }}>
              Wunschhimmel
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="navbar-desktop" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <NavLinks session={session} isAdmin={isAdmin} isTeal={isTeal} accent={accent} accentText={accentText}
              lang={lang} go={go} setLang={setLang} setTheme={setTheme} signOut={signOut} t={t} />
          </div>

          {/* Mobile: right side = CTA + hamburger */}
          <div className="navbar-hamburger" style={{ display: "none", alignItems: "center", gap: 10 }}>
            {!session && (
              <button onClick={() => go("/sign-up")}
                style={{ background: accent, color: accentText, border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Kostenlos starten
              </button>
            )}
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", width: 38, height: 38 }}
              aria-label="Menü"
            >
              <span style={{ width: 18, height: 2, background: "#fff", borderRadius: 2, transition: "transform 0.2s", transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
              <span style={{ width: 18, height: 2, background: "#fff", borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
              <span style={{ width: 18, height: 2, background: "#fff", borderRadius: 2, transition: "transform 0.2s", transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className="navbar-mobile-menu" style={{
          display: menuOpen ? "flex" : "none",
          flexDirection: "column",
          background: isTeal ? "#0F1923" : "#1A1A4E",
          borderTop: `1px solid rgba(255,255,255,0.08)`,
          padding: "8px 0 16px",
        }}>
          <MobileNavItem label="Entdecken" onClick={() => go("/explore")} />
          {session ? (
            <>
              <MobileNavItem label="Meine Listen" onClick={() => go("/dashboard")} />
              <MobileNavItem label="Feed" onClick={() => go("/feed")} />
              <MobileNavItem label="Profil" onClick={() => go("/profile")} />
              {isAdmin && <MobileNavItem label="⚙️ Admin" onClick={() => go("/admin")} />}
              <MobileNavItem label={isTeal ? "🌸 Rose-Design" : "🌊 Teal-Design"} onClick={() => { setTheme(isTeal ? "rose" : "teal"); setMenuOpen(false); }} />
              <MobileNavItem label="Abmelden" onClick={signOut} muted />
            </>
          ) : (
            <>
              <MobileNavItem label="Anmelden" onClick={() => go("/sign-in")} />
              <div style={{ padding: "8px 16px" }}>
                <button onClick={() => go("/sign-up")}
                  style={{ width: "100%", background: accent, color: accentText, border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  Kostenlos registrieren 🎁
                </button>
              </div>
            </>
          )}
          <div style={{ padding: "8px 16px 0" }}>
            <button onClick={() => { setLang(lang === "de" ? "en" : "de"); setMenuOpen(false); }}
              style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              {lang === "de" ? "🌐 English" : "🌐 Deutsch"}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

function MobileNavItem({ label, onClick, muted }: { label: string; onClick: () => void; muted?: boolean }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", textAlign: "left",
      padding: "13px 20px", fontSize: 15, fontWeight: 600,
      color: muted ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
      cursor: "pointer", width: "100%",
    }}>
      {label}
    </button>
  );
}

function NavLinks({ session, isAdmin, isTeal, accent, accentText, lang, go, setLang, setTheme, signOut, t }: any) {
  return (
    <>
      <button onClick={() => go("/explore")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 14, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        {t("nav_explore")}
      </button>
      {session ? (
        <>
          <button onClick={() => go("/dashboard")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 14, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{t("nav_dashboard")}</button>
          <button onClick={() => go("/feed")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 14, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Feed</button>
          <button onClick={() => go("/profile")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 14, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Profil</button>
          <button onClick={() => setTheme(isTeal ? "rose" : "teal")}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "6px 12px", background: "none", color: isTeal ? "#2DD4BF" : "#FFD6D6", cursor: "pointer" }}>
            {isTeal ? "🌸" : "🌊"}
          </button>
          {isAdmin && (
            <button onClick={() => go("/admin")}
              style={{ background: accent, color: accentText, border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              ⚙️ Admin
            </button>
          )}
          <button onClick={signOut}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 13, color: "#fff", cursor: "pointer" }}>
            {t("nav_signout")}
          </button>
        </>
      ) : (
        <>
          <button onClick={() => go("/sign-in")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 14, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{t("nav_signin")}</button>
          <button onClick={() => go("/sign-up")}
            style={{ background: accent, color: accentText, border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {t("nav_signup")}
          </button>
        </>
      )}
      <button onClick={() => setLang(lang === "de" ? "en" : "de")}
        style={{ fontSize: 12, border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "5px 10px", background: "none", color: "#fff", cursor: "pointer" }}>
        {lang === "de" ? "EN" : "DE"}
      </button>
    </>
  );
}
