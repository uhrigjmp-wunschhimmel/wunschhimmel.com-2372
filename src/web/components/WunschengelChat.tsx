import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  imageUrl: string;
  affiliateUrl: string;
  category: string;
  tags: string[];
};

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAddWish }: { product: Product; onAddWish: (p: Product) => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      border: "1px solid #F0E8FF",
      boxShadow: "0 2px 12px rgba(45,27,105,0.08)",
      display: "flex",
      flexDirection: "column",
      minWidth: 180,
      maxWidth: 200,
      flexShrink: 0,
    }}>
      {/* Image */}
      <div style={{ height: 130, overflow: "hidden", background: "#FFF5F8", position: "relative" }}>
        <img
          src={imgError ? "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80" : product.imageUrl}
          onError={() => setImgError(true)}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {product.tags.length > 0 && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(45,27,105,0.85)", color: "#fff",
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
          }}>
            {product.tags[0]}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 11, color: "#A89BBD", fontWeight: 600 }}>{product.category}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#2D1B69", lineHeight: 1.3 }}>
          {product.title}
        </div>
        <div style={{ fontSize: 11, color: "#7B6B8D", lineHeight: 1.4, flex: 1 }}>
          {product.description.slice(0, 60)}…
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#FF6B8A", marginTop: 4 }}>
          {product.price != null ? `€ ${product.price.toFixed(2)}` : "Preis auf Partnerseite"}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          onClick={() => onAddWish(product)}
          style={{
            background: "linear-gradient(135deg, #FF6B8A, #FF8FA3)",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "7px 0", fontSize: 11, fontWeight: 700, cursor: "pointer",
            width: "100%",
          }}
        >
          🎁 Zur Wunschliste
        </button>
        <a
          href={product.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", textAlign: "center",
            background: "#F5F0FF", color: "#6D28D9",
            border: "none", borderRadius: 8,
            padding: "7px 0", fontSize: 11, fontWeight: 600, cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Zum Shop ↗
        </a>
      </div>
    </div>
  );
}

// ── Products row renderer ─────────────────────────────────────────────────────
function ProductsRow({ products, onAddWish }: { products: Product[]; onAddWish: (p: Product) => void }) {
  return (
    <div style={{
      display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6,
      scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
    }}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAddWish={onAddWish} />
      ))}
    </div>
  );
}

// ── Message part renderer ─────────────────────────────────────────────────────
function MessagePart({ part, onAddWish }: { part: UIMessage["parts"][number]; onAddWish: (p: Product) => void }) {
  if (part.type === "text" && part.text) {
    return (
      <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{part.text}</span>
    );
  }
  if (part.type === "tool-searchProducts") {
    const tool = part as any;
    if (tool.state !== "output-available") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#A89BBD", fontSize: 13 }}>
          <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>✨</span>
          Suche passende Ideen…
        </div>
      );
    }
    const products: Product[] = tool.output || [];
    if (!products.length) return <span style={{ color: "#A89BBD", fontSize: 13 }}>Keine Ergebnisse gefunden.</span>;
    return <ProductsRow products={products} onAddWish={onAddWish} />;
  }
  return null;
}

// ── Quick reply chips ─────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  ["👩 Freundin", "👦 Kind", "👨 Partner", "👵 Oma"],
  ["🎂 Geburtstag", "🎄 Weihnachten", "💍 Hochzeit", "🎁 Einfach so"],
  ["unter 25€", "25–50€", "50–100€", "über 100€"],
];

// ── Main Chat Widget ──────────────────────────────────────────────────────────
export function WunschengelChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [quickStep, setQuickStep] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/agent/messages" }),
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [{ type: "text", text: "Hallo! Ich bin dein Wunschengel ✨\n\nFür wen suchst du heute eine Idee?" }],
        metadata: {},
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = useCallback((text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage({ text });
    setInput("");
    setQuickStep(q => Math.min(q + 1, QUICK_REPLIES.length - 1));
  }, [isLoading, sendMessage]);

  const handleAddWish = useCallback((product: Product) => {
    // Save to localStorage for guests
    const key = "wh_angel_wishes";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    if (!existing.find((p: Product) => p.id === product.id)) {
      localStorage.setItem(key, JSON.stringify([...existing, product]));
    }
    toast.success(`"${product.title}" zur Wunschliste hinzugefügt! 🎁`);
  }, []);

  return (
    <>
      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wunschengel-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes wunschengel-slide-up { from { opacity:0; transform: translateY(20px) scale(0.95); } to { opacity:1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Wunschengel öffnen"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9000,
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(135deg, #2D1B69, #FF6B8A)",
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 24px rgba(45,27,105,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
          animation: open ? "none" : "wunschengel-bounce 2s ease-in-out infinite",
          transition: "transform 0.2s",
        }}
        onMouseOver={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? "✕" : "🪄"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 24, zIndex: 9000,
          width: "min(420px, calc(100vw - 32px))",
          height: "min(600px, calc(100vh - 120px))",
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 16px 64px rgba(45,27,105,0.2), 0 2px 8px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "wunschengel-slide-up 0.25s ease",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #2D1B69 0%, #4A2C8C 100%)",
            padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>🪄</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Wunschengel</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
                {isLoading ? "tippt…" : "Dein persönlicher Geschenkberater ✨"}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 18, padding: 4 }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12, scrollbarWidth: "thin" }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: 8,
                alignItems: "flex-start",
              }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2D1B69,#FF6B8A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>🪄</div>
                )}
                <div style={{
                  maxWidth: "85%",
                  background: msg.role === "user" ? "linear-gradient(135deg,#FF6B8A,#FF8FA3)" : "#F8F5FF",
                  color: msg.role === "user" ? "#fff" : "#2D1B69",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "10px 14px",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  {msg.parts.map((part, i) => (
                    <MessagePart key={i} part={part} onAddWish={handleAddWish} />
                  ))}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2D1B69,#FF6B8A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🪄</div>
                <div style={{ background: "#F8F5FF", borderRadius: "18px 18px 18px 4px", padding: "10px 16px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#C4B5FD", animation: `wunschengel-bounce 0.9s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {!isLoading && messages.length <= 3 && (
            <div style={{ padding: "0 12px 8px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
              {QUICK_REPLIES[quickStep]?.map(chip => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  style={{
                    background: "#F5F0FF", color: "#6D28D9",
                    border: "1px solid #C4B5FD", borderRadius: 999,
                    padding: "5px 12px", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = "#EDE9FE")}
                  onMouseOut={e => (e.currentTarget.style.background = "#F5F0FF")}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid #F0E8FF",
            display: "flex", gap: 8, alignItems: "flex-end",
            flexShrink: 0,
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Schreib mir was du suchst…"
              disabled={isLoading}
              rows={1}
              style={{
                flex: 1, border: "1.5px solid #E0D4FF", borderRadius: 12,
                padding: "8px 12px", fontSize: 13, fontFamily: "inherit",
                outline: "none", resize: "none", color: "#2D1B69",
                background: isLoading ? "#F8F5FF" : "#fff",
                transition: "border-color 0.2s",
                lineHeight: 1.5,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#FF6B8A")}
              onBlur={e => (e.currentTarget.style.borderColor = "#E0D4FF")}
            />
            <button
              onClick={() => send(input)}
              disabled={isLoading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: isLoading || !input.trim() ? "#E0D4FF" : "linear-gradient(135deg,#FF6B8A,#FF8FA3)",
                border: "none", cursor: isLoading || !input.trim() ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0, transition: "background 0.2s",
              }}
            >
              ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
}
