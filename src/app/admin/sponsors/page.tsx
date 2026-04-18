import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, Plus, ChevronRight, Filter } from "lucide-react";
import { packageColor, paymentStatusColor, paymentStatusLabel } from "@/lib/utils";
import type { PackageType, PaymentStatus } from "@/types";
import AddSponsorModal from "@/components/admin/AddSponsorModal";

interface Props {
  searchParams: { package?: string; payment?: string; q?: string };
}

export default async function SponsorsPage({ searchParams }: Props) {
  const supabase = await createClient();

  let query = supabase
    .from("sponsors")
    .select("*, sponsor_benefits(id, status)")
    .order("name");

  if (searchParams.package) {
    query = query.eq("package_type", searchParams.package);
  }
  if (searchParams.payment) {
    query = query.eq("payment_status", searchParams.payment);
  }

  const { data: sponsors } = await query;

  const filtered = sponsors?.filter((s) =>
    searchParams.q
      ? s.name.toLowerCase().includes(searchParams.q.toLowerCase()) ||
        s.contact_name?.toLowerCase().includes(searchParams.q.toLowerCase())
      : true
  ) ?? [];

  const packages: PackageType[] = ["Glavni", "Zlatni", "Srebrni", "Brončani"];
  const paymentStatuses: { value: PaymentStatus; label: string }[] = [
    { value: "paid", label: "Plaćeno" },
    { value: "pending", label: "Na čekanju" },
    { value: "overdue", label: "Kasni" },
  ];

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Sponzori</h1>
          <p className="page-subtitle">{filtered.length} sponzora ukupno</p>
        </div>
        <AddSponsorModal />
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={14} />
          <span>Filter:</span>
        </div>

        {/* Package filter */}
        <div className="flex gap-2 flex-wrap">
          <a
            href="/admin/sponsors"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !searchParams.package
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Svi
          </a>
          {packages.map((pkg) => (
            <a
              key={pkg}
              href={`/admin/sponsors?package=${pkg}${searchParams.payment ? `&payment=${searchParams.payment}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                searchParams.package === pkg
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {pkg}
            </a>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 hidden sm:block" />

        {/* Payment filter */}
        <div className="flex gap-2 flex-wrap">
          {paymentStatuses.map((s) => (
            <a
              key={s.value}
              href={`/admin/sponsors?${searchParams.package ? `package=${searchParams.package}&` : ""}payment=${s.value}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                searchParams.payment === s.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </a>
          ))}
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Kontakt</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Plaćanje</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Benefiti</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((sponsor) => {
                const benefits = sponsor.sponsor_benefits ?? [];
                const completed = benefits.filter((b: { status: string }) => b.status === "completed").length;
                const total = benefits.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <tr key={sponsor.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{sponsor.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${packageColor(sponsor.package_type as PackageType)}`}>
                        {sponsor.package_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-700">{sponsor.contact_name}</p>
                      <p className="text-gray-400 text-xs">{sponsor.contact_email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${paymentStatusColor(sponsor.payment_status as PaymentStatus)}`}>
                        {paymentStatusLabel(sponsor.payment_status as PaymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-brand-500 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
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
