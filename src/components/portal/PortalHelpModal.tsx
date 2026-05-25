"use client";

import { useState } from "react";
import { X, Gift, Clock, FileText, Users, MessageCircle } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export interface HelpStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Props {
  /** Opcionalni override koraka — za buduću integraciju iz Supabase tablice */
  steps?: HelpStep[];
}

export default function PortalHelpModal({ steps: customSteps }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLang();

  const defaultSteps: HelpStep[] = [
    {
      title: t("help.step1.title"),
      description: t("help.step1.desc"),
      icon: <Gift size={28} className="text-brand-600" />,
    },
    {
      title: t("help.step2.title"),
      description: t("help.step2.desc"),
      icon: <Clock size={28} className="text-orange-500" />,
    },
    {
      title: t("help.step3.title"),
      description: t("help.step3.desc"),
      icon: <FileText size={28} className="text-blue-500" />,
    },
    {
      title: t("help.step4.title"),
      description: t("help.step4.desc"),
      icon: <Users size={28} className="text-emerald-500" />,
    },
    {
      title: t("help.step5.title"),
      description: t("help.step5.desc"),
      icon: <MessageCircle size={28} className="text-purple-500" />,
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
      {/* Trigger gumb — u sidewebaru */}
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
            <div className="px-6 pb-2 flex-1 min-h-[180px] flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>

            {/* Footer — navigacija */}
            <div className="px-6 py-5 flex items-center justify-between border-t border-gray-100 mt-4">
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
