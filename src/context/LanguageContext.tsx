"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translate, type Lang } from "@/lib/i18n/portal";

const LANG_STORAGE_KEY = "cro_lang";

interface LangContextValue {
  lang: Lang;
  t: (key: Parameters<typeof translate>[1]) => string;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "hr",
  t: (key) => key as string,
  toggleLang: () => {},
});

function persistLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.cookie = `${LANG_STORAGE_KEY}=${lang}; path=/; max-age=31536000`;
  } catch {}
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("hr");

  // Učitaj spremljeni jezik tek nakon mounta (izbjegava hydration mismatch)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === "hr" || stored === "en") setLang(stored);
    } catch {}
  }, []);

  const t = (key: Parameters<typeof translate>[1]) => translate(lang, key);
  const toggleLang = () => {
    const next: Lang = lang === "hr" ? "en" : "hr";
    persistLang(next);
    setLang(next);
  };

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export { LangProvider as LanguageProvider };
