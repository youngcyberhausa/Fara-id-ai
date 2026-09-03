import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { LANGUAGES, TRANSLATIONS } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("faraid_lang") || "en");

  useEffect(() => {
    localStorage.setItem("faraid_lang", lang);
    const meta = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.dir = meta?.dir || "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(
    () => ({ ...TRANSLATIONS.en, ...(TRANSLATIONS[lang] || {}) }),
    [lang]
  );
  const dir = useMemo(() => LANGUAGES.find((l) => l.code === lang)?.dir || "ltr", [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
