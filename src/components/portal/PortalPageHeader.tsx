"use client";

import { useLang } from "@/context/LanguageContext";
import type { TRANSLATIONS } from "@/lib/i18n/portal";

type TKey = keyof typeof TRANSLATIONS["hr"];

interface Props {
  titleKey: TKey;
  subtitleKey: TKey;
}

export default function PortalPageHeader({ titleKey, subtitleKey }: Props) {
  const { t } = useLang();
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{t(titleKey)}</h1>
        <p className="page-subtitle">{t(subtitleKey)}</p>
      </div>
    </div>
  );
}
