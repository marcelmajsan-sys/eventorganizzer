import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { nameToSlug } from "@/lib/slugUtils";
import { Ticket, Building2, Briefcase, Mail } from "lucide-react";

const SELECT = "id, name, company, role, email, ticket_type, slug";

async function findContact(slug: string) {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL_2026 ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY_2026 ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return { contact: null, error: "Nedostaju env varijable." };

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Lookup po stored slug
  const { data: bySlug } = await supabase
    .from("sponsor_contacts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("type", "ticket")
    .maybeSingle();

  if (bySlug) return { contact: bySlug, error: null };

  // 2. Fallback: izračunaj slug iz svih ticketa i pronađi podudaranje
  const { data: all, error: e2 } = await supabase
    .from("sponsor_contacts")
    .select(SELECT)
    .eq("type", "ticket");

  if (e2 && !all) return { contact: null, error: e2.message };

  const found = (all ?? []).find(
    (c: any) => nameToSlug(c.name ?? "") === slug
  ) ?? null;

  return { contact: found, error: null };
}

export default async function TicketPage({ params }: { params: { slug: string } }) {
  const { contact, error } = await findContact(params.slug);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-sm w-full text-center">
          <p className="text-red-500 font-medium">Greška pri učitavanju ulaznice</p>
          <p className="text-xs text-gray-400 mt-2 font-mono">{error}</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-sm w-full text-center">
          <Ticket size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">Ulaznica nije pronađena</p>
          <p className="text-xs text-gray-400 mt-1 font-mono">{params.slug}</p>
        </div>
      </div>
    );
  }

  const ticketUrl = `https://partners.ecommerce.hr/${params.slug}`;
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
    width: 180,
    margin: 1,
    color: { dark: "#111827", light: "#ffffff" },
  });

  const isVip = contact.ticket_type === "vip";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full bg-white shadow-2xl rounded-sm overflow-hidden" style={{ maxWidth: 720 }}>
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #111827 60%, #ea580c 100%)" }} />

        <div className="flex">
          <div className="w-3 flex-shrink-0" style={{ background: "#111827" }} />

          <div className="flex-1 flex flex-col">
            <div className="flex items-stretch">

              {/* Left — event info */}
              <div className="flex-1 px-8 py-7 border-r border-dashed border-gray-300">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                  Ulaznica · Ticket
                </p>
                <h1
                  className="font-black text-gray-900 leading-none tracking-tight"
                  style={{ fontSize: "clamp(1.5rem, 4vw, 2.1rem)" }}
                >
                  CRO COMMERCE 2026
                </h1>
                <p className="font-bold text-gray-700 mt-1 text-xl">13.10.2026.</p>
                <p className="text-gray-500 mt-1 text-sm font-medium">Registracija i kava: 8:30</p>

                {isVip && (
                  <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 tracking-wide">
                    VIP
                  </span>
                )}

                <div className="mt-5 space-y-1">
                  {contact.company && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Building2 size={13} className="text-gray-400" />{contact.company}
                    </div>
                  )}
                  {contact.role && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Briefcase size={13} className="text-gray-400" />{contact.role}
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Mail size={13} className="text-gray-400" />{contact.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Right — QR + owner */}
              <div className="flex flex-col items-center justify-center px-7 py-6 gap-3" style={{ minWidth: 190 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR kod" width={130} height={130} className="block" style={{ imageRendering: "pixelated" }} />
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Vlasnik ulaznice</p>
                  <p className="font-bold text-gray-900 text-base mt-0.5 leading-tight">{contact.name}</p>
                </div>
              </div>
            </div>

            {/* Bottom disclaimer */}
            <div className="px-8 py-4 border-t border-gray-200 text-xs text-gray-500 leading-relaxed" style={{ background: "#fafafa" }}>
              <p>
                Ulaznica vrijedi za cijelu konferenciju, glasi na ime i prezime i nije prenosiva.
                Ulaznicu je potrebno zamijeniti za akreditaciju na registracijskom pultu konferencije.{" "}
                <span className="text-gray-400">
                  The ticket is valid for all conference days, it&apos;s under your name and it&apos;s not transferable.
                  The ticket needs to be exchanged for a Conference pass at the registration desk.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="h-1 w-full" style={{ background: "#111827" }} />
      </div>

      <p className="mt-5 text-xs text-gray-400">partners.ecommerce.hr &nbsp;·&nbsp; CRO Commerce 2026</p>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Ulaznica · CRO Commerce 2026", robots: "noindex" };
}
