"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type Lang, translate, type TRANSLATIONS } from "@/lib/i18n/portal";

const LS_KEY = "portal_lang";

type TKey = keyof typeof TRANSLATIONS["hr"];

interface LangCtx {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TKey) => string;
}

const LanguageContext = createContext<LangCtx>({
  lang: "hr",
  toggleLang: () => {},
  t: (key) => key as string,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("hr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY) as Lang | null;
      if (saved === "en" || saved === "hr") setLang(saved);
    } catch {}
  }, []);

  function toggleLang() {
    const next: Lang = lang === "hr" ? "en" : "hr";
    setLang(next);
    try { localStorage.setItem(LS_KEY, next); } catch {}
  }

  const t = useCallback(
    (key: TKey) => translate(lang, key),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LangCtx {
  return useContext(LanguageContext);
}
