"use client";

import { ExternalLink, Sparkles } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const GENERATOR_URL = "https://partners.ecommerce.hr/generator";

export default function PortalGeneratorPage() {
  const { t } = useLang();

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("generator.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("generator.subtitle")}</p>
        </div>
      </div>

      <div className="card p-6 max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-brand-600" />
          </div>
          <div>
            <p className="text-gray-700 leading-relaxed">{t("generator.text")}</p>
            <a
              href={GENERATOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {t("generator.open")}
              <ExternalLink size={15} />
            </a>
            <p className="text-xs text-gray-400 mt-3 break-all">{GENERATOR_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
