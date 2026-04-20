import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building2, Mail, Phone, User, Users, Ticket, File, FileText } from "lucide-react";
import { packageColor, paymentStatusLabel, paymentStatusColor, formatDate, formatFileSize } from "@/lib/utils";
import type { PackageType, PaymentStatus } from "@/types";

export default async function PortalSponsorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = await createAdminClient();
  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("sponsor_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) redirect("/login");

  const [{ data: sponsor }, { data: contacts }, { data: files }] = await Promise.all([
    adminClient.from("sponsors").select("*").eq("id", sponsorUser.sponsor_id).single(),
    adminClient.from("sponsor_contacts").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("created_at"),
    adminClient.from("files").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("uploaded_at", { ascending: false }),
  ]);

  if (!sponsor) redirect("/login");

  const mainContacts = (contacts ?? []).filter((c) => c.type === "contact");
  const ticketContacts = (contacts ?? []).filter((c) => c.type === "ticket");

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Moj sponzor</h1>
          <p className="page-subtitle">Informacije o vašem sponzorstvu</p>
        </div>
      </div>

      {/* Osnovne informacije */}
      <div className="card p-6 mb-4">
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

        {(sponsor.contact_name || sponsor.contact_email || sponsor.contact_phone) && (
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Primarni kontakt</p>
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
        )}
      </div>

      {/* Kontakt osobe */}
      {mainContacts.length > 0 && (
        <div className="card p-5 mb-4">
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
                  {c.role && <p className="text-xs text-gray-400">{c.role}</p>}
                  {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                  {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Osobe za ulaznice */}
      {ticketContacts.length > 0 && (
        <div className="card p-5 mb-4">
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
                  {c.role && <p className="text-xs text-gray-400">{c.role}</p>}
                  {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                  {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datoteke */}
      {(files ?? []).length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <FileText size={15} className="text-gray-400" />
            Datoteke ({(files ?? []).length})
          </h3>
          <div className="space-y-2">
            {(files ?? []).map((file) => (
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
                    {file.file_size ? formatFileSize(file.file_size) : ""}{file.file_size ? " · " : ""}{formatDate(file.uploaded_at)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
