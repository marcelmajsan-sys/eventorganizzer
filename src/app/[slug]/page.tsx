import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Building2, Briefcase } from "lucide-react";

const SELECT = "id, name, company, role, ticket_type, slug";

async function findContact(slug: string) {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL_2026 ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY_2026 ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Ulaznica: nedostaju env varijable za Supabase.");
    return null;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: bySlug, error } = await supabase
    .from("sponsor_contacts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("type", "ticket")
    .maybeSingle();

  if (error) {
    console.error("Ulaznica: greška pri dohvatu:", error.message);
    return null;
  }

  return bySlug ?? null;
}

export default async function TicketPage({ params }: { params: { slug: string } }) {
  const contact = await findContact(params.slug);

  if (!contact) notFound();

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
            <div className="flex flex-col sm:flex-row">

              {/* Left — event info */}
              <div className="flex-1 px-6 py-6 border-b sm:border-b-0 sm:border-r border-dashed border-gray-300">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                  Ulaznica · Ticket
                </p>
                <h1
                  className="font-black text-gray-900 leading-none tracking-tight"
                  style={{ fontSize: "clamp(1.4rem, 6vw, 2.1rem)" }}
                >
                  CRO COMMERCE 2026
                </h1>
                <p className="font-bold text-gray-700 mt-1 text-xl">13.10.2026.</p>
                <p className="text-gray-500 mt-0.5 text-sm">Mozaik Event Centar, Slavonska Avenija 6/2, Zagreb</p>
                <p className="text-gray-500 mt-1 text-sm font-medium">Registracija i kava: 8:30</p>

                <span className={`mt-3 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold tracking-wide border ${
                  isVip
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                }`}>
                  {isVip ? "VIP" : "STANDARD"}
                </span>

                <div className="mt-4 space-y-1">
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
                </div>
              </div>

              {/* Right — QR + owner */}
              <div className="flex flex-row sm:flex-col items-center justify-center px-6 py-5 gap-4 sm:gap-3 sm:min-w-[180px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR kod" width={120} height={120} className="block flex-shrink-0" style={{ imageRendering: "pixelated" }} />
                <div className="text-left sm:text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Vlasnik ulaznice</p>
                  <p className="font-bold text-gray-900 text-base mt-0.5 leading-tight">{contact.name}</p>
                </div>
              </div>
            </div>

            {/* Bottom disclaimer */}
            <div className="px-8 py-4 border-t border-gray-200 text-xs text-gray-500 leading-relaxed" style={{ background: "#fafafa" }}>
              <p>
                Ulaznica vrijedi za cijeli dan (uključujući party), glasi na ime i prezime i nije prenosiva.
                Ulaznicu je potrebno zamijeniti za akreditaciju na registracijskom pultu konferencije.{" "}
                <span className="text-gray-400">
                  The ticket is valid for all day (including party), it&apos;s under your name and it&apos;s not transferable.
                  The ticket needs to be exchanged for a Conference pass at the registration desk.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="h-1 w-full" style={{ background: "#111827" }} />
      </div>

      <p className="mt-5 text-xs text-gray-400">conference.ecommerce.hr &nbsp;·&nbsp; CRO Commerce 2026</p>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Ulaznica · CRO Commerce 2026", robots: "noindex" };
}
