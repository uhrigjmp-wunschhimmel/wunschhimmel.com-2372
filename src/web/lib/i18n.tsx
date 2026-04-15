import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "de" | "en";

const translations = {
  de: {
    // Nav
    nav_explore: "Entdecken",
    nav_dashboard: "Meine Listen",
    nav_signin: "Anmelden",
    nav_signup: "Registrieren",
    nav_signout: "Abmelden",
    // Landing
    hero_title: "Deine Wünsche,\nihre Freude.",
    hero_sub: "Erstelle Wunschlisten, teile sie mit deinen Liebsten und mach das Schenken einfacher — für Geburtstage, Weihnachten und jeden Anlass.",
    hero_cta: "Kostenlos starten",
    hero_explore: "Listen entdecken",
    features_title: "So einfach geht's",
    feat1_title: "Link einfügen",
    feat1_desc: "Produkt-URL einfügen — Bild, Titel und Preis werden automatisch geladen.",
    feat2_title: "Liste teilen",
    feat2_desc: "Per E-Mail teilen oder öffentlich machen — du entscheidest.",
    feat3_title: "Reservieren",
    feat3_desc: "Deine Liebsten können Wünsche reservieren, damit nichts doppelt gekauft wird.",
    // Auth
    signin_title: "Willkommen zurück",
    signin_sub: "Melde dich an um deine Wunschlisten zu verwalten",
    signup_title: "Konto erstellen",
    signup_sub: "Kostenlos — in 30 Sekunden",
    email_label: "E-Mail",
    password_label: "Passwort",
    name_label: "Name",
    signin_btn: "Anmelden",
    signup_btn: "Registrieren",
    no_account: "Noch kein Konto?",
    has_account: "Schon ein Konto?",
    // Dashboard
    dashboard_title: "Meine Wunschlisten",
    new_list: "Neue Liste",
    no_lists: "Noch keine Listen. Erstelle deine erste!",
    public_badge: "Öffentlich",
    private_badge: "Privat",
    // List detail
    add_wish: "Wunsch hinzufügen",
    add_wish_url: "Produkt-URL (optional — für automatische Vorschau)",
    wish_title: "Titel",
    wish_desc: "Beschreibung (optional)",
    wish_price: "Preis (optional)",
    wish_priority: "Priorität",
    priority_low: "Niedrig",
    priority_medium: "Mittel",
    priority_high: "Hoch",
    load_preview: "Vorschau laden",
    loading: "Lade...",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    share_list: "Liste teilen",
    share_emails: "E-Mail-Adressen (kommagetrennt)",
    share_message: "Persönliche Nachricht (optional)",
    share_send: "Einladung senden",
    reserved: "Reserviert",
    reserve_btn: "Reservieren",
    reserve_name: "Dein Name",
    buy_btn: "Kaufen →",
    // Explore
    explore_title: "Öffentliche Wunschlisten",
    explore_sub: "Lass dich inspirieren",
    no_public: "Noch keine öffentlichen Listen.",
    // Settings
    make_public: "Öffentlich",
    make_private: "Privat",
    edit_list: "Bearbeiten",
    delete_list: "Liste löschen",
    delete_confirm: "Liste wirklich löschen?",
    wishes_count: "Wünsche",
  },
  en: {
    nav_explore: "Explore",
    nav_dashboard: "My Lists",
    nav_signin: "Sign in",
    nav_signup: "Sign up",
    nav_signout: "Sign out",
    hero_title: "Your wishes,\ntheir joy.",
    hero_sub: "Create wishlists, share them with your loved ones, and make gifting easy — for birthdays, Christmas, and every occasion.",
    hero_cta: "Start for free",
    hero_explore: "Explore lists",
    features_title: "How it works",
    feat1_title: "Add a link",
    feat1_desc: "Paste any product URL — image, title and price load automatically.",
    feat2_title: "Share your list",
    feat2_desc: "Share via email or make it public — you decide.",
    feat3_title: "Reserve wishes",
    feat3_desc: "Your loved ones can reserve wishes so nothing gets bought twice.",
    signin_title: "Welcome back",
    signin_sub: "Sign in to manage your wishlists",
    signup_title: "Create account",
    signup_sub: "Free — takes 30 seconds",
    email_label: "Email",
    password_label: "Password",
    name_label: "Name",
    signin_btn: "Sign in",
    signup_btn: "Sign up",
    no_account: "No account yet?",
    has_account: "Already have an account?",
    dashboard_title: "My Wishlists",
    new_list: "New list",
    no_lists: "No lists yet. Create your first one!",
    public_badge: "Public",
    private_badge: "Private",
    add_wish: "Add wish",
    add_wish_url: "Product URL (optional — for auto preview)",
    wish_title: "Title",
    wish_desc: "Description (optional)",
    wish_price: "Price (optional)",
    wish_priority: "Priority",
    priority_low: "Low",
    priority_medium: "Medium",
    priority_high: "High",
    load_preview: "Load preview",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    share_list: "Share list",
    share_emails: "Email addresses (comma separated)",
    share_message: "Personal message (optional)",
    share_send: "Send invitation",
    reserved: "Reserved",
    reserve_btn: "Reserve",
    reserve_name: "Your name",
    buy_btn: "Buy →",
    explore_title: "Public Wishlists",
    explore_sub: "Get inspired",
    no_public: "No public lists yet.",
    make_public: "Make public",
    make_private: "Make private",
    edit_list: "Edit",
    delete_list: "Delete list",
    delete_confirm: "Really delete this list?",
    wishes_count: "wishes",
  },
};

type TranslationKey = keyof typeof translations.de;

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "de",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("wh_lang");
    return (saved as Lang) || (navigator.language.startsWith("de") ? "de" : "en");
  });

  const t = (key: TranslationKey) => translations[lang][key] || key;

  const setLangAndSave = (l: Lang) => {
    setLang(l);
    localStorage.setItem("wh_lang", l);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: setLangAndSave, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
