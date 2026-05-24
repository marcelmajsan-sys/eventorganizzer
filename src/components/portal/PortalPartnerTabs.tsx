"use client";

import { useState } from "react";
import { Building2, File, FileText, FolderOpen } from "lucide-react";
import { packageColor, paymentStatusLabel, paymentStatusColor, formatDate, formatFileSize } from "@/lib/utils";
import type { PackageType, PaymentStatus } from "@/types";
import PortalContactsSection from "@/components/portal/PortalContactsSection";
import PortalCollaborationOptions from "@/components/portal/PortalCollaborationOptions";
import { useLang } from "@/context/LanguageContext";
import { translatePackage } from "@/lib/i18n/portal";
// import PortalContractView from "@/components/portal/PortalContractView"; // UGOVOR — zakomentirano, vidi dolje

interface Contact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  type: "contact" | "ticket";
  ticket_type: "vip" | "standard" | null;
}

interface FileRecord {
  id: string;
  filename: string;
  storage_url: string;
  file_size: number | null;
  uploaded_at: string;
}

interface Sponsor {
  name: string;
  package_type: string;
  payment_status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  iznos?: number | null;
}

interface Props {
  sponsorId: string;
  sponsor: Sponsor;
  contacts: Contact[];
  files: FileRecord[];
  userEmail: string;
  contractAcceptedAt: string | null;
  contractAcceptedBy: string | null;
  contractBenefits: string[];
}

const MAIN_PACKAGES = ["Glavni", "Zlatni", "Srebrni", "Brončani"];

// ---------------------------------------------------------------------------
// UGOVOR TAB — privremeno sakriven (može se lako vratiti)
// Da vratiš tab "Ugovor o suradnji":
//   1. Odkomentiraj import PortalContractView gore
//   2. Dodaj natrag u TABS: { id: "ugovor", label: "Ugovor o suradnji" }
//   3. Odkomentiraj render blok "Tab: Ugovor o suradnji" dolje (~zadnji blok)
// ---------------------------------------------------------------------------

const TAB_IDS = ["info", "dokumenti", "opcije"] as const;
// const TAB_IDS = ["info", "dokumenti", "ugovor", "opcije"] as const; // s ugovorom
type Tab = typeof TAB_IDS[number];

export default function PortalPartnerTabs({
  sponsorId, sponsor, contacts, files,
  userEmail, contractAcceptedAt, contractAcceptedBy, contractBenefits,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const { t, lang } = useLang();

  const isMainPackage = MAIN_PACKAGES.includes(sponsor.package_type);

  const TABS = [
    { id: "info"      as const, label: t("tabs.info") },
    { id: "dokumenti" as const, label: t("tabs.documents") },
    // { id: "ugovor" as const, label: "Ugovor o suradnji" }, // UGOVOR — sakriven
    { id: "opcije"    as const, label: isMainPackage ? t("tabs.myPackage") : t("tabs.options") },
  ];

  return (
    <div>
      {/* Info kartica */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 size={22} className="text-brand-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{sponsor.name}</h2>
            <div className="flex items-center gap-6 mt-3 flex-wrap">

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {t("info.category")}
                </p>
                <span className={`badge text-sm ${packageColor(sponsor.package_type as PackageType)}`}>
                  {translatePackage(lang, sponsor.package_type)}
                </span>
              </div>

              {sponsor.payment_status && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {t("info.payment")}
                  </p>
                  <span className={`badge text-sm ${paymentStatusColor(sponsor.payment_status as PaymentStatus)}`}>
                    {paymentStatusLabel(sponsor.payment_status as PaymentStatus)}
                  </span>
                </div>
              )}

              {/* UGOVOR pločica — sakrijena dok je tab sakriven */}
              {/*
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ugovor</p>
                <button
                  onClick={() => setActiveTab("ugovor")}
                  className={`badge text-sm cursor-pointer hover:opacity-75 transition-opacity ${
                    contractAcceptedAt
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {contractAcceptedAt ? "Prihvaćen" : "Čeka prihvaćanje"}
                </button>
              </div>
              */}

            </div>
          </div>
        </div>
      </div>

      {/* Tabovi */}
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.id === "dokumenti" && files.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">
                {files.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Informacije */}
      {activeTab === "info" && (
        <PortalContactsSection
          sponsorId={sponsorId}
          primaryContact={{
            name: sponsor.contact_name,
            email: sponsor.contact_email,
            phone: sponsor.contact_phone,
          }}
          contacts={contacts}
        />
      )}

      {/* Tab: Dokumenti */}
      {activeTab === "dokumenti" && (
        <div>
          {files.length === 0 ? (
            <div className="card p-16 text-center">
              <FolderOpen size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t("docs.empty")}</p>
            </div>
          ) : (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <FileText size={15} className="text-gray-400" />
                {t("docs.title")} ({files.length})
              </h3>
              <div className="space-y-2">
                {files.map((file) => (
                  <a
                    key={file.id}
                    href={file.storage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <File size={14} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 group-hover:text-brand-600 truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-400">
                        {file.file_size ? formatFileSize(file.file_size) : ""}
                        {file.file_size ? " · " : ""}
                        {formatDate(file.uploaded_at)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Ugovor o suradnji — SAKRIVEN
          Da vratiš: odkomentiraj TAB_IDS unos + import gore, i ovaj blok.
      {activeTab === "ugovor" && (
        <PortalContractView
          sponsorId={sponsorId}
          sponsorName={sponsor.name}
          packageType={sponsor.package_type}
          iznos={sponsor.iznos ?? null}
          contactName={sponsor.contact_name}
          acceptedAt={contractAcceptedAt}
          acceptedBy={contractAcceptedBy}
          userEmail={userEmail}
          dynamicBenefits={contractBenefits}
        />
      )}
      */}

      {/* Tab: Vaš paket / Opcije suradnje */}
      {activeTab === "opcije" && (
        <PortalCollaborationOptions
          currentPackage={isMainPackage ? sponsor.package_type : undefined}
        />
      )}
    </div>
  );
}
