import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Filter } from "lucide-react";
import { packageColor, paymentStatusColor, paymentStatusLabel, leadStatusColor, leadStatusLabel } from "@/lib/utils";
import type { PackageType, PaymentStatus, LeadStatus } from "@/types";
import AddSponsorModal from "@/components/admin/AddSponsorModal";
import SearchInput from "@/components/admin/SearchInput";
import PackageTypeManager from "@/components/admin/PackageTypeManager";
import { ChevronRight } from "lucide-react";

interface Props {
  searchParams: { package?: string; payment?: string; lead?: string; q?: string };
}

function parsePackages(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function buildUrl(params: { package?: string; payment?: string; lead?: string }) {
  const p = new URLSearchParams();
  if (params.package) p.set("package", params.package);
  if (params.payment) p.set("payment", params.payment);
  if (params.lead)    p.set("lead", params.lead);
  return `/admin/sponsors${p.size ? "?" + p.toString() : ""}`;
}

const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "cold_lead",           label: "Cold Lead" },
  { value: "hot_lead",            label: "Hot Lead" },
  { value: "confirmed_new",       label: "Potvrđeno Novi" },
  { value: "confirmed_returning", label: "Potvrđeno Stari" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "paid",    label: "Plaćeno" },
  { value: "pending", label: "Na čekanju" },
  { value: "overdue", label: "Kasni" },
];

export default async function SponsorsPage({ searchParams }: Props) {
  const supabase = await createClient();

  const sponsorsRes = await supabase
    .from("sponsors")
    .select("*, sponsor_benefits(id, status), sponsor_contacts(name, email, type)")
    .order("name");

  let packageTypesRes: { data: { id: string; name: string }[] | null } = { data: null };
  try {
    packageTypesRes = await supabase.from("package_types").select("id, name").order("sort_order");
  } catch {}

  const packageTypes = (packageTypesRes as any)?.data ?? [
    { id: "1", name: "Glavni" }, { id: "2", name: "Zlatni" },
    { id: "3", name: "Srebrni" }, { id: "4", name: "Brončani" },
    { id: "5", name: "Medijski" }, { id: "6", name: "Community" },
  ];
  const packageTypeNames: string[] = packageTypes.map((p: { name: string }) => p.name);

  const activePackages = parsePackages(searchParams.package);
  let sponsors = sponsorsRes.data ?? [];

  if (activePackages.length > 0) {
    sponsors = sponsors.filter((s) => activePackages.includes(s.package_type));
  }
  if (searchParams.payment) {
    sponsors = sponsors.filter((s) => s.payment_status === searchParams.payment);
  }
  if (searchParams.lead) {
    sponsors = sponsors.filter((s) => s.lead_status === searchParams.lead);
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    sponsors = sponsors.filter(
      (s) => s.name.toLowerCase().includes(q) || s.contact_name?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Sponzori</h1>
          <p className="page-subtitle">{sponsors.length} sponzora ukupno</p>
        </div>
        <AddSponsorModal packageTypes={packageTypeNames} />
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <SearchInput placeholder="Pretraži sponzore..." />

          <div className="w-px h-6 bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>Kategorija:</span>
          </div>

          <PackageTypeManager
            packageTypes={packageTypes}
            activePackages={activePackages}
            activePayment={searchParams.payment}
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Payment filter */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>Plaćanje:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href={buildUrl({ package: searchParams.package, lead: searchParams.lead })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !searchParams.payment ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Svi
            </a>
            {PAYMENT_STATUSES.map((s) => (
              <a
                key={s.value}
                href={buildUrl({ package: searchParams.package, lead: searchParams.lead, payment: s.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  searchParams.payment === s.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200 hidden sm:block" />

          {/* Lead status filter */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Status:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href={buildUrl({ package: searchParams.package, payment: searchParams.payment })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !searchParams.lead ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Svi
            </a>
            {LEAD_STATUSES.map((s) => (
              <a
                key={s.value}
                href={buildUrl({ package: searchParams.package, payment: searchParams.payment, lead: s.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  searchParams.lead === s.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : `${leadStatusColor(s.value)} hover:opacity-80`
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsors table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Tvrtka</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Paket</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Kontakt</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Plaćanje</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Benefiti</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sponsors.map((sponsor) => {
                const benefits = sponsor.sponsor_benefits ?? [];
                const completed = benefits.filter((b: { status: string }) => b.status === "completed").length;
                const total = benefits.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const mainContact = (sponsor.sponsor_contacts as { name: string; email: string; type: string }[] | null)
                  ?.find((x) => x.type === "contact");
                const contactName = mainContact?.name ?? sponsor.contact_name;
                const contactEmail = mainContact?.email ?? sponsor.contact_email;

                return (
                  <tr key={sponsor.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="py-3 px-4">
                      <a href={`/admin/sponsors/${sponsor.id}`} className="font-semibold text-gray-900 hover:text-brand-600 transition-colors">{sponsor.name}</a>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${packageColor(sponsor.package_type as PackageType)}`}>
                        {sponsor.package_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sponsor.lead_status ? (
                        <span className={`badge border ${leadStatusColor(sponsor.lead_status as LeadStatus)}`}>
                          {leadStatusLabel(sponsor.lead_status as LeadStatus)}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-700">{contactName}</p>
                      <p className="text-gray-400 text-xs">{contactEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${paymentStatusColor(sponsor.payment_status as PaymentStatus)}`}>
                        {paymentStatusLabel(sponsor.payment_status as PaymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{completed}/{total}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/sponsors/${sponsor.id}`}
                        className="inline-flex items-center gap-1 text-gray-400 hover:text-brand-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="text-xs">Detalji</span>
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="text-gray-400">Nema sponzora koji odgovaraju filteru</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
