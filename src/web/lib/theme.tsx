import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authClient } from "./auth";

export type Theme = "rose" | "teal";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "rose",
  setTheme: async () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("wh_theme") as Theme) || "rose";
  });

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Load theme from server when logged in
  useEffect(() => {
    if (!session) return;
    fetch("/api/profile", { credentials: "include" })
      .then(r => r.json())
      .then((p: any) => {
        if (p.theme && p.theme !== theme) {
          setThemeState(p.theme as Theme);
          localStorage.setItem("wh_theme", p.theme);
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  const setTheme = async (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("wh_theme", t);
    document.documentElement.setAttribute("data-theme", t);
    if (session) {
      await fetch("/api/profile/theme", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: t }),
      }).catch(() => {});
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
