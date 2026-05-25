"use client";

import { useState } from "react";
import { X, Gift, Clock, FileText, Users, MessageCircle, Building2, CalendarDays, Youtube } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export interface HelpStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  preview?: React.ReactNode;
}

interface Props {
  /** Opcionalni override koraka — za buduću integraciju iz Supabase tablice */
  steps?: HelpStep[];
}

export default function PortalHelpModal({ steps: customSteps }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLang();

  // Mini preview — nav item stiliziran kao sidebar
  const NavPreview = ({ icon: Icon, label, active }: { icon: React.ElementType; label: string; active?: boolean }) => (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-fit mx-auto transition-colors ${
      active ? "bg-brand-50 text-brand-700" : "text-gray-400 bg-gray-50"
    }`}>
      <Icon size={14} className={active ? "text-brand-600" : "text-gray-300"} />
      {label}
    </div>
  );

  const defaultSteps: HelpStep[] = [
    {
      title: t("help.step1.title"),
      description: t("help.step1.desc"),
      icon: <Gift size={28} className="text-brand-600" />,
      preview: (
        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100 w-full">
          <NavPreview icon={Building2} label="Partner" />
          <NavPreview icon={Gift} label={t("nav.benefits")} active />
          <NavPreview icon={CalendarDays} label="Program" />
          <NavPreview icon={Youtube} label="CRO Commerce 2025" />
        </div>
      ),
    },
    {
      title: t("help.step2.title"),
      description: t("help.step2.desc"),
      icon: <Clock size={28} className="text-orange-500" />,
      preview: (
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{t("status.not_started")}</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{t("status.in_progress")}</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{t("status.completed")}</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">{t("status.overdue")}</span>
        </div>
      ),
    },
    {
      title: t("help.step3.title"),
      description: t("help.step3.desc"),
      icon: <FileText size={28} className="text-blue-500" />,
      preview: (
        <div className="w-full border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
          <div className="flex border-b border-gray-100 bg-white">
            <div className="px-4 py-2 text-xs text-gray-400">{t("tabs.info")}</div>
            <div className="px-4 py-2 text-xs font-semibold text-brand-600 border-b-2 border-brand-600 -mb-px">{t("tabs.documents")}</div>
            <div className="px-4 py-2 text-xs text-gray-400">{t("tabs.myPackage")}</div>
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5">
            {["ugovor.pdf", "materijali.zip"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                <FileText size={12} className="text-gray-300 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: t("help.step4.title"),
      description: t("help.step4.desc"),
      icon: <Users size={28} className="text-emerald-500" />,
      preview: (
        <div className="w-full border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
          <div className="flex border-b border-gray-100 bg-white">
            <div className="px-4 py-2 text-xs font-semibold text-brand-600 border-b-2 border-brand-600 -mb-px">{t("tabs.info")}</div>
            <div className="px-4 py-2 text-xs text-gray-400">{t("tabs.documents")}</div>
            <div className="px-4 py-2 text-xs text-gray-400">{t("tabs.myPackage")}</div>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-500">{t("contacts.contacts")}</p>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                <Users size={10} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Ana Horvat</p>
                <p className="text-[10px] text-gray-400">Marketing manager</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("help.step5.title"),
      description: t("help.step5.desc"),
      icon: <MessageCircle size={28} className="text-purple-500" />,
      preview: (
        <a
          href="mailto:konferencija@ecommerce.hr"
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors mx-auto w-fit"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={14} />
          konferencija@ecommerce.hr
        </a>
      ),
    },
  ];

  const steps = customSteps ?? defaultSteps;
  const total = steps.length;
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === total - 1;

  function open() {
    setCurrentStep(0);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function next() {
    if (!isLast) setCurrentStep((s) => s + 1);
    else close();
  }

  function prev() {
    if (!isFirst) setCurrentStep((s) => s - 1);
  }

  return (
    <>
      {/* Trigger gumb */}
      <button
        onClick={open}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors w-full"
      >
        <span className="flex items-center justify-center w-[14px] h-[14px] rounded-full border border-current text-[10px] font-bold leading-none flex-shrink-0">
          ?
        </span>
        {t("help.btn")}
      </button>

      {/* Overlay + modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-slide-up">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                {t("help.title")}
              </p>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dot indikatori */}
            <div className="flex items-center justify-center gap-1.5 pb-4">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`rounded-full transition-all ${
                    i === currentStep
                      ? "w-5 h-2 bg-brand-600"
                      : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Sadržaj koraka */}
            <div className="px-6 pb-2 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1.5">{step.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
              {/* Preview elementa */}
              {step.preview && (
                <div className="w-full mt-1">
                  {step.preview}
                </div>
              )}
            </div>

            {/* Footer — navigacija */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 mt-4">
              <span className="text-xs text-gray-400">
                {currentStep + 1} / {total}
              </span>
              <div className="flex gap-2">
                {!isFirst && (
                  <button
                    onClick={prev}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t("help.prev")}
                  </button>
                )}
                <button
                  onClick={next}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                >
                  {isLast ? t("help.close") : t("help.next")}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
