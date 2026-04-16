import { useState } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function SignIn() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Anmeldung fehlgeschlagen");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen blob-bg flex items-center justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10">
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
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
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
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground font-body font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {loading ? t("loading") : t("signin_btn")}
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
