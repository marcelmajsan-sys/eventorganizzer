import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import {
  Users, CreditCard, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, Package, Wallet, CircleDollarSign, ListChecks
} from "lucide-react";
import { packageBadgeColor, paymentStatusColor } from "@/lib/utils";
import type { PackageType } from "@/types";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);

  const [
    { data: sponsors },
    { data: benefits },
    { data: tasks },
  ] = await Promise.all([
    supabase.from("sponsors").select("*"),
    supabase.from("sponsor_benefits").select("*"),
    supabase.from("tasks").select("*"),
  ]);

  let budgetItems: any[] = [];
  try {
    const { data } = await supabase
      .from("budget_items")
      .select("id, status, amount")
      .eq("project_id", projectId);
    budgetItems = data ?? [];
  } catch {}

  const formatEur = (n: number) =>
    new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const budgetPaid    = budgetItems.filter(i => i.status === "paid").reduce((s: number, i: any) => s + i.amount, 0);
  const budgetPending = budgetItems.filter(i => i.status === "pending").reduce((s: number, i: any) => s + i.amount, 0);
  const budgetUnknown = budgetItems.filter(i => i.status === "unknown").reduce((s: number, i: any) => s + i.amount, 0);
  const budgetTotal   = budgetItems.filter(i => i.status !== "cancelled").reduce((s: number, i: any) => s + i.amount, 0);

  const totalSponsors = sponsors?.length ?? 0;
  const paidCount = sponsors?.filter((s) => s.payment_status === "paid").length ?? 0;
  const pendingCount = sponsors?.filter((s) => s.payment_status === "pending").length ?? 0;
  const overduePayments = sponsors?.filter((s) => s.payment_status === "overdue").length ?? 0;
  const openTasks = tasks?.filter((t) => t.status !== "done").length ?? 0;
  const now = new Date().toISOString();
  const overdueBenefits = benefits?.filter(
    (b) => b.status !== "completed" && b.deadline < now
  ).length ?? 0;
  const completedBenefits = benefits?.filter((b) => b.status === "completed").length ?? 0;
  const totalBenefits = benefits?.length ?? 0;
  const completionRate = totalBenefits > 0 ? Math.round((completedBenefits / totalBenefits) * 100) : 0;

  const byPackage: Record<string, number> = {};
  sponsors?.forEach((s) => {
    byPackage[s.package_type] = (byPackage[s.package_type] ?? 0) + 1;
  });

  const packageOrder: PackageType[] = ["Glavni", "Zlatni", "Srebrni", "Brončani"];

  // Recent sponsors
  const recentSponsors = sponsors?.slice(-5).reverse() ?? [];

  const statCards = [
    {
      value: totalSponsors,
      label: "Ukupno sponzora",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      value: paidCount,
      label: "Plaćenih",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: `${pendingCount} na čekanju`,
    },
    {
      value: openTasks,
      label: "Otvorenih zadataka",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      value: overdueBenefits,
      label: "Benefita kasni",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="animate-enter">
      <div className="page-header">
        <h1 className="page-title">Nadzorna ploča</h1>
      </div>

      {/* Budget summary — top */}
      {budgetItems.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Ukupni budžet", value: formatEur(budgetTotal), sub: `${budgetItems.filter(i => i.status !== "cancelled").length} stavki`, icon: CircleDollarSign, iconCls: "text-gray-400", valCls: "text-gray-900", href: "/admin/troskovi" },
            { label: "Plaćeno", value: formatEur(budgetPaid), sub: `${budgetTotal > 0 ? Math.round((budgetPaid/budgetTotal)*100) : 0}% budžeta`, icon: Wallet, iconCls: "text-emerald-500", valCls: "text-emerald-600", href: "/admin/troskovi?status=paid", progress: budgetTotal > 0 ? Math.round((budgetPaid/budgetTotal)*100) : 0, progressCls: "bg-emerald-500" },
            { label: "Na čekanju", value: formatEur(budgetPending), sub: `${budgetItems.filter(i=>i.status==="pending").length} stavki`, icon: TrendingUp, iconCls: "text-amber-500", valCls: "text-amber-600", href: "/admin/troskovi?status=pending" },
            { label: "Nepotvrđeni trošak", value: formatEur(budgetUnknown), sub: `${budgetItems.filter(i=>i.status==="unknown").length} stavki`, icon: ListChecks, iconCls: "text-purple-400", valCls: "text-purple-700", labelCls: "text-purple-500", href: "/admin/troskovi?status=unknown" },
            { label: "Preostalo za platiti", value: formatEur(budgetTotal - budgetPaid), sub: `${budgetTotal > 0 ? 100-Math.round((budgetPaid/budgetTotal)*100) : 100}% budžeta`, icon: ListChecks, iconCls: "text-gray-400", valCls: "text-gray-900", href: "/admin/troskovi" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <a key={c.label} href={c.href} className="card p-4 block hover:shadow-md transition-shadow hover:border-brand-200 border border-transparent">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-medium ${(c as any).labelCls ?? "text-gray-500"}`}>{c.label}</p>
                  <Icon size={16} className={c.iconCls} />
                </div>
                <p className={`text-xl font-bold ${c.valCls}`}>{c.value}</p>
                {(c as any).progress !== undefined && (
                  <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                    <div className={`${(c as any).progressCls} h-1.5 rounded-full transition-all`} style={{ width: `${(c as any).progress}%` }} />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
              </a>
            );
          })}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { value: totalSponsors, label: "Ukupno sponzora", icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/sponsors" },
          { value: paidCount, label: "Plaćenih", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", sub: `${pendingCount} na čekanju`, href: "/admin/sponsors?payment=paid" },
          { value: openTasks, label: "Otvorenih zadataka", icon: Clock, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/tasks" },
          { value: overdueBenefits, label: "Benefita kasni", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", href: "/admin/benefits" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <a key={i} href={card.href} className={`card p-5 block hover:shadow-md transition-shadow hover:border-brand-200 border border-transparent`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-value text-gray-900">{card.value}</p>
                  <p className="stat-label mt-0.5">{card.label}</p>
                  {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
                </div>
                <div className={`${card.bg} p-2.5 rounded-lg`}>
                  <Icon size={20} className={card.color} />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Package breakdown */}
        <a href="/admin/sponsors" className="card p-6 block hover:shadow-md transition-shadow hover:border-brand-200 border border-transparent">
          <div className="flex items-center gap-2 mb-5">
            <Package size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Sponzori po paketu</h3>
          </div>
          <div className="space-y-3">
            {packageOrder.map((pkg) => {
              const count = byPackage[pkg] ?? 0;
              const pct = totalSponsors > 0 ? (count / totalSponsors) * 100 : 0;
              return (
                <div key={pkg}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${packageBadgeColor(pkg as PackageType)}`} />
                      <span className="text-sm font-medium text-gray-700">{pkg}</span>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${packageBadgeColor(pkg as PackageType)} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </a>

        {/* Payment status */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Status plaćanja</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Plaćeno", count: paidCount, status: "paid", color: "bg-emerald-500" },
              { label: "Na čekanju", count: pendingCount, status: "pending", color: "bg-yellow-500" },
              { label: "Kasni", count: overduePayments, status: "overdue", color: "bg-red-500" },
            ].map((item) => (
              <a key={item.status} href={`/admin/sponsors?payment=${item.status}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-400">({totalSponsors > 0 ? Math.round((item.count / totalSponsors) * 100) : 0}%)</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Delivery progress */}
        <a href="/admin/benefits" className="card p-6 block hover:shadow-md transition-shadow hover:border-brand-200 border border-transparent">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Isporuka benefita</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ea580c" strokeWidth="3" strokeDasharray={`${completionRate} 100`} strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-display text-gray-900">{completionRate}%</span>
                <span className="text-xs text-gray-500">završeno</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-emerald-600">{completedBenefits}</span> od{" "}
                <span className="font-semibold">{totalBenefits}</span> benefita
              </p>
              {overdueBenefits > 0 && <p className="text-xs text-red-600 mt-1">⚠ {overdueBenefits} kasni</p>}
            </div>
          </div>
        </a>
      </div>

      {/* Recent sponsors */}
      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Nedavno dodani sponzori</h3>
          <a href="/admin/sponsors" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Vidi sve →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Tvrtka</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Paket</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Kontakt</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Plaćanje</th>
              </tr>
            </thead>
            <tbody>
              {recentSponsors.map((sponsor) => (
                <tr key={sponsor.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <a href={`/admin/sponsors/${sponsor.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                      {sponsor.name}
                    </a>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`badge ${packageBadgeColor(sponsor.package_type)} text-white border-0 text-xs`}>
                      {sponsor.package_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">{sponsor.contact_name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge ${paymentStatusColor(sponsor.payment_status)}`}>
                      {sponsor.payment_status === "paid" ? "Plaćeno" : sponsor.payment_status === "pending" ? "Na čekanju" : "Kasni"}
                    </span>
                  </td>
                </tr>
              ))}
              {recentSponsors.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Nema sponzora u bazi
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
