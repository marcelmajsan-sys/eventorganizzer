import { createClient } from "@/lib/supabase/server";
import { Filter } from "lucide-react";
import { leadStatusColor, leadStatusLabel } from "@/lib/utils";
import type { LeadStatus, PaymentStatus } from "@/types";
import AddSponsorModal from "@/components/admin/AddSponsorModal";
import SearchInput from "@/components/admin/SearchInput";
import PackageTypeManager from "@/components/admin/PackageTypeManager";
import SponsorsTableWithSelect from "@/components/admin/SponsorsTableWithSelect";

interface Props {
  searchParams: { package?: string; payment?: string; lead?: string; type?: string; q?: string };
}

function parsePackages(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function buildUrl(params: { package?: string; payment?: string; lead?: string; type?: string }) {
  const p = new URLSearchParams();
  if (params.package) p.set("package", params.package);
  if (params.payment) p.set("payment", params.payment);
  if (params.lead)    p.set("lead", params.lead);
  if (params.type)    p.set("type", params.type);
  return `/admin/sponsors${p.size ? "?" + p.toString() : ""}`;
}

const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "cold_lead",           label: "Cold Lead" },
  { value: "hot_lead",            label: "Hot Lead" },
  { value: "confirmed_new",       label: "Potvrđeno Novi" },
  { value: "confirmed_returning", label: "Potvrđeno Stari" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "paid",         label: "Plaćeno" },
  { value: "partial",      label: "Djelomično plaćeno" },
  { value: "pending",      label: "Na čekanju" },
  { value: "overdue",      label: "Kasni" },
  { value: "compensation", label: "Kompenzacija" },
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
  } else if (searchParams.type === "leads") {
    sponsors = sponsors.filter((s) => s.lead_status === "cold_lead" || s.lead_status === "hot_lead");
  } else if (searchParams.type === "clients") {
    sponsors = sponsors.filter((s) => s.lead_status === "confirmed_new" || s.lead_status === "confirmed_returning");
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    sponsors = sponsors.filter((s) => {
      const contacts = (s.sponsor_contacts as { name: string | null; email: string | null }[]) ?? [];
      return (
        s.name.toLowerCase().includes(q) ||
        s.contact_name?.toLowerCase().includes(q) ||
        contacts.some((c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
      );
    });
  }

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Partneri</h1>
          <p className="page-subtitle">{sponsors.length} partnera ukupno</p>
        </div>
        <AddSponsorModal packageTypes={packageTypeNames} />
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        {/* Row 0 — Tražilica */}
        <div className="flex flex-wrap gap-3 items-center">
          <SearchInput placeholder="Pretraži partnere..." />
        </div>

        {/* Row 1 — Kategorija */}
        <div className="flex flex-wrap gap-3 items-center">
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

        {/* Row 2 — Plaćanje */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>Plaćanje:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href={buildUrl({ package: searchParams.package, lead: searchParams.lead, type: searchParams.type })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !searchParams.payment ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Svi
            </a>
            {PAYMENT_STATUSES.map((s) => (
              <a
                key={s.value}
                href={buildUrl({ package: searchParams.package, lead: searchParams.lead, type: searchParams.type, payment: s.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  searchParams.payment === s.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Row 3 — Status (lead status) */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>Status:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href={buildUrl({ package: searchParams.package, payment: searchParams.payment })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !searchParams.lead && !searchParams.type ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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

        {/* Row 4 — Tip kontakta */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>Tip kontakta:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href={buildUrl({ package: searchParams.package, payment: searchParams.payment })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !searchParams.type && !searchParams.lead ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Svi
            </a>
            <a
              href={buildUrl({ package: searchParams.package, payment: searchParams.payment, type: "leads" })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                searchParams.type === "leads"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "text-red-700 bg-red-50 border-red-200 hover:opacity-80"
              }`}
            >
              Leadovi
            </a>
            <a
              href={buildUrl({ package: searchParams.package, payment: searchParams.payment, type: "clients" })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                searchParams.type === "clients"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200 hover:opacity-80"
              }`}
            >
              Klijenti
            </a>
          </div>
        </div>
      </div>

      <SponsorsTableWithSelect sponsors={sponsors as any} packageTypeNames={packageTypeNames} />
    </div>
  );
}
