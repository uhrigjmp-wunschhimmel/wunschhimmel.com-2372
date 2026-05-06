import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";
import { toast } from "sonner";

const THEMES: { id: Theme; label: string; sub: string; bg: string; accent: string; text: string; preview: string }[] = [
  {
    id: "rose",
    label: "Rose",
    sub: "Warm & verspielt",
    bg: "#FFF8F0",
    accent: "#FF6B8A",
    text: "#1A1A4E",
    preview: "linear-gradient(135deg, #FFD6D6 0%, #FFF8F0 60%, #E8DEFF 100%)",
  },
  {
    id: "teal",
    label: "Teal",
    sub: "Modern & dunkel",
    bg: "#0F1923",
    accent: "#2DD4BF",
    text: "#E8F5F3",
    preview: "linear-gradient(135deg, #0F1923 0%, #162230 50%, #0e4a5a 100%)",
  },
];

export default function SignUp() {
  const { t } = useI18n();
  const { setTheme } = useTheme();
  const [, navigate] = useLocation();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>("rose");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Bereits eingeloggt → direkt weiterleiten
  useEffect(() => {
    if (!sessionLoading && session?.user) navigate("/dashboard");
  }, [session, sessionLoading]);

  if (sessionLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setFieldError(null);
    setLoading(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      setLoading(false);
      if (error.message?.toLowerCase().includes("already")) {
        setFieldError("Diese E-Mail ist bereits registriert. Bitte einloggen.");
      } else {
        setFieldError(error.message || "Registrierung fehlgeschlagen");
      }
      return;
    }
    // Save theme choice server-side
    await fetch("/api/profile/init", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: selectedTheme }),
    }).catch(() => {});
    // Apply locally
    await setTheme(selectedTheme);
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen blob-bg flex items-center justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10">
          <div className="text-center mb-8">
            <span className="text-4xl block mb-3">🎁</span>
            <h1 className="font-display text-3xl font-bold text-foreground">{t("signup_title")}</h1>
            <p className="font-body text-muted-foreground mt-1">{t("signup_sub")}</p>
          </div>

          {/* Theme picker */}
          <div className="mb-6">
            <p className="text-sm font-body font-semibold text-foreground mb-3">Dein Design</p>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(th => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSelectedTheme(th.id)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedTheme === th.id ? "scale-[1.03] shadow-lg" : "opacity-70 hover:opacity-90"
                  }`}
                  style={{ borderColor: selectedTheme === th.id ? th.accent : "transparent" }}
                >
                  {/* Preview swatch */}
                  <div style={{ background: th.preview, height: 64 }} />
                  <div style={{ background: th.bg }} className="px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-body font-semibold text-sm" style={{ color: th.text }}>{th.label}</p>
                      <p className="font-body text-xs" style={{ color: th.accent }}>{th.sub}</p>
                    </div>
                    {/* Mini wish items preview */}
                    <div className="flex flex-col gap-1">
                      {[th.accent, th.accent + "80", th.accent + "40"].map((c, i) => (
                        <div key={i} style={{ background: c, width: 20, height: 4, borderRadius: 99 }} />
                      ))}
                    </div>
                  </div>
                  {selectedTheme === th.id && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: th.accent, color: th.bg }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-1.5">{t("name_label")}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Dein Name"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-1.5">{t("email_label")}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="deine@email.de"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-1.5">{t("password_label")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 pr-12 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="Min. 8 Zeichen"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {fieldError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>{fieldError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-body font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
              style={{ background: selectedTheme === "teal" ? "#2DD4BF" : "#FF6B8A", color: selectedTheme === "teal" ? "#0F1923" : "#fff" }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 0.8s linear infinite", width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </svg>
                  Konto wird erstellt…
                </>
              ) : `${t("signup_btn")} ✨`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-muted-foreground">
              {t("has_account")}{" "}
              <button onClick={() => navigate("/sign-in")} className="text-accent font-semibold hover:underline">
                {t("signin_btn")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
