import { createAdminClient } from "@/lib/supabase/server";
import { Ticket, Building2, Mail, Phone, User, Briefcase } from "lucide-react";
// Phone i Briefcase se koriste unutar redaka tablice
import UlazniceActions, { DeleteTicketButton, QRButton, GenerateSlugsButton } from "@/components/admin/UlazniceActions";

type TicketContact = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  ticket_type: "vip" | "standard" | null;
  notes: string | null;
  slug: string | null;
  sponsor: { id: string; name: string } | null;
};

export default async function UlaznicePage() {
  const adminClient = await createAdminClient();

  let { data: raw, error: rawErr } = await adminClient
    .from("sponsor_contacts")
    .select("id, name, company, role, email, phone, ticket_type, notes, slug, sponsor_id, sponsors(id, name)")
    .eq("type", "ticket")
    .order("name");

  // Graceful degradation: ako slug kolona još ne postoji (migration_028 nije pokrenut)
  if (rawErr?.message?.includes("slug")) {
    const { data: rawNoSlug } = await adminClient
      .from("sponsor_contacts")
      .select("id, name, company, role, email, phone, ticket_type, notes, sponsor_id, sponsors(id, name)")
      .eq("type", "ticket")
      .order("name");
    raw = (rawNoSlug ?? []).map((c: any) => ({ ...c, slug: null }));
  }

  const contacts: TicketContact[] = (raw ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    company: c.company ?? null,
    role: c.role ?? null,
    email: c.email ?? null,
    phone: c.phone ?? null,
    ticket_type: c.ticket_type ?? null,
    notes: c.notes ?? null,
    slug: c.slug ?? null,
    sponsor: Array.isArray(c.sponsors) ? (c.sponsors[0] ?? null) : (c.sponsors ?? null),
  }));

  const vipCount = contacts.filter((c) => c.ticket_type === "vip").length;
  const standardCount = contacts.filter((c) => c.ticket_type !== "vip").length;
  const missingSlugCount = contacts.filter((c) => !c.slug).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Ulaznice</h1>
          <p className="text-gray-500 mt-1">Sve osobe za ulaznice</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <GenerateSlugsButton missingCount={missingSlugCount} />
          <UlazniceActions />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Ticket size={18} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
            <p className="text-xs text-gray-500">Ukupno osoba</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Ticket size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{vipCount}</p>
            <p className="text-xs text-gray-500">VIP ulaznice</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Ticket size={18} className="text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{standardCount}</p>
            <p className="text-xs text-gray-500">Standard ulaznice</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {contacts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Ticket size={32} className="mx-auto mb-3 opacity-30" />
            <p>Nema dodanih osoba za ulaznice</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ime i prezime</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tvrtka / Kategorija</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Partner</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    {/* Ime + QR gumb uvijek vidljivi */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-orange-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{c.name}</span>
                          {c.notes && <span className="text-xs text-gray-400 line-clamp-1">{c.notes}</span>}
                        </div>
                        <QRButton slug={c.slug} name={c.name} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 transition-colors text-sm">
                          <Mail size={13} className="flex-shrink-0" />{c.email}
                        </a>
                      ) : <span className="text-gray-300">—</span>}
                      {c.phone && <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><Phone size={11} />{c.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.company && <div className="flex items-center gap-1.5"><Building2 size={13} className="text-gray-400 flex-shrink-0" />{c.company}</div>}
                      {c.role && <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Briefcase size={11} />{c.role}</div>}
                      {!c.company && !c.role && <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.ticket_type === "vip" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">VIP</span>
                      ) : c.ticket_type === "standard" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">Standard</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.sponsor ? (
                        <a href={`/admin/sponsors/${c.sponsor.id}`} className="text-gray-700 hover:text-brand-600 transition-colors font-medium text-sm">{c.sponsor.name}</a>
                      ) : <span className="text-gray-400 text-xs">Ručno</span>}
                    </td>
                    <td className="px-4 py-3">
                      <DeleteTicketButton id={c.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
