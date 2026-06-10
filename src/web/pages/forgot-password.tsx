import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success("E-Mail gesendet!");
    } catch {
      toast.error("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen blob-bg flex items-center justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10">

          {sent ? (
            <div className="text-center">
              <span className="text-5xl block mb-4">📬</span>
              <h1 className="font-display text-2xl font-bold text-foreground mb-3">
                E-Mail gesendet
              </h1>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mb-6">
                Falls ein Konto mit <strong className="text-foreground">{email}</strong> existiert,
                hast du in wenigen Minuten eine E-Mail mit einem Link zum Zurücksetzen deines Passworts.
              </p>
              <p className="font-body text-xs text-muted-foreground mb-8">
                Auch den Spam-Ordner prüfen, falls die Mail nicht ankommt.
              </p>
              <button
                onClick={() => navigate("/sign-in")}
                className="w-full bg-accent text-accent-foreground font-body font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Zurück zum Login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <span className="text-4xl block mb-3">🔑</span>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Passwort vergessen?
                </h1>
                <p className="font-body text-muted-foreground mt-2 text-sm leading-relaxed">
                  Kein Problem. Gib deine E-Mail-Adresse ein und wir schicken dir einen Link zum Zurücksetzen.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-body font-semibold text-foreground mb-1.5">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="deine@email.de"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-accent-foreground font-body font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
                >
                  {loading ? "Wird gesendet…" : "Zurücksetzen-Link senden"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate("/sign-in")}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Zurück zum Login
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
