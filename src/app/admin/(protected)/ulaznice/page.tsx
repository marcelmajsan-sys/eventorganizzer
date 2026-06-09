import { createAdminClient } from "@/lib/supabase/server";
import { Ticket, Building2, Mail, Phone, User, Briefcase } from "lucide-react";

type TicketContact = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  ticket_type: "vip" | "standard" | null;
  sponsor: { id: string; name: string } | null;
};

export default async function UlaznicePage() {
  const adminClient = await createAdminClient();

  const { data: raw } = await adminClient
    .from("sponsor_contacts")
    .select("id, name, company, role, email, phone, ticket_type, sponsor_id, sponsors(id, name)")
    .eq("type", "ticket")
    .order("name");

  const contacts: TicketContact[] = (raw ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    company: c.company ?? null,
    role: c.role ?? null,
    email: c.email ?? null,
    phone: c.phone ?? null,
    ticket_type: c.ticket_type ?? null,
    sponsor: Array.isArray(c.sponsors) ? (c.sponsors[0] ?? null) : (c.sponsors ?? null),
  }));

  const vipCount = contacts.filter((c) => c.ticket_type === "vip").length;
  const standardCount = contacts.filter((c) => c.ticket_type === "standard").length;
  const noTypeCount = contacts.filter((c) => !c.ticket_type).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Ulaznice</h1>
        <p className="text-gray-500 mt-1">Sve osobe za ulaznice po partnerima</p>
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
            <p className="text-2xl font-bold text-gray-900">{standardCount + noTypeCount}</p>
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tvrtka</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Funkcija</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Telefon</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Partner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-orange-600" />
                        </div>
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-gray-400 flex-shrink-0" />
                          {c.company}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.role ? (
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={13} className="text-gray-400 flex-shrink-0" />
                          {c.role}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 transition-colors"
                        >
                          <Mail size={13} className="flex-shrink-0" />
                          {c.email}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-gray-400 flex-shrink-0" />
                          {c.phone}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.ticket_type === "vip" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                          VIP
                        </span>
                      ) : c.ticket_type === "standard" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          Standard
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.sponsor ? (
                        <a
                          href={`/admin/sponsors/${c.sponsor.id}`}
                          className="text-gray-700 hover:text-brand-600 transition-colors font-medium"
                        >
                          {c.sponsor.name}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
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
