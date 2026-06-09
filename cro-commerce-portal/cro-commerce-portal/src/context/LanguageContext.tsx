"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { translate, type Lang } from "@/lib/i18n/portal";

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

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("hr");
  const t = (key: Parameters<typeof translate>[1]) => translate(lang, key);
  const toggleLang = () => setLang((l) => (l === "hr" ? "en" : "hr"));

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
