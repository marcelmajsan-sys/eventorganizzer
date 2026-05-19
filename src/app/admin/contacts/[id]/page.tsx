import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, User, Building2, Tag, FileText } from "lucide-react";
import ContactDetailActions from "@/components/admin/ContactDetailActions";

const TYPE_LABELS: Record<string, string> = {
  contact:          "Kontakt osoba",
  ticket:           "Osoba za ulaznice",
  partner:          "Partner",
  visitor:          "Visitor",
  speaker:          "Speaker",
  service_provider: "Service Provider",
  brand_ambassador: "Brand Ambassador",
};

const TYPE_STYLE: Record<string, string> = {
  contact:          "bg-blue-50 text-blue-700 border-blue-200",
  ticket:           "bg-amber-50 text-amber-700 border-amber-200",
  partner:          "bg-brand-50 text-brand-700 border-brand-200",
  visitor:          "bg-teal-50 text-teal-700 border-teal-200",
  speaker:          "bg-purple-50 text-purple-700 border-purple-200",
  service_provider: "bg-gray-100 text-gray-600 border-gray-200",
  brand_ambassador: "bg-pink-50 text-pink-700 border-pink-200",
};

interface Props {
  params: { id: string };
}

export default async function ContactDetailPage({ params }: Props) {
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("sponsor_contacts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!contact) notFound();

  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("id, name, package_type")
    .eq("id", contact.sponsor_id)
    .single();

  return (
    <div className="animate-enter max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/contacts"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Natrag na kontakte
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">{contact.name}</h1>
            <p className="page-subtitle">
              {TYPE_LABELS[contact.type] ?? contact.type}
              {sponsor ? ` · ${sponsor.name}` : ""}
            </p>
          </div>
          <ContactDetailActions contact={contact} />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Ime i prezime</p>
            <p className="font-semibold text-gray-900">{contact.name}</p>
          </div>
        </div>

        {contact.email && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <a
                href={`mailto:${contact.email}`}
                className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                {contact.email}
              </a>
            </div>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Telefon</p>
              <a
                href={`tel:${contact.phone}`}
                className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        )}

        {contact.company && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Firma</p>
              <p className="font-medium text-gray-900">{contact.company}</p>
            </div>
          </div>
        )}

        {contact.role && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Tag size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Funkcija</p>
              <p className="font-medium text-gray-900">{contact.role}</p>
            </div>
          </div>
        )}

        {sponsor && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Sponzor / partner</p>
              <Link
                href={`/admin/sponsors/${sponsor.id}`}
                className="font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
              >
                {sponsor.name}
              </Link>
              <span className="ml-2 text-xs text-gray-400">{sponsor.package_type}</span>
            </div>
          </div>
        )}

        {contact.notes && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Napomena</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <span className={`badge ${TYPE_STYLE[contact.type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {TYPE_LABELS[contact.type] ?? contact.type}
          </span>
        </div>
      </div>
    </div>
  );
}
