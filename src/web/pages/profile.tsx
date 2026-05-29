import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { api } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

// ─── Passwort-Stärke ──────────────────────────────────────────────────────────

function checkReqs(pw: string) {
  return {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
  };
}

function strengthScore(pw: string) {
  return Object.values(checkReqs(pw)).filter(Boolean).length;
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const isTeal = theme === "teal";

  const bg         = isTeal ? "#0F1923"          : "var(--background)";
  const cardBg     = isTeal ? "#162230"          : "#FFFFFF";
  const border     = isTeal ? "#1E3A4A"          : "#EAD9D9";
  const foreground = isTeal ? "#E8F5F3"          : "var(--primary)";
  const muted      = isTeal ? "#7FBFB5"          : "#6B6B9A";
  const accent     = isTeal ? "#2DD4BF"          : "var(--accent)";

  // ─── Avatar State ─────────────────────────────────────────────────────────────
  const [profile, setProfile]     = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) return;
    api.getProfile().then(p => {
      setProfile(p);
      setAvatarUrl(p.avatarUrl || null);
    }).catch(() => {});
  }, [session]);

  if (!session) { navigate("/sign-in"); return null; }

  // ─── Avatar Handler ───────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await api.uploadAvatar(file);
      setAvatarUrl(res.avatarUrl);
      toast.success("Profilbild gespeichert!");
    } catch {
      toast.error("Upload fehlgeschlagen");
      setAvatarUrl(profile?.avatarUrl || null);
    } finally {
      setUploading(false);
    }
  };

  // ─── Passwort State ───────────────────────────────────────────────────────────
  const [pwOpen,      setPwOpen]      = useState(false);
  const [currentPw,   setCurrentPw]   = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [pwLoading,   setPwLoading]   = useState(false);
  const [pwError,     setPwError]     = useState<string | null>(null);
  const [pwSuccess,   setPwSuccess]   = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const req            = checkReqs(newPw);
  const allReqMet      = Object.values(req).every(Boolean);
  const passwordsMatch = newPw === confirmPw && confirmPw.length > 0;
  const score          = strengthScore(newPw);
  const canSave        = !pwLoading && currentPw.length > 0 && allReqMet && passwordsMatch;

  const strengthLabel = ["", "Schwach", "Mittel", "Gut", "Stark"][score] ?? "";
  const strengthColor = score <= 1 ? "#E83B3B" : score === 2 ? "#F5A500" : "#2CA96E";

  const resetPwForm = () => {
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwError(null); setPwSuccess(false); setPwLoading(false);
    setShowCurrent(false); setShowNew(false); setShowConfirm(false);
    setPwOpen(false);
  };

  const handlePasswordSave = async () => {
    setPwError(null);
    if (!currentPw)          return setPwError("Bitte gib dein aktuelles Passwort ein.");
    if (!allReqMet)          return setPwError("Das neue Passwort erfüllt nicht alle Anforderungen.");
    if (!passwordsMatch)     return setPwError("Die Passwörter stimmen nicht überein.");
    if (currentPw === newPw) return setPwError("Das neue Passwort darf nicht mit dem aktuellen übereinstimmen.");

    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Passwort konnte nicht geändert werden.");
      }
      setPwSuccess(true);
      toast.success("Passwort erfolgreich geändert!");
    } catch (err: any) {
      setPwError(err?.message ?? "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setPwLoading(false);
    }
  };

  // ─── Profil löschen State ─────────────────────────────────────────────────────
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState<string | null>(null);

  const canDelete = deleteConfirm.trim().toLowerCase() === "löschen";

  const resetDeleteForm = () => {
    setDeleteOpen(false);
    setDeleteConfirm("");
    setDeleteError(null);
    setDeleteLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!canDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Konto konnte nicht gelöscht werden.");
      }
      await authClient.signOut();
      toast.success("Konto wurde gelöscht.");
      navigate("/");
    } catch (err: any) {
      setDeleteError(err?.message ?? "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      setDeleteLoading(false);
    }
  };

  // ─── Kleine Hilfskomponenten ──────────────────────────────────────────────────

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      )}
    </svg>
  );

  const PwInput = ({
    id, label, value, onChange, show, onToggle, placeholder, autoComplete,
  }: {
    id: string; label: string; value: string; onChange: (v: string) => void;
    show: boolean; onToggle: () => void; placeholder: string; autoComplete: string;
  }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-xs font-body font-semibold uppercase tracking-wide mb-1" style={{ color: muted }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full font-body text-sm rounded-xl px-4 py-3 pr-10 outline-none transition-colors"
          style={{
            background: isTeal ? "#0F1923" : "#FDF8FC",
            border: `1.5px solid ${border}`,
            color: foreground,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = accent)}
          onBlur={e  => (e.currentTarget.style.borderColor = border)}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
          style={{ color: muted }}
        >
          <EyeIcon visible={show} />
        </button>
      </div>
    </div>
  );

  const ReqItem = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-xs font-body transition-colors" style={{ color: met ? "#2CA96E" : muted }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {met ? (<><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></>) : (<circle cx="12" cy="12" r="10"/>)}
      </svg>
      {label}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: bg }}>
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate("/dashboard")} className="font-body text-sm mb-6 block transition-colors hover:opacity-80" style={{ color: muted }}>
          ← Zurück
        </button>

        <div className="rounded-3xl p-8" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <h1 className="font-display text-2xl font-bold mb-8" style={{ color: foreground }}>Mein Profil</h1>

          {/* ── Avatar ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" style={{ border: `3px solid ${accent}` }} />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-display font-bold" style={{ background: accent, color: isTeal ? "#0F1923" : "#fff", border: `3px solid ${accent}` }}>
                  {session.user.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: accent, color: isTeal ? "#0F1923" : "#fff" }}
              >
                {uploading ? "⏳" : "✏️"}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="font-body text-sm mt-3" style={{ color: muted }}>Klick auf ✏️ um ein Bild hochzuladen</p>
          </div>

          {/* ── Info ────────────────────────────────────────────────────────── */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-body font-semibold uppercase tracking-wide mb-1" style={{ color: muted }}>Name</label>
              <p className="font-body font-medium" style={{ color: foreground }}>{session.user.name}</p>
            </div>
            <div>
              <label className="block text-xs font-body font-semibold uppercase tracking-wide mb-1" style={{ color: muted }}>E-Mail</label>
              <p className="font-body font-medium" style={{ color: foreground }}>{session.user.email}</p>
            </div>
          </div>

          {/* ── Passwort ändern ──────────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${border}` }} className="pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-body font-semibold uppercase tracking-wide" style={{ color: muted }}>Passwort</label>
              {!pwOpen && !pwSuccess && (
                <button
                  onClick={() => { setPwOpen(true); setPwError(null); }}
                  className="font-body text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
                  style={{ background: isTeal ? "#1E3A4A" : "#FFF0F5", color: accent, border: `1px solid ${isTeal ? "#2DD4BF33" : "#FFB3D1"}` }}
                >
                  Passwort ändern
                </button>
              )}
            </div>

            {/* Erfolg */}
            {pwSuccess && (
              <div className="rounded-2xl p-4 text-center" style={{ background: isTeal ? "#0a2a1e" : "#F0FDF7", border: "1.5px solid #2CA96E" }}>
                <p className="font-display font-bold mb-1" style={{ color: foreground }}>Passwort geändert ✦</p>
                <p className="font-body text-sm" style={{ color: muted }}>Dein neues Passwort ist aktiv.</p>
                <button onClick={resetPwForm} className="font-body text-xs mt-3 underline hover:opacity-70" style={{ color: muted }}>Schließen</button>
              </div>
            )}

            {/* Formular */}
            {pwOpen && !pwSuccess && (
              <div className="rounded-2xl p-5" style={{ background: isTeal ? "#0F1923" : "#FFF5FA", border: `1px solid ${border}` }}>

                {/* Globaler Fehler */}
                {pwError && (
                  <div className="rounded-xl px-4 py-3 mb-4 font-body text-sm" style={{ background: isTeal ? "#2a0a0a" : "#FFF0F0", border: "1.5px solid #E83B3B", color: "#E83B3B" }}>
                    {pwError}
                  </div>
                )}

                <PwInput
                  id="currentPw" label="Aktuelles Passwort"
                  value={currentPw} onChange={setCurrentPw}
                  show={showCurrent} onToggle={() => setShowCurrent(v => !v)}
                  placeholder="••••••••" autoComplete="current-password"
                />

                <div style={{ borderTop: `1px solid ${border}` }} className="my-4" />

                <PwInput
                  id="newPw" label="Neues Passwort"
                  value={newPw} onChange={setNewPw}
                  show={showNew} onToggle={() => setShowNew(v => !v)}
                  placeholder="Mindestens 8 Zeichen" autoComplete="new-password"
                />

                {/* Stärke-Balken */}
                {newPw.length > 0 && (
                  <div className="mb-4 -mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-colors" style={{ background: i < score ? strengthColor : border }} />
                      ))}
                    </div>
                    <p className="text-xs font-body text-right font-semibold" style={{ color: strengthColor }}>{strengthLabel}</p>
                  </div>
                )}

                {/* Anforderungen */}
                <div className="rounded-xl p-3 mb-4 grid grid-cols-2 gap-y-1.5 gap-x-3" style={{ background: isTeal ? "#162230" : "#FFF0F5" }}>
                  <ReqItem met={req.length}    label="8+ Zeichen" />
                  <ReqItem met={req.uppercase} label="Großbuchstabe" />
                  <ReqItem met={req.number}    label="Zahl (0–9)" />
                  <ReqItem met={req.special}   label="Sonderzeichen" />
                </div>

                <PwInput
                  id="confirmPw" label="Neues Passwort bestätigen"
                  value={confirmPw} onChange={setConfirmPw}
                  show={showConfirm} onToggle={() => setShowConfirm(v => !v)}
                  placeholder="Passwort wiederholen" autoComplete="new-password"
                />

                {/* Match-Hinweis */}
                {confirmPw.length > 0 && (
                  <p className="font-body text-xs -mt-2 mb-4" style={{ color: passwordsMatch ? "#2CA96E" : "#E83B3B" }}>
                    {passwordsMatch ? "Passwörter stimmen überein ✓" : "Passwörter stimmen nicht überein"}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={resetPwForm}
                    className="font-body text-sm font-semibold px-5 py-2.5 rounded-full transition-opacity hover:opacity-70"
                    style={{ background: isTeal ? "#1E3A4A" : "#FFF0F5", color: muted, border: `1px solid ${border}` }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handlePasswordSave}
                    disabled={!canSave}
                    className="flex-1 font-body text-sm font-bold py-2.5 rounded-full transition-all"
                    style={{
                      background: canSave
                        ? isTeal
                          ? "linear-gradient(135deg, #2DD4BF, #0e9f8a)"
                          : "linear-gradient(135deg, #F25990, #B02558)"
                        : border,
                      color: canSave ? (isTeal ? "#0F1923" : "#fff") : muted,
                      cursor: canSave ? "pointer" : "default",
                      boxShadow: canSave
                        ? isTeal
                          ? "0 4px 14px rgba(45,212,191,0.25)"
                          : "0 4px 14px rgba(210,59,114,0.25)"
                        : "none",
                    }}
                  >
                    {pwLoading ? "Wird gespeichert…" : "Passwort speichern"}
                  </button>
                </div>
              </div>
            )}

            {/* Collapsed state */}
            {!pwOpen && !pwSuccess && (
              <p className="font-body text-sm" style={{ color: foreground }}>••••••••</p>
            )}
          </div>

          {/* ── Theme Toggle ─────────────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${border}` }} className="pt-6">
            <label className="block text-xs font-body font-semibold uppercase tracking-wide mb-3" style={{ color: muted }}>Design</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: "rose", label: "🌸 Rose", preview: "linear-gradient(135deg, var(--rose-soft), var(--background))" },
                { id: "teal", label: "🌊 Teal", preview: "linear-gradient(135deg, #0F1923, #0e4a5a)" },
              ] as const).map(th => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className="rounded-2xl p-3 text-sm font-body font-semibold transition-all border-2"
                  style={{
                    background: th.preview,
                    color: th.id === "teal" ? "#2DD4BF" : "var(--primary)",
                    borderColor: theme === th.id ? accent : "transparent",
                    transform: theme === th.id ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  {th.label}
                  {theme === th.id && " ✓"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Konto löschen ────────────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${border}` }} className="pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-body font-semibold uppercase tracking-wide" style={{ color: muted }}>Konto</label>
              {!deleteOpen && (
                <button
                  onClick={() => { setDeleteOpen(true); setDeleteError(null); }}
                  className="font-body text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
                  style={{ background: isTeal ? "#2a0a0a" : "#FFF0F0", color: "#E83B3B", border: "1px solid #E83B3B44" }}
                >
                  Konto löschen
                </button>
              )}
            </div>

            {deleteOpen && (
              <div className="rounded-2xl p-5" style={{ background: isTeal ? "#1a0a0a" : "#FFF5F5", border: "1.5px solid #E83B3B44" }}>
                <p className="font-body text-sm mb-1 font-semibold" style={{ color: "#E83B3B" }}>
                  Achtung – diese Aktion ist unwiderruflich.
                </p>
                <p className="font-body text-xs mb-4" style={{ color: muted }}>
                  Alle deine Daten, Wünsche und Einstellungen werden dauerhaft gelöscht. Tippe <strong style={{ color: foreground }}>löschen</strong> ein, um zu bestätigen.
                </p>

                {deleteError && (
                  <div className="rounded-xl px-4 py-3 mb-4 font-body text-sm" style={{ background: isTeal ? "#2a0a0a" : "#FFF0F0", border: "1.5px solid #E83B3B", color: "#E83B3B" }}>
                    {deleteError}
                  </div>
                )}

                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="löschen"
                  className="w-full font-body text-sm rounded-xl px-4 py-3 outline-none transition-colors mb-4"
                  style={{
                    background: isTeal ? "#0F1923" : "#FDF8FC",
                    border: `1.5px solid ${canDelete ? "#E83B3B" : border}`,
                    color: foreground,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#E83B3B")}
                  onBlur={e  => (e.currentTarget.style.borderColor = canDelete ? "#E83B3B" : border)}
                />

                <div className="flex gap-3">
                  <button
                    onClick={resetDeleteForm}
                    className="font-body text-sm font-semibold px-5 py-2.5 rounded-full transition-opacity hover:opacity-70"
                    style={{ background: isTeal ? "#1E3A4A" : "#FFF0F5", color: muted, border: `1px solid ${border}` }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!canDelete || deleteLoading}
                    className="flex-1 font-body text-sm font-bold py-2.5 rounded-full transition-all"
                    style={{
                      background: canDelete && !deleteLoading ? "#E83B3B" : border,
                      color: canDelete && !deleteLoading ? "#fff" : muted,
                      cursor: canDelete && !deleteLoading ? "pointer" : "default",
                      boxShadow: canDelete && !deleteLoading ? "0 4px 14px rgba(232,59,59,0.3)" : "none",
                    }}
                  >
                    {deleteLoading ? "Wird gelöscht…" : "Konto endgültig löschen"}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
