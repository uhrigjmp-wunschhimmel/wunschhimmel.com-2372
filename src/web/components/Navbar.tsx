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

  const isTeal = theme === "teal";

  useEffect(() => {
    if (!session?.user) { setIsAdmin(false); return; }
    fetch("/api/profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((p: any) => { if (p?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, [session?.user?.id]);

  const signOut = async () => {
    await authClient.signOut();
    navigate("/");
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: isTeal ? "#0F1923" : "#1A1A4E", borderBottom: `1px solid ${isTeal ? "#1E3A4A" : "transparent"}` }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="Wunschhimmel" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <span
            className="font-display font-bold text-xl"
            style={{ color: isTeal ? "#2DD4BF" : "#FFD6D6" }}
          >
            Wunschhimmel
          </span>
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/explore")}
            className="text-sm text-white/80 hover:text-white transition-colors font-body"
          >
            {t("nav_explore")}
          </button>

          {session ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-white/80 hover:text-white transition-colors font-body"
              >
                {t("nav_dashboard")}
              </button>

              <button
                onClick={() => navigate("/feed")}
                className="text-sm text-white/80 hover:text-white transition-colors font-body"
              >
                Feed
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="text-sm text-white/80 hover:text-white transition-colors font-body"
              >
                Profil
              </button>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(isTeal ? "rose" : "teal")}
                title={isTeal ? "Zu Rose wechseln" : "Zu Teal wechseln"}
                className="flex items-center gap-1.5 text-xs border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-full transition-colors font-body"
                style={{ color: isTeal ? "#2DD4BF" : "#FFD6D6" }}
              >
                {isTeal ? "🌸" : "🌊"}
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="text-sm font-body font-semibold px-4 py-2 rounded-full transition-colors"
                  style={{ background: isTeal ? "#2DD4BF" : "#FF6B8A", color: isTeal ? "#0F1923" : "#fff" }}
                >
                  ⚙️ Admin
                </button>
              )}

              <button
                onClick={signOut}
                className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors font-body"
              >
                {t("nav_signout")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/sign-in")}
                className="text-sm text-white/80 hover:text-white transition-colors font-body"
              >
                {t("nav_signin")}
              </button>
              <button
                onClick={() => navigate("/sign-up")}
                className="text-sm font-body font-semibold px-4 py-2 rounded-full transition-colors"
                style={{ background: isTeal ? "#2DD4BF" : "#FF6B8A", color: isTeal ? "#0F1923" : "#fff" }}
              >
                {t("nav_signup")}
              </button>
            </>
          )}

          {/* Lang toggle */}
          <button
            onClick={() => setLang(lang === "de" ? "en" : "de")}
            className="text-xs border border-white/30 hover:border-white px-2.5 py-1 rounded-full transition-colors font-body text-white"
          >
            {lang === "de" ? "EN" : "DE"}
          </button>
        </div>
      </div>
    </nav>
  );
}
