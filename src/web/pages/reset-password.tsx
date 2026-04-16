import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setTokenError(true);
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      toast.error("Die Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      });
      if (res.status === 400) {
        const data = await res.json() as { message?: string };
        if (data.message?.toLowerCase().includes("token")) {
          setTokenError(true);
          return;
        }
        throw new Error(data.message);
      }
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      toast.error("Etwas ist schiefgelaufen. Bitte fordere einen neuen Link an.");
    } finally {
      setLoading(false);
    }
  };

  // Invalid / expired token
  if (tokenError) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center pt-20 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10 text-center">
            <span className="text-5xl block mb-4">⚠️</span>
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              Link ungültig oder abgelaufen
            </h1>
            <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8">
              Dieser Link ist nicht mehr gültig. Links zum Zurücksetzen sind nur 1 Stunde gültig.
              Bitte fordere einen neuen an.
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full bg-accent text-accent-foreground font-body font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Neuen Link anfordern
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (done) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center pt-20 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10 text-center">
            <span className="text-5xl block mb-4">✅</span>
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              Passwort geändert!
            </h1>
            <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8">
              Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt mit deinem neuen Passwort anmelden.
            </p>
            <button
              onClick={() => navigate("/sign-in")}
              className="w-full bg-accent text-accent-foreground font-body font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Zum Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen blob-bg flex items-center justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10">
          <div className="text-center mb-8">
            <span className="text-4xl block mb-3">🔐</span>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Neues Passwort festlegen
            </h1>
            <p className="font-body text-muted-foreground mt-2 text-sm">
              Mindestens 8 Zeichen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-1.5">
                Neues Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                minLength={8}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-1.5">
                Passwort bestätigen
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Passwort wiederholen"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground font-body font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {loading ? "Wird gespeichert…" : "Passwort speichern"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
