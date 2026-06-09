import { notFound } from "next/navigation";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import QRCode from "qrcode";
import { nameToSlug } from "@/lib/slugUtils";

const SELECT = "id, name, company, role, email, ticket_type, slug";

async function findContact(slug: string) {
  const supabase = createAdminClientForProject("2026");

  // 1. Lookup po stored slug
  const { data: bySlug } = await supabase
    .from("sponsor_contacts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("type", "ticket")
    .maybeSingle();
  if (bySlug) return bySlug;

  // 2. Fallback: izračunaj iz svih imena
  const { data: all } = await supabase
    .from("sponsor_contacts")
    .select(SELECT)
    .eq("type", "ticket");
  return (all ?? []).find((c: any) => nameToSlug(c.name ?? "") === slug) ?? null;
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
      {/* Ticket card */}
      <div
        className="w-full bg-white shadow-2xl rounded-sm overflow-hidden"
        style={{ maxWidth: 720 }}
      >
        {/* Top colour bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #111827 60%, #ea580c 100%)" }}
        />

        <div className="flex">
          {/* Left dark accent stripe */}
          <div className="w-3 flex-shrink-0" style={{ background: "#111827" }} />

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Upper section */}
            <div className="flex items-stretch">
              {/* Left — event info */}
              <div className="flex-1 px-8 py-7 border-r border-dashed border-gray-300">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                  Ulaznica · Ticket
                </p>
                <h1
                  className="font-black text-gray-900 leading-none tracking-tight"
                  style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}
                >
                  CRO COMMERCE 2026
                </h1>
                <p
                  className="font-bold text-gray-700 mt-1"
                  style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)" }}
                >
                  13.10.2026.
                </p>
                <p className="text-gray-500 mt-1 text-sm font-medium">
                  Registracija i kava: 8:30
                </p>

                {isVip && (
                  <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 tracking-wide">
                    VIP
                  </span>
                )}
              </div>

              {/* Right — QR + owner */}
              <div className="flex flex-col items-center justify-center px-7 py-6 gap-3" style={{ minWidth: 180 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="QR kod ulaznice"
                  width={130}
                  height={130}
                  className="block"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Vlasnik ulaznice</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5 leading-tight">
                    {contact.name}
                  </p>
                  {contact.company && (
                    <p className="text-xs text-gray-500 mt-0.5">{contact.company}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom disclaimer */}
            <div
              className="px-8 py-4 border-t border-gray-200 text-xs text-gray-500 leading-relaxed"
              style={{ background: "#fafafa" }}
            >
              <p>
                Ulaznica vrijedi za cijelu konferenciju, glasi na ime i prezime i nije prenosiva.
                Ulaznicu je potrebno zamijeniti za akreditaciju na registracijskom pultu konferencije.{" "}
                <span className="text-gray-400">
                  The ticket is valid for all conference days, it&apos;s under your name and it&apos;s not
                  transferable. The ticket needs to be exchanged for a Conference pass at the
                  registration desk.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom colour bar */}
        <div className="h-1 w-full" style={{ background: "#111827" }} />
      </div>

      <p className="mt-5 text-xs text-gray-400">
        partners.ecommerce.hr &nbsp;·&nbsp; CRO Commerce 2026
      </p>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "Ulaznica · CRO Commerce 2026",
    robots: "noindex",
  };
}
