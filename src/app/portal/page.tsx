import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  CheckCircle2, Clock, AlertTriangle, XCircle,
  Bell, Package, Calendar
} from "lucide-react";
import {
  packageColor, benefitStatusLabel, benefitStatusColor,
  formatDate, daysUntil
} from "@/lib/utils";
import type { PackageType, BenefitStatus } from "@/types";
import PortalFileUpload from "@/components/portal/PortalFileUpload";

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("*")
    .eq("contact_email", user.email)
    .single();

  if (!sponsor) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={24} className="text-brand-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
          Dobrodošli u CRO Commerce portal
        </h2>
        <p className="text-gray-500">
          Vaš račun još nije povezan s profilom sponzora.
          Kontaktirajte tim CRO Commerce za pomoć.
        </p>
      </div>
    );
  }

  const { data: benefits } = await supabase
    .from("sponsor_benefits")
    .select("*")
    .eq("sponsor_id", sponsor.id)
    .order("deadline");

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("sponsor_id", sponsor.id)
    .order("uploaded_at", { ascending: false });

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("sponsor_id", sponsor.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const completed = benefits?.filter((b) => b.status === "completed").length ?? 0;
  const total = benefits?.length ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  const statusIcon: Record<BenefitStatus, React.ReactNode> = {
    completed: <CheckCircle2 size={16} className="text-emerald-500" />,
    in_progress: <Clock size={16} className="text-blue-500" />,
    not_started: <XCircle size={16} className="text-gray-400" />,
    overdue: <AlertTriangle size={16} className="text-red-500" />,
  };

  return (
    <div className="animate-enter space-y-6">
      {/* Welcome header */}
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">{sponsor.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge ${packageColor(sponsor.package_type as PackageType)}`}>
                {sponsor.package_type} paket
              </span>
              <span className="text-sm text-gray-500">
                Dobrodošli, {sponsor.contact_name}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Isporuka benefita</p>
            <p className="font-display text-2xl font-bold text-gray-900">{pct}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{completed} završeno</span>
            <span>{total - completed} preostalo</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benefits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-gray-400" />
              <h2 className="font-semibold text-gray-900">Vaši benefiti</h2>
            </div>

            <div className="space-y-2.5">
              {benefits?.map((benefit) => {
                const days = daysUntil(benefit.deadline);
                const isOverdue = days < 0 && benefit.status !== "completed";
                const isUrgent = days >= 0 && days <= 7 && benefit.status !== "completed";

                return (
                  <div
                    key={benefit.id}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                      isOverdue
                        ? "bg-red-50 border-red-200"
                        : isUrgent
                        ? "bg-orange-50 border-orange-200"
                        : benefit.status === "completed"
                        ? "bg-emerald-50/50 border-emerald-100"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <span className="mt-0.5">{statusIcon[benefit.status as BenefitStatus]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{benefit.benefit_name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={10} />
                          Rok: {formatDate(benefit.deadline)}
                        </div>
                        <span className={`badge text-xs ${benefitStatusColor(benefit.status as BenefitStatus)}`}>
                          {benefitStatusLabel(benefit.status as BenefitStatus)}
                        </span>
                        {isOverdue && (
                          <span className="text-xs text-red-600 font-medium">⚠ Rok je prošao</span>
                        )}
                        {isUrgent && (
                          <span className="text-xs text-orange-600 font-medium">
                            ⏰ Rok za {days} dana
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!benefits || benefits.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">
                  Nema definiranih benefita
                </p>
              )}
            </div>
          </div>

          {/* File upload */}
          <PortalFileUpload sponsorId={sponsor.id} existingFiles={files ?? []} />
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-900">Obavijesti</h2>
            {unread > 0 && (
              <span className="ml-auto text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {notifications?.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border text-sm ${
                  notif.read
                    ? "bg-gray-50 border-gray-100 text-gray-600"
                    : "bg-brand-50 border-brand-100 text-gray-800"
                }`}
              >
                <p className="font-medium text-xs text-gray-500 mb-0.5">{notif.title}</p>
                <p className="text-xs">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(notif.created_at)}
                </p>
              </div>
            ))}
            {(!notifications || notifications.length === 0) && (
              <div className="text-center py-8">
                <Bell size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nema novih obavijesti</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
