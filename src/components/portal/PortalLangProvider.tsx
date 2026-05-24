"use client";

import { LanguageProvider } from "@/context/LanguageContext";

export default function PortalLangProvider({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
