import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import { authClient } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────
type Product = {
  id: string; title: string; description: string;
  price: number | null; currency: string;
  imageUrl: string; affiliateUrl: string;
  category: string; tags: string[];
  partnerId?: string;
};

type Wishlist = { id: string; title: string; emoji: string; };

type Step = "recipient" | "occasion" | "age" | "budget" | "done";

type Recipient = {
  id: string; label: string; avatar: string; occasions: string[];
};

const RECIPIENTS: Recipient[] = [
  { id: "freundin",  label: "Freundin",  avatar: "👩🏼",    occasions: ["Geburtstag","Weihnachten","Valentinstag","Hochzeit","Babyshower","Einfach so"] },
  { id: "freund",    label: "Freund",    avatar: "👨🏽",    occasions: ["Geburtstag","Weihnachten","Valentinstag","Hochzeit","Einfach so"] },
  { id: "partnerin", label: "Partnerin", avatar: "👩🏻",    occasions: ["Geburtstag","Weihnachten","Valentinstag","Jahrestag","Hochzeit","Einfach so"] },
  { id: "partner",   label: "Partner",   avatar: "👨🏼",    occasions: ["Geburtstag","Weihnachten","Valentinstag","Jahrestag","Hochzeit","Einfach so"] },
  { id: "kind",      label: "Kind",      avatar: "🧒🏼",   occasions: ["Geburtstag","Weihnachten","Ostern","Einschulung","Konfirmation / Kommunion","Taufe"] },
  { id: "baby",      label: "Baby",      avatar: "👶🏻",    occasions: ["Geburt","Taufe","Babyshower","1. Geburtstag"] },
  { id: "mama",      label: "Mama",      avatar: "👩🏽",    occasions: ["Geburtstag","Weihnachten","Muttertag","Ostern","Einfach so"] },
  { id: "papa",      label: "Papa",      avatar: "👨🏻",    occasions: ["Geburtstag","Weihnachten","Vatertag","Ostern","Einfach so"] },
  { id: "oma",       label: "Oma",       avatar: "👩🏼‍🦳", occasions: ["Geburtstag","Weihnachten","Muttertag","Ostern","Einfach so"] },
  { id: "opa",       label: "Opa",       avatar: "👨🏼‍🦳", occasions: ["Geburtstag","Weihnachten","Vatertag","Ostern","Einfach so"] },
  { id: "kollegin",  label: "Kollegin",  avatar: "👩🏾",    occasions: ["Geburtstag","Abschied","Weihnachten","Beförderung","Einfach so"] },
  { id: "ich",       label: "Für mich",  avatar: "🙋🏼",   occasions: ["Geburtstag","Weihnachten","Wunschliste","Einfach so"] },
];

const AGE_GROUPS = ["0–2 Jahre", "3–5 Jahre", "6–9 Jahre", "10–12 Jahre", "13–15 Jahre", "16–18 Jahre"];
const BUDGET_OPTIONS = ["unter 25 €", "25 – 50 €", "50 – 100 €", "über 100 €"];

// ── Wishlist Picker ───────────────────────────────────────────────────────────
function WishlistPicker({ product, onClose }: { product: Product; onClose: () => void }) {
  const { data: session } = authClient.useSession();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<"pick" | "new">("pick");

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    fetch("/wishlists", { credentials: "include" })
      .then(r => r.json()).then(d => { setWishlists(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  const addToList = async (wishlistId: string) => {
    const res = await fetch(`/wishlists/${wishlistId}/wishes`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: product.title, description: product.description, imageUrl: product.imageUrl, price: product.price, currency: product.currency, productUrl: product.affiliateUrl, priority: "medium" }),
    });
    if (res.ok) { toast.success(`"${product.title}" hinzugefügt! 🎁`); onClose(); }
    else toast.error("Fehler beim Hinzufügen");
  };

  const createAndAdd = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    const res = await fetch("/wishlists", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newListName.trim(), emoji: "🎁", isPublic: false }),
    });
    if (res.ok) { const list = await res.json(); await addToList(list.id); }
    else { toast.error("Liste konnte nicht erstellt werden"); setCreating(false); }
  };

  const saveGuest = () => {
    const existing = JSON.parse(localStorage.getItem("wh_angel_wishes") || "[]");
    if (!existing.find((p: Product) => p.id === product.id))
      localStorage.setItem("wh_angel_wishes", JSON.stringify([...existing, product]));
    toast.success(`"${product.title}" gespeichert! Melde dich an für Wunschlisten.`);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(45,27,105,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"flex-end", paddingRight:24, paddingBottom:170 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"min(380px, calc(100vw - 48px))", boxShadow:"0 16px 64px rgba(45,27,105,0.3)", overflow:"hidden", animation:"wangel-slide 0.2s ease" }}>
        <div style={{ padding:"14px 18px 12px", borderBottom:"1px solid #F0E8FF", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:"#2D1B69" }}>🎁 Zur Wunschliste hinzufügen</div>
            <div style={{ fontSize:11, color:"#A89BBD", marginTop:1 }}>{product.title}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#A89BBD", padding:4 }}>✕</button>
        </div>
        <div style={{ padding:"12px 18px 16px" }}>
          {!session ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#7B6B8D", marginBottom:12 }}>Du bist nicht angemeldet. Produkt lokal speichern?</div>
              <button onClick={saveGuest} style={{ background:"linear-gradient(135deg,#FF6B8A,#FF8FA3)", color:"#fff", border:"none", borderRadius:10, padding:"9px 20px", fontSize:12, fontWeight:700, cursor:"pointer", width:"100%" }}>Lokal speichern</button>
            </div>
          ) : loading ? (
            <div style={{ textAlign:"center", color:"#A89BBD", fontSize:12, padding:"12px 0" }}>Lade Wunschlisten…</div>
          ) : (
            <>
              {wishlists.length > 0 && (
                <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                  {(["pick","new"] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"6px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background:mode===m?"linear-gradient(135deg,#2D1B69,#4A2C8C)":"#F5F0FF", color:mode===m?"#fff":"#6D28D9" }}>
                      {m === "pick" ? "Vorhandene Liste" : "Neue Liste"}
                    </button>
                  ))}
                </div>
              )}
              {mode === "pick" && wishlists.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:200, overflowY:"auto" }}>
                  {wishlists.map(list => (
                    <button key={list.id} onClick={() => addToList(list.id)}
                      style={{ display:"flex", alignItems:"center", gap:10, background:"#F8F5FF", border:"1.5px solid #E0D4FF", borderRadius:10, padding:"9px 12px", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                      onMouseOver={e => { e.currentTarget.style.background="#EDE9FE"; e.currentTarget.style.borderColor="#C4B5FD"; }}
                      onMouseOut={e => { e.currentTarget.style.background="#F8F5FF"; e.currentTarget.style.borderColor="#E0D4FF"; }}>
                      <span style={{ fontSize:18 }}>{list.emoji||"🎁"}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:"#2D1B69" }}>{list.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {(mode === "new" || wishlists.length === 0) && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {wishlists.length === 0 && <div style={{ fontSize:12, color:"#7B6B8D", marginBottom:4 }}>Du hast noch keine Wunschliste. Erstelle jetzt eine:</div>}
                  <input autoFocus value={newListName} onChange={e => setNewListName(e.target.value)} onKeyDown={e => { if (e.key==="Enter") createAndAdd(); }}
                    placeholder="Name der Liste, z.B. Geburtstag 2025"
                    style={{ border:"1.5px solid #E0D4FF", borderRadius:10, padding:"9px 12px", fontSize:12, color:"#2D1B69", outline:"none", fontFamily:"inherit" }}
                    onFocus={e => (e.currentTarget.style.borderColor="#FF6B8A")} onBlur={e => (e.currentTarget.style.borderColor="#E0D4FF")} />
                  <button onClick={createAndAdd} disabled={!newListName.trim()||creating}
                    style={{ background:!newListName.trim()||creating?"#E0D4FF":"linear-gradient(135deg,#FF6B8A,#FF8FA3)", color:"#fff", border:"none", borderRadius:10, padding:"9px 0", fontSize:12, fontWeight:700, cursor:!newListName.trim()||creating?"default":"pointer" }}>
                    {creating ? "Erstelle…" : "Liste erstellen & hinzufügen"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
// Persistent session ID for click tracking (no auth needed)
const SESSION_ID = (() => {
  if (typeof window === "undefined") return "ssr";
  const key = "wh_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
})();

function trackClick(product: Product, meta: { recipient?: string | null; occasion?: string | null; budget?: string | null }) {
  fetch("/track/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: product.id,
      partnerId: product.partnerId ?? "unknown",
      affiliateUrl: product.affiliateUrl,
      sessionId: SESSION_ID,
      recipient: meta.recipient,
      occasion: meta.occasion,
      budget: meta.budget,
    }),
  }).catch(() => {});
}

function ProductCard({ product, onAddWish, trackMeta }: { product: Product; onAddWish: (p: Product) => void; trackMeta: { recipient?: string | null; occasion?: string | null; budget?: string | null } }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border:"1px solid #F0E8FF", boxShadow:"0 2px 12px rgba(45,27,105,0.08)", display:"flex", flexDirection:"column", minWidth:175, maxWidth:195, flexShrink:0 }}>
      <div style={{ height:120, overflow:"hidden", background:"#FFF5F8", position:"relative" }}>
        <img
          src={imgError ? "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80" : product.imageUrl}
          onError={() => setImgError(true)} alt={product.title}
          style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        {product.tags[0] && (
          <div style={{ position:"absolute", top:7, left:7, background:"rgba(45,27,105,0.85)", color:"#fff", fontSize:9, fontWeight:700, padding:"3px 7px", borderRadius:999 }}>{product.tags[0]}</div>
        )}
      </div>
      <div style={{ padding:"8px 10px", flex:1, display:"flex", flexDirection:"column", gap:3 }}>
        <div style={{ fontSize:10, color:"#A89BBD", fontWeight:600 }}>{product.category}</div>
        <div style={{ fontSize:12, fontWeight:700, color:"#2D1B69", lineHeight:1.3 }}>{product.title}</div>
        <div style={{ fontSize:11, color:"#7B6B8D", lineHeight:1.4, flex:1 }}>{product.description.slice(0, 60)}…</div>
        <div style={{ fontSize:13, fontWeight:800, color:"#FF6B8A", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
          {product.price != null
            ? `€ ${product.price.toFixed(2)}`
            : product.tags?.includes("auf-amazon-suchen")
              ? <span style={{ fontSize:10, fontWeight:700, color:"#E47911", background:"#FFF3E0", padding:"2px 6px", borderRadius:4 }}>amazon.de suchen →</span>
              : "Preis beim Händler"}
        </div>
      </div>
      <div style={{ padding:"0 10px 10px", display:"flex", flexDirection:"column", gap:5 }}>
        <button onClick={() => onAddWish(product)} style={{ background:"linear-gradient(135deg,#FF6B8A,#FF8FA3)", color:"#fff", border:"none", borderRadius:8, padding:"6px 0", fontSize:11, fontWeight:700, cursor:"pointer", width:"100%" }}>
          🎁 Zur Wunschliste
        </button>
        <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer"
          onClick={() => trackClick(product, trackMeta)}
          style={{ display:"block", textAlign:"center", background: product.tags?.includes("auf-amazon-suchen") ? "#FFF3E0" : "#F5F0FF", color: product.tags?.includes("auf-amazon-suchen") ? "#E47911" : "#6D28D9", borderRadius:8, padding:"6px 0", fontSize:11, fontWeight:600, textDecoration:"none" }}>
          {product.tags?.includes("auf-amazon-suchen") ? "Auf Amazon suchen ↗" : "Zum Shop ↗"}
        </a>
      </div>
    </div>
  );
}

function ProductsRow({ products, onAddWish, trackMeta }: { products: Product[]; onAddWish: (p: Product) => void; trackMeta: { recipient?: string | null; occasion?: string | null; budget?: string | null } }) {
  return (
    <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
      {products.map(p => <ProductCard key={p.id} product={p} onAddWish={onAddWish} trackMeta={trackMeta} />)}
    </div>
  );
}

// ── Message Part ─────────────────────────────────────────────────────────────
function MessagePart({ part, hasProducts, onAddWish, trackMeta }: { part: UIMessage["parts"][number]; hasProducts: boolean; onAddWish: (p: Product) => void; trackMeta: { recipient?: string | null; occasion?: string | null; budget?: string | null } }) {
  if (part.type === "text" && part.text) {
    if (hasProducts) return null; // suppress prose when tiles are shown
    return <span style={{ whiteSpace:"pre-wrap", lineHeight:1.6 }}>{part.text}</span>;
  }
  if (part.type === "tool-searchProducts") {
    const tool = part as any;
    if (tool.state !== "output-available")
      return <div style={{ display:"flex", alignItems:"center", gap:6, color:"#A89BBD", fontSize:12 }}><span style={{ display:"inline-block", animation:"wangel-spin 1s linear infinite" }}>✨</span> Suche Ideen…</div>;
    const products: Product[] = Array.isArray(tool.output) ? tool.output : [];
    if (!products.length) return <span style={{ color:"#A89BBD", fontSize:12 }}>Keine Treffer — versuche andere Suchbegriffe.</span>;
    return <ProductsRow products={products} onAddWish={onAddWish} trackMeta={trackMeta} />;
  }
  return null;
}

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background:selected?"linear-gradient(135deg,#FF6B8A,#FF8FA3)":"#F5F0FF", color:selected?"#fff":"#6D28D9", border:selected?"none":"1px solid #C4B5FD", borderRadius:999, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}>
      {label}
    </button>
  );
}

// ── Quick Action Buttons ──────────────────────────────────────────────────────
function QuickActions({ onMore, onRefine, disabled }: { onMore: () => void; onRefine: () => void; disabled: boolean }) {
  return (
    <div style={{ display:"flex", gap:8, marginTop:4 }}>
      <button onClick={onMore} disabled={disabled}
        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, background:disabled?"#F0EBFF":"#F5F0FF", color:disabled?"#C4B5FD":"#6D28D9", border:"1.5px solid", borderColor:disabled?"#E0D4FF":"#C4B5FD", borderRadius:10, padding:"8px 0", fontSize:12, fontWeight:700, cursor:disabled?"default":"pointer", transition:"all 0.15s" }}
        onMouseOver={e => { if (!disabled) { e.currentTarget.style.background="#EDE9FE"; e.currentTarget.style.borderColor="#9471E8"; }}}
        onMouseOut={e => { if (!disabled) { e.currentTarget.style.background="#F5F0FF"; e.currentTarget.style.borderColor="#C4B5FD"; }}}>
        🔄 Weitere Ideen
      </button>
      <button onClick={onRefine} disabled={disabled}
        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, background:disabled?"#FFF0F3":"#FFF0F3", color:disabled?"#FFADC0":"#FF6B8A", border:"1.5px solid", borderColor:disabled?"#FFD6E0":"#FFB3C3", borderRadius:10, padding:"8px 0", fontSize:12, fontWeight:700, cursor:disabled?"default":"pointer", transition:"all 0.15s" }}
        onMouseOver={e => { if (!disabled) { e.currentTarget.style.background="#FFE4EA"; e.currentTarget.style.borderColor="#FF8FA3"; }}}
        onMouseOut={e => { if (!disabled) { e.currentTarget.style.background="#FFF0F3"; e.currentTarget.style.borderColor="#FFB3C3"; }}}>
        ✨ Ideen verfeinern
      </button>
    </div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export function WunschengelChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("recipient");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [interests, setInterests] = useState("");
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [refineMode, setRefineMode] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/agent/messages" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, step, open]);

  const handleAddWish = useCallback((p: Product) => setPickerProduct(p), []);

  const pickRecipient = (r: Recipient) => { setRecipient(r); setStep("occasion"); };
  const pickOccasion = (o: string) => {
    setOccasion(o);
    if (recipient?.id === "kind") setStep("age");
    else setStep("budget");
  };
  const pickAge = (a: string) => { setAgeGroup(a); setStep("budget"); };

  const buildPrompt = (b: string, interestStr: string, agStr: string | null, extra?: string) => {
    const agePart = agStr ? `, Alter: ${agStr}` : "";
    const intPart = interestStr.trim() ? `, Interessen: ${interestStr.trim()}` : "";
    const extraPart = extra ? `. ${extra}` : "";
    return `Suche Geschenkideen für: ${recipient!.label}${agePart}, Anlass: ${occasion}, Budget: ${b}${intPart}${extraPart}. Bitte rufe searchProducts sofort auf.`;
  };

  const pickBudget = (b: string) => {
    setBudget(b);
    setStep("done");
    sendMessage({ text: buildPrompt(b, interests, ageGroup) });
  };

  const loadMore = useCallback(() => {
    if (isLoading || !budget) return;
    // Collect IDs of all already-shown products so the agent can exclude them
    const shownIds: string[] = [];
    for (const msg of messages) {
      for (const part of msg.parts) {
        if (part.type === "tool-searchProducts" && (part as any).state === "output-available") {
          const output = (part as any).output;
          if (Array.isArray(output)) output.forEach((p: Product) => shownIds.push(p.id));
        }
      }
    }
    const excludePart = shownIds.length > 0 ? ` Bereits gezeigte Produkt-IDs die NICHT nochmal erscheinen dürfen: ${shownIds.join(", ")}.` : "";
    sendMessage({ text: `Zeige 6 andere Geschenkideen.${excludePart} Empfänger: ${recipient!.label}, Anlass: ${occasion}, Budget: ${budget}${ageGroup ? `, Alter: ${ageGroup}` : ""}${interests.trim() ? `, Interessen: ${interests}` : ""}. searchProducts sofort aufrufen.` });
  }, [isLoading, budget, recipient, occasion, ageGroup, interests, messages, sendMessage]);

  const doRefine = useCallback((text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage({ text: `Verfeinere die Suche: ${text}. Empfänger: ${recipient!.label}, Anlass: ${occasion}, Budget: ${budget}${ageGroup ? `, Alter: ${ageGroup}` : ""}. searchProducts sofort aufrufen.` });
    setRefineInput("");
    setRefineMode(false);
  }, [isLoading, budget, recipient, occasion, ageGroup, sendMessage]);

  const reset = () => {
    setStep("recipient"); setRecipient(null); setOccasion(null);
    setAgeGroup(null); setBudget(null); setInterests("");
    setRefineMode(false); setRefineInput(""); setMessages([]);
  };

  // Hide auto-sent system command messages (first prompt, loadMore, doRefine)
  const displayMessages = messages.filter((msg, idx) => {
    if (msg.role !== "user") return true;
    if (idx === 0) return false; // initial prompt
    const text = (msg.parts.find(p => p.type === "text") as any)?.text ?? "";
    if (text.startsWith("Zeige 6 andere Geschenkideen.")) return false;
    if (text.startsWith("Verfeinere die Suche:") && text.includes("searchProducts sofort aufrufen")) return false;
    return true;
  });

  // Check if any assistant message has products
  const hasAnyProducts = displayMessages.some(msg =>
    msg.role === "assistant" && msg.parts.some(p => p.type === "tool-searchProducts" && (p as any).state === "output-available" && Array.isArray((p as any).output) && (p as any).output.length > 0)
  );

  return (
    <>
      <style>{`
        @keyframes wangel-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes wangel-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes wangel-slide { from{opacity:0;transform:translateY(24px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        .wangel-scroll::-webkit-scrollbar{width:4px} .wangel-scroll::-webkit-scrollbar-thumb{background:#E0D4FF;border-radius:99px}
      `}</style>

      {pickerProduct && <WishlistPicker product={pickerProduct} onClose={() => setPickerProduct(null)} />}

      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)} aria-label="Wunschengel öffnen"
        style={{ position:"fixed", bottom:100, right:24, zIndex:9000, width:58, height:58, borderRadius:"50%", background:"linear-gradient(135deg,#2D1B69,#FF6B8A)", border:"3px solid #fff", cursor:"pointer", boxShadow:"0 4px 24px rgba(45,27,105,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, animation:open?"none":"wangel-bounce 2.2s ease-in-out infinite", transition:"transform 0.2s" }}
        onMouseOver={e => (e.currentTarget.style.transform="scale(1.1)")}
        onMouseOut={e => (e.currentTarget.style.transform="scale(1)")}>
        {open ? "✕" : "🪄"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{ position:"fixed", bottom:170, right:24, zIndex:9000, width:"min(420px, calc(100vw - 32px))", height:"min(580px, calc(100vh - 190px))", background:"#fff", borderRadius:24, boxShadow:"0 16px 64px rgba(45,27,105,0.22), 0 2px 8px rgba(0,0,0,0.08)", display:"flex", flexDirection:"column", overflow:"hidden", animation:"wangel-slide 0.25s ease", fontFamily:"Plus Jakarta Sans, sans-serif" }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#2D1B69 0%,#4A2C8C 100%)", padding:"14px 18px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🪄</div>
            <div style={{ flex:1 }}>
              <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>Wunschengel</div>
              <div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>Dein persönlicher Geschenkberater ✨</div>
            </div>
            {step !== "recipient" && (
              <button onClick={reset} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", fontSize:11, fontWeight:600, borderRadius:999, padding:"4px 10px", cursor:"pointer" }}>↺ Neu</button>
            )}
            <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:16, padding:4, marginLeft:2 }}>✕</button>
          </div>

          {/* Body */}
          <div className="wangel-scroll" style={{ flex:1, overflowY:"auto", padding:"14px 14px 8px" }}>

            {/* Step 1: Recipient */}
            {step === "recipient" && (
              <div>
                <div style={{ fontSize:13, color:"#2D1B69", fontWeight:600, marginBottom:12, lineHeight:1.5 }}>
                  Hallo! Ich bin dein Wunschengel ✨<br />
                  <span style={{ fontWeight:400, color:"#7B6B8D" }}>Für wen suchst du heute eine Idee?</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
                  {RECIPIENTS.map(r => (
                    <button key={r.id} onClick={() => pickRecipient(r)}
                      style={{ background:"#F8F5FF", border:"1.5px solid #E0D4FF", borderRadius:14, padding:"10px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all 0.15s" }}
                      onMouseOver={e => { e.currentTarget.style.background="#EDE9FE"; e.currentTarget.style.borderColor="#C4B5FD"; }}
                      onMouseOut={e => { e.currentTarget.style.background="#F8F5FF"; e.currentTarget.style.borderColor="#E0D4FF"; }}>
                      <span style={{ fontSize:26 }}>{r.avatar}</span>
                      <span style={{ fontSize:11, fontWeight:600, color:"#4C1D95" }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Occasion */}
            {step === "occasion" && recipient && (
              <div>
                <div style={{ fontSize:13, color:"#2D1B69", marginBottom:12 }}>
                  Welcher Anlass ist es für <strong>{recipient.avatar} {recipient.label}</strong>?
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {recipient.occasions.map(o => <Chip key={o} label={o} selected={occasion===o} onClick={() => pickOccasion(o)} />)}
                </div>
              </div>
            )}

            {/* Step 2b: Age (only for Kind) */}
            {step === "age" && (
              <div>
                <div style={{ fontSize:13, color:"#2D1B69", marginBottom:4 }}>
                  {recipient?.avatar} {recipient?.label} · {occasion}
                </div>
                <div style={{ fontSize:13, color:"#7B6B8D", marginBottom:12 }}>
                  Wie alt ist das Kind?
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {AGE_GROUPS.map(a => <Chip key={a} label={a} selected={ageGroup===a} onClick={() => pickAge(a)} />)}
                </div>
              </div>
            )}

            {/* Step 3: Interests + Budget */}
            {step === "budget" && (
              <div>
                <div style={{ fontSize:13, color:"#2D1B69", marginBottom:4 }}>
                  {recipient?.avatar} {recipient?.label}{ageGroup ? ` · ${ageGroup}` : ""} · {occasion}
                </div>
                <div style={{ fontSize:13, color:"#7B6B8D", marginBottom:10 }}>
                  Hast du bestimmte Interessen oder Hobbys im Kopf? <span style={{ color:"#A89BBD" }}>(optional)</span>
                </div>
                <input value={interests} onChange={e => setInterests(e.target.value)}
                  placeholder="z.B. Yoga, Kochen, Gaming…"
                  style={{ width:"100%", border:"1.5px solid #E0D4FF", borderRadius:10, padding:"8px 12px", fontSize:12, color:"#2D1B69", outline:"none", marginBottom:12, boxSizing:"border-box", fontFamily:"inherit" }}
                  onFocus={e => (e.currentTarget.style.borderColor="#FF6B8A")}
                  onBlur={e => (e.currentTarget.style.borderColor="#E0D4FF")} />
                <div style={{ fontSize:13, color:"#2D1B69", fontWeight:600, marginBottom:8 }}>Was ist dein Budget?</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {BUDGET_OPTIONS.map(b => <Chip key={b} label={b} selected={budget===b} onClick={() => pickBudget(b)} />)}
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {step === "done" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {/* Context pills */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[recipient?.avatar+" "+recipient?.label, ageGroup, occasion, budget, interests.trim()||null].filter(Boolean).map((tag, i) => (
                    <span key={i} style={{ background:"#F5F0FF", color:"#6D28D9", fontSize:11, fontWeight:600, borderRadius:999, padding:"3px 10px" }}>{tag}</span>
                  ))}
                </div>

                {/* Messages */}
                {displayMessages.map(msg => (
                  <div key={msg.id} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-start" }}>
                    {msg.role === "assistant" && (
                      <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#2D1B69,#FF6B8A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0, marginTop:2 }}>🪄</div>
                    )}
                    <div style={{ maxWidth:msg.role==="assistant"?"100%":"88%", background:msg.role==="user"?"linear-gradient(135deg,#FF6B8A,#FF8FA3)":"transparent", color:msg.role==="user"?"#fff":"#2D1B69", borderRadius:msg.role==="user"?"16px 16px 4px 16px":0, padding:msg.role==="user"?"9px 13px":0, fontSize:13, lineHeight:1.5 }}>
                      {(() => {
                        const hasProducts = msg.role === "assistant" && msg.parts.some(
                          p => p.type === "tool-searchProducts" && (p as any).state === "output-available" && Array.isArray((p as any).output) && (p as any).output.length > 0
                        );
                        const tm = { recipient: recipient?.label, occasion, budget };
                        return msg.parts.map((part, i) => <MessagePart key={i} part={part} hasProducts={hasProducts} onAddWish={handleAddWish} trackMeta={tm} />);
                      })()}
                    </div>
                  </div>
                ))}

                {/* Loading dots */}
                {isLoading && (
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#2D1B69,#FF6B8A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🪄</div>
                    <div style={{ background:"#F8F5FF", borderRadius:"16px 16px 16px 4px", padding:"9px 14px", display:"flex", gap:4, alignItems:"center" }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#C4B5FD", animation:`wangel-bounce 0.9s ease ${i*0.15}s infinite` }} />)}
                    </div>
                  </div>
                )}

                {/* Quick action buttons — show once we have results */}
                {hasAnyProducts && !isLoading && !refineMode && (
                  <QuickActions onMore={loadMore} onRefine={() => setRefineMode(true)} disabled={isLoading} />
                )}

                {/* Refine input */}
                {refineMode && (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, background:"#FFF8FC", border:"1.5px solid #FFD6E0", borderRadius:14, padding:"10px 12px" }}>
                    <div style={{ fontSize:12, color:"#FF6B8A", fontWeight:700 }}>✨ Ideen verfeinern</div>
                    <div style={{ display:"flex", gap:6 }}>
                      <input autoFocus value={refineInput} onChange={e => setRefineInput(e.target.value)}
                        onKeyDown={e => { if (e.key==="Enter") doRefine(refineInput); if (e.key==="Escape") { setRefineMode(false); setRefineInput(""); } }}
                        placeholder="z.B. eher sportlich, unter 40€, für draußen…"
                        style={{ flex:1, border:"1.5px solid #FFB3C3", borderRadius:9, padding:"7px 10px", fontSize:12, color:"#2D1B69", outline:"none", fontFamily:"inherit" }}
                        onFocus={e => (e.currentTarget.style.borderColor="#FF6B8A")}
                        onBlur={e => (e.currentTarget.style.borderColor="#FFB3C3")} />
                      <button onClick={() => doRefine(refineInput)} disabled={!refineInput.trim()}
                        style={{ width:32, height:32, borderRadius:"50%", background:!refineInput.trim()?"#FFD6E0":"linear-gradient(135deg,#FF6B8A,#FF8FA3)", border:"none", cursor:!refineInput.trim()?"default":"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✨</button>
                      <button onClick={() => { setRefineMode(false); setRefineInput(""); }}
                        style={{ width:32, height:32, borderRadius:"50%", background:"#F5F0FF", border:"none", cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#6D28D9" }}>✕</button>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Bottom input — free follow-up in done step, hidden when refine panel is open */}
          {step === "done" && !refineMode && (
            <div style={{ padding:"10px 14px", borderTop:"1px solid #F0E8FF", display:"flex", gap:8, alignItems:"flex-end", flexShrink:0 }}>
              <input value={refineInput} onChange={e => setRefineInput(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter") { e.preventDefault(); if (refineInput.trim()) { sendMessage({ text: refineInput }); setRefineInput(""); } } }}
                placeholder="Frage stellen oder verfeinern…"
                disabled={isLoading}
                style={{ flex:1, border:"1.5px solid #E0D4FF", borderRadius:10, padding:"8px 12px", fontSize:13, outline:"none", color:"#2D1B69", background:isLoading?"#F8F5FF":"#fff", fontFamily:"inherit" }}
                onFocus={e => (e.currentTarget.style.borderColor="#FF6B8A")}
                onBlur={e => (e.currentTarget.style.borderColor="#E0D4FF")} />
              <button onClick={() => { if (refineInput.trim() && !isLoading) { sendMessage({ text: refineInput }); setRefineInput(""); } }}
                disabled={isLoading || !refineInput.trim()}
                style={{ width:36, height:36, borderRadius:"50%", background:isLoading||!refineInput.trim()?"#E0D4FF":"linear-gradient(135deg,#FF6B8A,#FF8FA3)", border:"none", cursor:isLoading||!refineInput.trim()?"default":"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✨</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
