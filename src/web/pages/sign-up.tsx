import { useState } from "react";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Theme>("rose");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message || "Registrierung fehlgeschlagen");
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
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Min. 8 Zeichen"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-body font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 mt-2"
              style={{ background: selectedTheme === "teal" ? "#2DD4BF" : "#FF6B8A", color: selectedTheme === "teal" ? "#0F1923" : "#fff" }}
            >
              {loading ? t("loading") : `${t("signup_btn")} ✨`}
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
