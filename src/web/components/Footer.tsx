import { useLocation } from "wouter";

export function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer style={{ background: "#1A1A4E", padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
      <div style={{ fontWeight: 800, fontSize: 16, color: "#FFD6D6", marginBottom: 4, fontFamily: "Playfair Display, serif" }}>
        Wunschhimmel
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 12 }}>
        Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
        <button
          onClick={() => navigate("/impressum")}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer" }}
        >
          Impressum
        </button>
        <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 6px" }}>·</span>
        <button
          onClick={() => navigate("/datenschutz")}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer" }}
        >
          Datenschutz
        </button>
        <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 6px" }}>·</span>
        <button
          onClick={() => navigate("/agb")}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer" }}
        >
          AGB
        </button>
      </div>
      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 12 }}>
        © {new Date().getFullYear()} Wunschhimmel
      </p>
    </footer>
  );
}
