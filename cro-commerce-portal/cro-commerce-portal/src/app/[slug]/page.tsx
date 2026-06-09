import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { PROJECTS } from "@/lib/supabase/projects";
import QRCode from "qrcode";
import { nameToSlug } from "@/lib/slugUtils";
import { Ticket, Building2, Briefcase, Mail, Calendar, MapPin } from "lucide-react";

// Public page — no auth required. Uses service role to bypass RLS.
function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_2026 ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? PROJECTS["2026"].url;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_2026 ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient(url, key);
}

export default async function TicketPage({ params }: { params: { slug: string } }) {
  const supabase = getPublicClient();

  // 1. Pokušaj lookup po stored slug koloni
  let contact: any = null;
  try {
    const { data } = await supabase
      .from("sponsor_contacts")
      .select("id, name, company, role, email, ticket_type, slug")
      .eq("slug", params.slug)
      .eq("type", "ticket")
      .maybeSingle();
    contact = data;
  } catch {}

  // 2. Fallback: ako slug kolona ne postoji ili nema podudaranja,
  //    izračunaj slug iz svih imena i pronađi prvi koji odgovara
  if (!contact) {
    const { data: allTickets } = await supabase
      .from("sponsor_contacts")
      .select("id, name, company, role, email, ticket_type")
      .eq("type", "ticket");

    contact = (allTickets ?? []).find(
      (c: any) => nameToSlug(c.name ?? "") === params.slug
    ) ?? null;
  }

  if (!contact) notFound();

  const ticketUrl = `https://partners.ecommerce.hr/${params.slug}`;
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#1f2937", light: "#ffffff" },
  });

  const isVip = contact.ticket_type === "vip";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Ticket card */}
      <div className="w-full max-w-sm">
        {/* Top accent */}
        <div className={`h-2 rounded-t-2xl ${isVip ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-orange-500 to-orange-600"}`} />

        <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`px-6 pt-6 pb-5 ${isVip ? "bg-gradient-to-br from-amber-50 to-orange-50" : "bg-gradient-to-br from-orange-50 to-white"}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CRO Commerce</p>
                <p className="text-sm font-bold text-gray-700">2026 · Zagreb</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                isVip
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}>
                <Ticket size={12} />
                {isVip ? "VIP" : "STANDARD"}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{contact.name}</h1>

            <div className="mt-3 space-y-1.5">
              {contact.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 size={14} className="text-gray-400 flex-shrink-0" />
                  {contact.company}
                </div>
              )}
              {contact.role && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={14} className="text-gray-400 flex-shrink-0" />
                  {contact.role}
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  {contact.email}
                </div>
              )}
            </div>
          </div>

          {/* Dashed divider */}
          <div className="relative flex items-center px-4 py-2">
            <div className="absolute -left-3 w-6 h-6 rounded-full bg-gray-900" />
            <div className="absolute -right-3 w-6 h-6 rounded-full bg-gray-900" />
            <div className="w-full border-t-2 border-dashed border-gray-200" />
          </div>

          {/* Event info + QR */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">13. listopada 2026.</p>
                    <p className="text-xs text-gray-500">Utorak</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Zagreb</p>
                    <p className="text-xs text-gray-500">Hrvatska</p>
                  </div>
                </div>
              </div>

              {/* QR code */}
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-xl border-2 ${isVip ? "border-amber-200" : "border-gray-200"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="QR kod ulaznice" width={100} height={100} />
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4 font-mono">{params.slug}</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Powered by{" "}
          <span className="font-semibold text-orange-400">Ecommerce d.o.o.</span>
        </p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `Ulaznica · CRO Commerce 2026`,
    robots: "noindex",
  };
}
