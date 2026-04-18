import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Mail, User, FileText,
  Calendar, CheckCircle2, Clock, AlertTriangle, XCircle
} from "lucide-react";
import {
  packageColor, paymentStatusColor, paymentStatusLabel,
  benefitStatusColor, benefitStatusLabel, formatDate, daysUntil
} from "@/lib/utils";
import type { PackageType, PaymentStatus, BenefitStatus } from "@/types";
import BenefitStatusSelect from "@/components/admin/BenefitStatusSelect";
import FileUploadSection from "@/components/admin/FileUploadSection";
import EditSponsorForm from "@/components/admin/EditSponsorForm";

interface Props {
  params: { id: string };
}

export default async function SponsorDetailPage({ params }: Props) {
  const supabase = await createClient();

  const [{ data: sponsor }, { data: benefits }, { data: files }] = await Promise.all([
    supabase.from("sponsors").select("*").eq("id", params.id).single(),
    supabase.from("sponsor_benefits").select("*").eq("sponsor_id", params.id).order("deadline"),
    supabase.from("files").select("*").eq("sponsor_id", params.id).order("uploaded_at", { ascending: false }),
  ]);

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
          <EditSponsorForm sponsor={sponsor} />
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
                <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-gray-500 text-xs">Kontakt osoba</dt>
                  <dd className="font-medium text-gray-900">{sponsor.contact_name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-gray-500 text-xs">Email</dt>
                  <dd className="font-medium text-gray-900 break-all">{sponsor.contact_email}</dd>
                </div>
              </div>
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
            </dl>
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

          {/* Files */}
          <FileUploadSection sponsorId={sponsor.id} existingFiles={files ?? []} />
        </div>

        {/* Right: benefits */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Calendar size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Benefiti i rokovi</h3>
            </div>

            <div className="space-y-3">
              {benefits?.map((benefit) => {
                const days = daysUntil(benefit.deadline);
                const isOverdue = days < 0 && benefit.status !== "completed";
                const isUrgent = days >= 0 && days <= 7 && benefit.status !== "completed";

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
                            <span className="text-xs text-gray-500">
                              Rok: {formatDate(benefit.deadline)}
                            </span>
                            {isOverdue && (
                              <span className="text-xs text-red-600 font-medium">
                                Kasni {Math.abs(days)} dana
                              </span>
                            )}
                            {isUrgent && (
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
                      <BenefitStatusSelect
                        benefitId={benefit.id}
                        currentStatus={benefit.status as BenefitStatus}
                      />
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
