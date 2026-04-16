import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Stats {
  totals: {
    users: number;
    wishlists: number;
    wishes: number;
    links: number;
    shares: number;
    publicLists: number;
    updates: number;
    likes: number;
    comments: number;
    activeUsers: number;
  };
  registrationsByDay: { date: string; count: number }[];
  topDomains: { domain: string; count: number }[];
  users: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    listCount: number;
    wishCount: number;
    shareCount: number;
    isActive: boolean;
  }[];
}

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  useEffect(() => {
    async function load() {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        navigate("/sign-in");
        return;
      }
      try {
        const r = await fetch("/api/admin/stats", { credentials: "include" });
        if (r.status === 401) {
          navigate("/sign-in");
          return;
        }
        if (r.status === 403) {
          setError("Kein Admin-Zugang für dieses Konto.");
          setLoading(false);
          return;
        }
        if (!r.ok) throw new Error("Failed to load stats");
        const json = await r.json();
        setStats(json);
      } catch {
        setError("Fehler beim Laden der Daten. Bitte Seite neu laden.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCard = (label: string, value: number | string, sub?: string) => (
    <div style={{
      background: "var(--color-card)",
      border: "1px solid var(--color-border)",
      borderRadius: 16,
      padding: "20px 24px",
      minWidth: 140,
      flex: "1 1 140px",
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-accent)", fontFamily: "Playfair Display, serif" }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-muted-foreground)", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 2 }}>{sub}</div>}
    </div>
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  };

  if (loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--color-muted-foreground)", fontSize: 16 }}>Wird geladen…</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
      <div style={{ fontSize: 32 }}>🔒</div>
      <div style={{ color: "var(--color-destructive)", fontWeight: 600, fontSize: 16 }}>{error}</div>
      <button
        onClick={() => { setError(""); setLoading(true); window.location.reload(); }}
        style={{ padding: "10px 24px", borderRadius: 12, background: "var(--color-accent)", color: "var(--color-accent-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}
      >
        Erneut versuchen
      </button>
    </div>
  );

  if (!stats) return null;

  const { totals, registrationsByDay, topDomains, users } = stats;

  // Abbreviate chart dates for readability
  const chartData = registrationsByDay.map(d => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }));

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-background)",
      color: "var(--color-foreground)",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        background: "var(--color-card)",
        borderBottom: "1px solid var(--color-border)",
        padding: "32px 40px 24px",
        marginBottom: 32,
      }}>
        <h1 style={{
          fontFamily: "Playfair Display, serif",
          fontSize: 32,
          margin: 0,
          color: "var(--color-foreground)",
        }}>
          Admin Dashboard
        </h1>
        <p style={{ color: "var(--color-muted-foreground)", margin: "6px 0 0", fontSize: 14 }}>
          Wunschhimmel · Übersicht
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
          {statCard("Nutzer gesamt", totals.users)}
          {statCard("Aktive Nutzer", totals.activeUsers, "letzte 30 Tage")}
          {statCard("Wunschlisten", totals.wishlists)}
          {statCard("Wünsche", totals.wishes)}
          {statCard("Mit Produktlink", totals.links)}
          {statCard("Öffentliche Listen", totals.publicLists)}
          {statCard("E-Mail-Shares", totals.shares)}
          {statCard("Updates", totals.updates)}
          {statCard("Likes", totals.likes)}
          {statCard("Kommentare", totals.comments)}
        </div>

        {/* Charts row */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 40 }}>

          {/* Registrations chart */}
          <div style={{
            flex: "2 1 400px",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            padding: 24,
          }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "var(--color-foreground)" }}>
              Registrierungen (letzte 30 Tage)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(l) => `Datum: ${l}`}
                  formatter={(v: number) => [v, "Registrierungen"]}
                />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top domains */}
          <div style={{
            flex: "1 1 280px",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            padding: 24,
          }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "var(--color-foreground)" }}>
              Top Shops / Domains
            </h2>
            {topDomains.length === 0 ? (
              <p style={{ color: "var(--color-muted-foreground)", fontSize: 14 }}>Noch keine Produktlinks.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topDomains.map(({ domain, count }, i) => (
                  <div key={domain} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "var(--color-accent)", opacity: 0.15 + (i / topDomains.length) * 0.85,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "var(--color-accent-foreground)",
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-foreground)" }}>{domain}</div>
                      <div style={{ height: 4, background: "var(--color-muted)", borderRadius: 2, marginTop: 2 }}>
                        <div style={{
                          height: "100%",
                          width: `${(count / topDomains[0].count) * 100}%`,
                          background: "var(--color-accent)",
                          borderRadius: 2,
                        }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--color-muted-foreground)", minWidth: 24, textAlign: "right" }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User table */}
        <div style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--color-border)" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Nutzer</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted-foreground)" }}>
              {totals.users} registriert · {totals.activeUsers} aktiv (30d)
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-muted)", textAlign: "left" }}>
                  {["Name", "E-Mail", "Registriert", "Listen", "Wünsche", "Shares", "Aktiv"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px",
                      fontWeight: 600,
                      color: "var(--color-muted-foreground)",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      background: i % 2 === 0 ? "transparent" : "var(--color-muted)",
                    }}
                  >
                    <td style={{ padding: "10px 16px", fontWeight: 500, color: "var(--color-foreground)" }}>
                      {u.name || "–"}
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--color-muted-foreground)" }}>{u.email}</td>
                    <td style={{ padding: "10px 16px", color: "var(--color-muted-foreground)", whiteSpace: "nowrap" }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>{u.listCount}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>{u.wishCount}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>{u.shareCount}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        width: 8, height: 8, borderRadius: "50%",
                        background: u.isActive ? "#22c55e" : "var(--color-muted-foreground)",
                        opacity: u.isActive ? 1 : 0.4,
                      }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
