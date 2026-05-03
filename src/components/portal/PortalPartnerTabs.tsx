"use client";

import { useState } from "react";
import { Building2, Mail, Phone, User, Users, Ticket, File, FileText, FolderOpen } from "lucide-react";
import { packageColor, paymentStatusLabel, paymentStatusColor, formatDate, formatFileSize } from "@/lib/utils";
import type { PackageType, PaymentStatus } from "@/types";

interface Contact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  type: string;
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
}

interface Props {
  sponsor: Sponsor;
  contacts: Contact[];
  files: FileRecord[];
}

const TABS = [
  { id: "info",      label: "Informacije" },
  { id: "dokumenti", label: "Dokumenti" },
] as const;

type Tab = typeof TABS[number]["id"];

export default function PortalPartnerTabs({ sponsor, contacts, files }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const mainContacts   = contacts.filter((c) => c.type === "contact");
  const ticketContacts = contacts.filter((c) => c.type === "ticket");

  return (
    <div>
      {/* Osnovno */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 size={22} className="text-brand-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{sponsor.name}</h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`badge text-sm ${packageColor(sponsor.package_type as PackageType)}`}>
                {sponsor.package_type}
              </span>
              {sponsor.payment_status && (
                <span className={`badge text-sm ${paymentStatusColor(sponsor.payment_status as PaymentStatus)}`}>
                  {paymentStatusLabel(sponsor.payment_status as PaymentStatus)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
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
        <div className="space-y-4">
          {(sponsor.contact_name || sponsor.contact_email || sponsor.contact_phone) && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Primarni kontakt</p>
              <div className="space-y-2">
                {sponsor.contact_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={14} className="text-gray-400" />
                    {sponsor.contact_name}
                  </div>
                )}
                {sponsor.contact_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail size={14} className="text-gray-400" />
                    <a href={`mailto:${sponsor.contact_email}`} className="text-brand-600 hover:underline">
                      {sponsor.contact_email}
                    </a>
                  </div>
                )}
                {sponsor.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={14} className="text-gray-400" />
                    {sponsor.contact_phone}
                  </div>
                )}
              </div>
            </div>
          )}

          {mainContacts.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <Users size={15} className="text-gray-400" />
                Kontakt osobe
              </h3>
              <div className="space-y-3">
                {mainContacts.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={12} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      {c.role  && <p className="text-xs text-gray-400">{c.role}</p>}
                      {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                      {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ticketContacts.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <Ticket size={15} className="text-gray-400" />
                Osobe za ulaznice
              </h3>
              <div className="space-y-3">
                {ticketContacts.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={12} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      {c.role  && <p className="text-xs text-gray-400">{c.role}</p>}
                      {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                      {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mainContacts.length === 0 && ticketContacts.length === 0 && !sponsor.contact_name && (
            <div className="card p-10 text-center">
              <p className="text-gray-400 text-sm">Nema kontakt podataka.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Dokumenti */}
      {activeTab === "dokumenti" && (
        <div>
          {files.length === 0 ? (
            <div className="card p-16 text-center">
              <FolderOpen size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nema uploadanih dokumenata.</p>
            </div>
          ) : (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <FileText size={15} className="text-gray-400" />
                Dokumenti ({files.length})
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
    </div>
  );
}
