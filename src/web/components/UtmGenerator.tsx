import { useState } from "react";

const SOURCE_PRESETS = ["facebook", "pinterest", "instagram", "newsletter", "mama_blog"];
const MEDIUM_PRESETS = ["social", "referral", "email", "paid"];

function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function buildUrl(source: string, medium: string, campaign: string): string {
  const base = "https://wunschhimmel.com/";
  const params = new URLSearchParams();
  if (source) params.set("utm_source", slugify(source));
  if (medium) params.set("utm_medium", slugify(medium));
  if (campaign) params.set("utm_campaign", slugify(campaign));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function UtmGenerator() {
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const url = buildUrl(source, medium, campaign);

  const fieldLabel: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-accent)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 6,
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    border: "2px solid var(--color-border)",
    borderRadius: 12,
    fontSize: 14,
    color: "var(--color-foreground)",
    background: "var(--color-background)",
    outline: "none",
    fontFamily: "inherit",
  };

  const chip: React.CSSProperties = {
    padding: "5px 12px",
    background: "var(--color-muted)",
    color: "var(--color-accent)",
    border: "none",
    borderRadius: 50,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (url !== "https://wunschhimmel.com/" && !history.includes(url)) {
        setHistory([url, ...history].slice(0, 5));
      }
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard nicht verfügbar, ignorieren
    }
  };

  return (
    <div style={{
      background: "var(--color-card)",
      border: "1px solid var(--color-border)",
      borderRadius: 16,
      padding: 24,
      maxWidth: 520,
    }}>
      <h2 style={{
        fontFamily: "Playfair Display, serif",
        fontSize: 20, fontWeight: 700,
        color: "var(--color-foreground)",
        margin: "0 0 4px",
      }}>
        ✦ UTM-Link-Generator
      </h2>
      <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", margin: "0 0 20px" }}>
        Baue Tracking-Links für deine Marketing-Posts (Facebook, Pinterest, Newsletter etc.)
      </p>

      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabel}>Quelle (utm_source)</label>
        <input
          style={input}
          placeholder="z.B. facebook"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {SOURCE_PRESETS.map((s) => (
            <button key={s} type="button" style={chip} onClick={() => setSource(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabel}>Medium (utm_medium)</label>
        <input
          style={input}
          placeholder="z.B. social"
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {MEDIUM_PRESETS.map((m) => (
            <button key={m} type="button" style={chip} onClick={() => setMedium(m)}>{m}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={fieldLabel}>Kampagne (utm_campaign)</label>
        <input
          style={input}
          placeholder="z.B. geburtstag_gruppe"
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
        />
      </div>

      <div style={{
        background: "var(--color-background)",
        border: "2px solid var(--color-border)",
        borderRadius: 14,
        padding: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Dein fertiger Link
        </div>
        <div style={{ fontSize: 13, color: "var(--color-foreground)", wordBreak: "break-all", lineHeight: 1.5, marginBottom: 12, fontFamily: "monospace" }}>
          {url}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            width: "100%", padding: 12, borderRadius: 50,
            background: copied ? "#2CA96E" : "var(--color-accent)",
            color: "#fff", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 700,
          }}
        >
          {copied ? "✓ Kopiert!" : "Link kopieren"}
        </button>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Zuletzt generiert
          </div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 12px", background: "var(--color-muted)", borderRadius: 10,
              marginBottom: 6, fontSize: 12,
            }}>
              <span style={{ color: "var(--color-muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>
                {h}
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(h)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--color-accent)", fontWeight: 700, flexShrink: 0 }}
              >
                Kopieren
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
