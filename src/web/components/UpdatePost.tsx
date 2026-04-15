import { useState } from "react";
import { api } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

interface UpdatePostProps {
  update: any;
  shareToken?: string;
  isOwner?: boolean;
  onDelete?: (id: string) => void;
  onUpdated?: () => void;
}

export function UpdatePost({ update, shareToken, isOwner, onDelete, onUpdated }: UpdatePostProps) {
  const { theme } = useTheme();
  const isTeal = theme === "teal";
  const cardBg = isTeal ? "#162230" : "#FFFFFF";
  const border = isTeal ? "#1E3A4A" : "#EAD9D9";
  const foreground = isTeal ? "#E8F5F3" : "#1A1A4E";
  const muted = isTeal ? "#7FBFB5" : "#6B6B9A";
  const accent = isTeal ? "#2DD4BF" : "#FF6B8A";
  const inputBg = isTeal ? "#1A2D3E" : "#FFF8F0";

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");
  const [comments, setComments] = useState<any[]>(update.comments || []);
  const [likeCount, setLikeCount] = useState(update.likeCount || 0);
  const [liked, setLiked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    const name = localStorage.getItem("wh_visitor_name") || "Anonym";
    try {
      const res = await api.likeUpdate(update.id, name);
      setLikeCount(res.likeCount);
      setLiked(true);
    } catch { }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const name = commentName.trim() || localStorage.getItem("wh_visitor_name") || "Anonym";
      if (commentName.trim()) localStorage.setItem("wh_visitor_name", commentName.trim());
      const c = await api.addComment(update.id, name, commentText);
      setComments(prev => [c, ...prev]);
      setCommentText("");
      toast.success("Kommentar gesendet!");
    } catch {
      toast.error("Fehler beim Senden");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {update.avatarUrl ? (
          <img src={update.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-display font-bold" style={{ background: accent, color: isTeal ? "#0F1923" : "#fff" }}>
            {(update.ownerName || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <p className="font-body font-semibold text-sm" style={{ color: foreground }}>{update.ownerName || "Unbekannt"}</p>
          <p className="font-body text-xs" style={{ color: muted }}>{new Date(update.createdAt).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        {isOwner && onDelete && (
          <button onClick={() => onDelete(update.id)} className="text-xs hover:opacity-70 transition-opacity" style={{ color: muted }}>✕</button>
        )}
      </div>

      {/* Photo */}
      {update.photoUrl && (
        <div className="w-full max-h-80 overflow-hidden">
          <img src={update.photoUrl} alt="" className="w-full object-cover" />
        </div>
      )}

      {/* Text */}
      <div className="px-4 py-3">
        <p className="font-body text-sm leading-relaxed" style={{ color: foreground }}>{update.text}</p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-body font-medium transition-all ${liked ? "scale-110" : "hover:scale-105"}`}
          style={{ color: liked ? accent : muted }}
        >
          <span>{liked ? "❤️" : "🤍"}</span> {likeCount}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-body font-medium transition-colors hover:opacity-80"
          style={{ color: muted }}
        >
          <span>💬</span> {comments.length}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: border }}>
          {/* Add comment */}
          <div className="pt-3 space-y-2">
            <input
              value={commentName}
              onChange={e => setCommentName(e.target.value)}
              placeholder="Dein Name"
              className="w-full text-sm rounded-xl px-3 py-2 font-body outline-none focus:border-opacity-100 border transition-all"
              style={{ background: inputBg, border: `1px solid ${border}`, color: foreground }}
            />
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleComment()}
                placeholder="Kommentar schreiben..."
                className="flex-1 text-sm rounded-xl px-3 py-2 font-body outline-none border transition-all"
                style={{ background: inputBg, border: `1px solid ${border}`, color: foreground }}
              />
              <button
                onClick={handleComment}
                disabled={submitting || !commentText.trim()}
                className="text-sm font-body font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                style={{ background: accent, color: isTeal ? "#0F1923" : "#fff" }}
              >
                →
              </button>
            </div>
          </div>

          {/* Comments list */}
          {comments.length > 0 && (
            <div className="mt-3 space-y-2">
              {comments.map((c: any) => (
                <div key={c.id} className="text-sm">
                  <span className="font-body font-semibold" style={{ color: foreground }}>{c.authorName} </span>
                  <span className="font-body" style={{ color: muted }}>{c.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
