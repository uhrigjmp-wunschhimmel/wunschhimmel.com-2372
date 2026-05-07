import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function SignIn() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Bereits eingeloggt → direkt weiterleiten
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      navigate("/dashboard");
    }
  }, [session, sessionLoading]);

  if (sessionLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const { error: err, data } = await authClient.signIn.email({ email, password });

    if (err) {
      setLoading(false);
      // Nutzfreundliche Fehlermeldungen
      if (err.message?.toLowerCase().includes("password") || err.message?.toLowerCase().includes("invalid")) {
        setError("E-Mail oder Passwort ist falsch. Bitte erneut versuchen.");
      } else if (err.message?.toLowerCase().includes("not found") || err.message?.toLowerCase().includes("user")) {
        setError("Kein Konto mit dieser E-Mail gefunden.");
      } else {
        setError(err.message || "Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
      }
      return;
    }

    // Erfolg — Name aus Session holen falls vorhanden
    const name = (data as any)?.user?.name?.split(" ")[0] ?? null;
    setSuccess(name ? `Willkommen zurück, ${name}! 🎉` : "Erfolgreich angemeldet! 🎉");
    setLoading(false);

    // Kurze Pause für die Erfolgs-Animation, dann redirect
    setTimeout(() => navigate("/dashboard"), 1200);
  };

  // Erfolgs-Screen
  if (success) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center px-4">
        <div
          style={{
            animation: "fadeInScale 0.4s ease forwards",
            textAlign: "center",
          }}
        >
          <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.85); }
              to   { opacity: 1; transform: scale(1); }
            }
            @keyframes checkDraw {
              from { stroke-dashoffset: 60; }
              to   { stroke-dashoffset: 0; }
            }
            @keyframes circlePop {
              0%   { transform: scale(0); opacity: 0; }
              60%  { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>

          {/* Checkmark */}
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #2D1B69, #FF6B8A)", animation: "circlePop 0.45s ease forwards", marginBottom: 20 }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <polyline
                points="8,19 16,27 30,11"
                stroke="#fff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="60"
                strokeDashoffset="60"
                style={{ animation: "checkDraw 0.4s ease 0.3s forwards" }}
              />
            </svg>
          </div>

          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{success}</p>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 6 }}>Du wirst weitergeleitet…</p>

          {/* Lade-Balken */}
          <div style={{ marginTop: 20, height: 3, width: 180, background: "var(--border)", borderRadius: 99, overflow: "hidden", margin: "20px auto 0" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg, #2D1B69, #FF6B8A)", borderRadius: 99, animation: "progressBar 1.1s linear forwards" }} />
          </div>
          <style>{`
            @keyframes progressBar {
              from { width: 0%; }
              to   { width: 100%; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen blob-bg flex items-center justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10" style={{ animation: "fadeUp 0.35s ease" }}>
          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes shake {
              0%,100% { transform: translateX(0); }
              20%      { transform: translateX(-6px); }
              40%      { transform: translateX(6px); }
              60%      { transform: translateX(-4px); }
              80%      { transform: translateX(4px); }
            }
            .input-error { animation: shake 0.4s ease; }
          `}</style>

          <div className="text-center mb-8">
            <span className="text-4xl block mb-3">✨</span>
            <h1 className="font-display text-3xl font-bold text-foreground">{t("signin_title")}</h1>
            <p className="font-body text-muted-foreground mt-1">{t("signin_sub")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-1.5">{t("email_label")}</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                required
                className={`w-full bg-input border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${error ? "border-red-400 input-error" : "border-border"}`}
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-body font-semibold text-foreground">{t("password_label")}</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-body text-accent hover:underline"
                >
                  Passwort vergessen?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  required
                  className={`w-full bg-input border rounded-xl px-4 py-3 pr-12 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${error ? "border-red-400" : "border-border"}`}
                  placeholder="••••••••"
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

            {/* Fehlermeldung */}
            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ position: "relative", overflow: "hidden" }}
              className="w-full btn-primary w-full transition-all disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 0.8s linear infinite", width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </svg>
                  Wird angemeldet…
                </>
              ) : (
                t("signin_btn")
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-muted-foreground">
              {t("no_account")}{" "}
              <button onClick={() => navigate("/sign-up")} className="text-accent font-semibold hover:underline">
                {t("signup_btn")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
