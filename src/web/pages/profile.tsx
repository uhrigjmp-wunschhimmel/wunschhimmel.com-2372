import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import { api } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const isTeal = theme === "teal";

  const bg = isTeal ? "#0F1923" : "var(--background)";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const foreground = isTeal ? "#E8F5F3" : "var(--primary)";
  const muted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const accent = isTeal ? "#2DD4BF" : "var(--accent)";

  const [profile, setProfile] = useState<any>(null);
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview immediately
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: bg }}>
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate("/dashboard")} className="font-body text-sm mb-6 block transition-colors hover:opacity-80" style={{ color: muted }}>
          ← Zurück
        </button>

        <div className="rounded-3xl p-8" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <h1 className="font-display text-2xl font-bold mb-8" style={{ color: foreground }}>Mein Profil</h1>

          {/* Avatar */}
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

          {/* Info */}
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

          {/* Theme toggle */}
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
        </div>
      </div>
    </div>
  );
}
