import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PROJECT_COOKIE } from "@/lib/supabase/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, FileText, User, Mail, Phone,
  Calendar, CheckCircle2, Clock, AlertTriangle, XCircle
} from "lucide-react";
import {
  packageColor, paymentStatusColor, paymentStatusLabel,
  benefitStatusColor, benefitStatusLabel, leadStatusColor, leadStatusLabel, formatDate, daysUntil
} from "@/lib/utils";
import type { PackageType, PaymentStatus, BenefitStatus, LeadStatus } from "@/types";
import BenefitStatusSelect from "@/components/admin/BenefitStatusSelect";
import FileUploadSection from "@/components/admin/FileUploadSection";
import EditSponsorForm from "@/components/admin/EditSponsorForm";
import EditBenefitModal from "@/components/admin/EditBenefitModal";
import AddBenefitModal from "@/components/admin/AddBenefitModal";
import DeleteBenefitButton from "@/components/admin/DeleteBenefitButton";
import ContactsSection from "@/components/admin/ContactsSection";
import DeleteSponsorButton from "@/components/admin/DeleteSponsorButton";

interface Props {
  params: { id: string };
}

export default async function SponsorDetailPage({ params }: Props) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const projectId = cookieStore.get(PROJECT_COOKIE)?.value ?? "2026";

  const [{ data: sponsor }, { data: benefits }, { data: files }, { data: contacts }] = await Promise.all([
    supabase.from("sponsors").select("*").eq("id", params.id).single(),
    supabase.from("sponsor_benefits").select("*").eq("sponsor_id", params.id).order("deadline"),
    supabase.from("files").select("*").eq("sponsor_id", params.id).order("uploaded_at", { ascending: false }),
    supabase.from("sponsor_contacts").select("*").eq("sponsor_id", params.id).order("created_at"),
  ]);

  let packageTypeNames: string[] = ["Glavni", "Zlatni", "Srebrni", "Brončani", "Medijski", "Community"];
  try {
    const { data: pkgTypes } = await supabase.from("package_types").select("name").order("sort_order");
    if (pkgTypes && pkgTypes.length > 0) packageTypeNames = pkgTypes.map((p) => p.name);
  } catch {}

  if (!sponsor) notFound();

  const completed = benefits?.filter((b) => b.status === "completed").length ?? 0;
  const total = benefits?.length ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusIcon = {
    completed: <CheckCircle2 size={16} className="text-emerald-500" />,
    in_progress: <Clock size={16} className="text-blue-500" />,
    not_started: <XCircle size={16} className="text-gray-400" />,
    overdue: <AlertTriangle size={16} className="text-red-500" />,
  };

  return (
    <div className="animate-enter">
      <div className="mb-6">
        <Link
          href="/admin/sponsors"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Natrag na sponzore
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title flex items-center gap-3">
              {sponsor.name}
              <span className={`badge ${packageColor(sponsor.package_type as PackageType)} text-sm`}>
                {sponsor.package_type}
              </span>
            </h1>
            <p className="page-subtitle">Detalji sponzora i upravljanje benefitima</p>
          </div>
          <div className="flex items-center gap-2">
            <DeleteSponsorButton sponsorId={sponsor.id} sponsorName={sponsor.name} />
            <EditSponsorForm sponsor={sponsor} packageTypes={packageTypeNames} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: sponsor info */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-gray-400" />
              Informacije
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-gray-500 text-xs">Status plaćanja</dt>
                  <dd className="mt-0.5">
                    <span className={`badge ${paymentStatusColor(sponsor.payment_status as PaymentStatus)}`}>
                      {paymentStatusLabel(sponsor.payment_status as PaymentStatus)}
                    </span>
                  </dd>
                </div>
              </div>
              {sponsor.lead_status && (
                <div className="flex items-start gap-3">
                  <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <dt className="text-gray-500 text-xs">Status</dt>
                    <dd className="mt-0.5">
                      <span className={`badge border ${leadStatusColor(sponsor.lead_status as LeadStatus)}`}>
                        {leadStatusLabel(sponsor.lead_status as LeadStatus)}
                      </span>
                    </dd>
                  </div>
                </div>
              )}
            </dl>
            {(sponsor.contact_name || sponsor.contact_email || sponsor.contact_phone) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Primarni kontakt</p>
                <div className="space-y-1.5">
                  {sponsor.contact_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User size={13} className="text-gray-400 flex-shrink-0" />
                      {sponsor.contact_name}
                    </div>
                  )}
                  {sponsor.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail size={13} className="text-gray-400 flex-shrink-0" />
                      <a href={`mailto:${sponsor.contact_email}`} className="text-brand-600 hover:underline truncate">
                        {sponsor.contact_email}
                      </a>
                    </div>
                  )}
                  {sponsor.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone size={13} className="text-gray-400 flex-shrink-0" />
                      {sponsor.contact_phone}
                    </div>
                  )}
                </div>
              </div>
            )}
            {sponsor.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Napomene</p>
                <p className="text-sm text-gray-700">{sponsor.notes}</p>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Isporuka benefita</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="bg-brand-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">{pct}%</span>
            </div>
            <p className="text-sm text-gray-500">
              {completed} od {total} benefita završeno
            </p>
          </div>

          {/* Contacts */}
          <ContactsSection sponsorId={sponsor.id} sponsorName={sponsor.name} contacts={contacts ?? []} projectId={projectId} />

          {/* Files */}
          <FileUploadSection sponsorId={sponsor.id} existingFiles={files ?? []} />
        </div>

        {/* Right: benefits */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <h3 className="font-semibold text-gray-900">Benefiti i rokovi</h3>
              </div>
              <AddBenefitModal sponsorId={sponsor.id} />
            </div>

            <div className="space-y-3">
              {benefits?.map((benefit) => {
                const days = benefit.deadline ? daysUntil(benefit.deadline) : null;
                const isOverdue = days !== null && days < 0 && benefit.status !== "completed";
                const isUrgent = days !== null && days >= 0 && days <= 7 && benefit.status !== "completed";

                return (
                  <div
                    key={benefit.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isOverdue
                        ? "border-red-200 bg-red-50"
                        : isUrgent
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <span className="mt-0.5">
                          {statusIcon[benefit.status as BenefitStatus]}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{benefit.benefit_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {benefit.deadline && (
                              <span className="text-xs text-gray-500">
                                Rok: {formatDate(benefit.deadline)}
                              </span>
                            )}
                            {isOverdue && days !== null && (
                              <span className="text-xs text-red-600 font-medium">
                                Kasni {Math.abs(days)} dana
                              </span>
                            )}
                            {isUrgent && days !== null && (
                              <span className="text-xs text-orange-600 font-medium">
                                Za {days} dana
                              </span>
                            )}
                          </div>
                          {benefit.file_url && (
                            <a
                              href={benefit.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand-600 hover:text-brand-700 mt-1 inline-block"
                            >
                              📎 Preuzmi datoteku
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeleteBenefitButton
                          benefitId={benefit.id}
                          benefitName={benefit.benefit_name}
                        />
                        <EditBenefitModal benefit={benefit} />
                        <BenefitStatusSelect
                          benefitId={benefit.id}
                          currentStatus={benefit.status as BenefitStatus}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!benefits || benefits.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-8">
                  Nema definiranih benefita za ovog sponzora
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
