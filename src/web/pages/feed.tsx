import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { UpdatePost } from "@/components/UpdatePost";

export default function Feed() {
  const { theme } = useTheme();
  const [, navigate] = useLocation();
  const isPine  = theme === "pine";
  const bg = isPine  ? "#F1FDF4" : "#FFF8F0";
  const foreground = isPine  ? "#1A3A2A" : "#1A1A4E";
  const muted = isPine  ? "#10B981" : "#6B6B9A";
  const accent = isPine  ? "#10B981" : "var(--accent)";

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFeed().then(setPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: bg }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: foreground }}>
            Community Feed <span style={{ color: accent }}>✦</span>
          </h1>
          <p className="font-body" style={{ color: muted }}>Was andere gerade feiern 🎉</p>
        </div>

        {loading ? (
          <div className="text-center py-20 font-body" style={{ color: muted }}>Lade...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎁</div>
            <p className="font-body" style={{ color: muted }}>Noch keine öffentlichen Updates. Sei der Erste!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id}>
                {/* List badge */}
                <button
                  onClick={() => navigate(`/shared/${post.list?.shareToken}`)}
                  className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                >
                  <span className="text-lg">{post.list?.emoji}</span>
                  <span className="font-body text-sm font-semibold" style={{ color: accent }}>{post.list?.title}</span>
                </button>
                <UpdatePost update={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
