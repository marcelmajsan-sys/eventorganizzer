import { createClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { cookies } from "next/headers";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import {
  Users, CreditCard, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, Package, Wallet, CircleDollarSign, ListChecks, LogIn
} from "lucide-react";
import { packageColor, packageBadgeColor, paymentStatusColor, paymentStatusLabel, leadStatusColor, leadStatusLabel } from "@/lib/utils";
import type { PackageType, LeadStatus } from "@/types";

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
  const budgetPending = budgetItems.filter(i => i.status === "pending" || i.status === "paid").reduce((s: number, i: any) => s + i.amount, 0);
  const budgetPendingCount = budgetItems.filter(i => i.status === "pending" || i.status === "paid").length;
  const budgetTotal   = budgetItems.filter(i => i.status !== "cancelled").reduce((s: number, i: any) => s + i.amount, 0);
  const budgetAll     = budgetItems.reduce((s: number, i: any) => s + (i.amount ?? 0), 0);
  const budgetAllCount = budgetItems.length;

  const totalSponsors = sponsors?.length ?? 0;
  const confirmedSponsors = sponsors?.filter(
    (s) => s.lead_status === "confirmed_new" || s.lead_status === "confirmed_returning"
  ) ?? [];

  // Naplaćeno = plaćeni iznos + djelomično plaćeni iznosi (iznosi iz SVIH sponzora)
  const naplaceno = (sponsors ?? []).reduce((sum, s) => {
    if (s.payment_status === "paid") return sum + ((s as any).iznos ?? 0);
    if (s.payment_status === "partial") return sum + ((s as any).partial_amount ?? 0);
    return sum;
  }, 0);
  // Brojevi ispod iznosa — samo aktivni klijenti (potvrđeno novi/stari)
  const naplacenoCount = confirmedSponsors.filter(s => s.payment_status === "paid").length;
  const partialCount = confirmedSponsors.filter(s => s.payment_status === "partial").length;
  // Neplaćeno = neplaćeni iznosi + preostali dio djelomičnih (iznosi iz SVIH sponzora)
  const neplaceno = (sponsors ?? []).reduce((sum, s) => {
    if (s.payment_status === "paid") return sum;
    if (s.payment_status === "partial") return sum + Math.max(0, ((s as any).iznos ?? 0) - ((s as any).partial_amount ?? 0));
    return sum + ((s as any).iznos ?? 0);
  }, 0);
  const neplacenoCount = confirmedSponsors.filter(s => s.payment_status !== "paid").length;
  const confirmedTotal = confirmedSponsors.length;
  const confirmedNewCount = confirmedSponsors.filter(s => s.lead_status === "confirmed_new").length;
  const confirmedReturningCount = confirmedSponsors.filter(s => s.lead_status === "confirmed_returning").length;

  const paidCount = confirmedSponsors.filter((s) => s.payment_status === "paid").length;
  const pendingCount = confirmedSponsors.filter((s) => s.payment_status === "pending").length;
  const overduePayments = confirmedSponsors.filter((s) => s.payment_status === "overdue").length;
  const compensationCount = confirmedSponsors.filter((s) => s.payment_status === "compensation").length;
  const openTasks = tasks?.filter((t) => t.status !== "done").length ?? 0;
  const now = new Date().toISOString();
  const overdueBenefits = benefits?.filter(
    (b) => b.status !== "completed" && b.deadline < now
  ).length ?? 0;
  const completedBenefits = benefits?.filter((b) => b.status === "completed").length ?? 0;
  const totalBenefits = benefits?.length ?? 0;
  const completionRate = totalBenefits > 0 ? Math.round((completedBenefits / totalBenefits) * 100) : 0;

  const byPackage: Record<string, number> = {};
  const byPackagePaid: Record<string, number> = {};
  confirmedSponsors.forEach((s) => {
    byPackage[s.package_type] = (byPackage[s.package_type] ?? 0) + 1;
    if (s.payment_status === "paid") {
      byPackagePaid[s.package_type] = (byPackagePaid[s.package_type] ?? 0) + 1;
    }
  });

  const packageOrder: PackageType[] = ["Glavni", "Zlatni", "Srebrni", "Brončani"];

  // Recent sponsors
  const recentSponsors = sponsors?.slice(-5).reverse() ?? [];

  // Recent contacts
  let recentContacts: any[] = [];
  try {
    const { data } = await supabase
      .from("sponsor_contacts")
      .select("id, name, email, type, company, created_at, sponsors(name)")
      .order("created_at", { ascending: false })
      .limit(5);
    recentContacts = data ?? [];
  } catch {}

  // Recent partner logins
  let recentLogins: any[] = [];
  try {
    const adminClient = createAdminClientForProject(projectId);
    const { data, error } = await adminClient
      .from("notifications")
      .select("id, message, created_at, sponsor_id, sponsors(id, name)")
      .eq("title", "Prijava partnera")
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) console.error("[dashboard recentLogins]", error.message);
    recentLogins = (data ?? []).map((n: any) => {
      // Izvuci email iz poruke: "Naziv tvrtke (email@example.com) se prijavio/la..."
      const emailMatch = n.message?.match(/\(([^)]+@[^)]+)\)/);
      const email = emailMatch?.[1] ?? "—";
      const sponsor = Array.isArray(n.sponsors) ? n.sponsors[0] : n.sponsors;
      return { id: n.id, email, sponsorName: sponsor?.name ?? "—", sponsorId: n.sponsor_id, created_at: n.created_at };
    });
  } catch (e: any) {
    console.error("[dashboard recentLogins exception]", e?.message ?? e);
  }

  const statCards = [
    {
      value: totalSponsors,
      label: "Ukupno partnera",
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

      {/* Summary — top */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Profitabilnost", value: formatEur((naplaceno + neplaceno) - budgetAll), sub: `prihodi ${formatEur(naplaceno + neplaceno)} − troškovi ${formatEur(budgetAll)}`, icon: CircleDollarSign, iconCls: "text-gray-400", valCls: (naplaceno + neplaceno) - budgetAll >= 0 ? "text-emerald-600" : "text-red-600", href: "/admin/troskovi" },
          { label: "Plaćeno (troškovi)", value: formatEur(budgetPaid), sub: `${budgetTotal > 0 ? Math.round((budgetPaid/budgetTotal)*100) : 0}% budžeta`, icon: Wallet, iconCls: "text-emerald-500", valCls: "text-emerald-600", href: "/admin/troskovi?status=paid", progress: budgetTotal > 0 ? Math.round((budgetPaid/budgetTotal)*100) : 0, progressCls: "bg-emerald-500" },
          { label: "Ukupni troškovi", value: formatEur(budgetAll), sub: `${budgetAllCount} stavki`, icon: TrendingUp, iconCls: "text-gray-400", valCls: "text-gray-700", href: "/admin/troskovi" },
          { label: "Naplaćeno", value: formatEur(naplaceno), sub: partialCount > 0 ? `${naplacenoCount} plaćenih + ${partialCount} djelomičnih` : `${naplacenoCount} partnera`, icon: Wallet, iconCls: "text-emerald-500", valCls: "text-emerald-600", href: "/admin/sponsors?payment=paid,partial" },
          { label: "Neplaćeno", value: formatEur(neplaceno), sub: `${neplacenoCount} partnera`, icon: ListChecks, iconCls: "text-orange-400", valCls: "text-orange-600", href: "/admin/sponsors?payment=overdue,partial,pending&type=clients" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <a key={c.label} href={c.href} className="card p-4 block hover:shadow-md transition-shadow hover:border-brand-200 border border-transparent">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">{c.label}</p>
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { value: confirmedTotal, label: "Potvrđeni partneri", icon: Users, color: "text-blue-600", bg: "bg-blue-50", sub: `Potvrđeni stari: ${confirmedReturningCount}`, sub2: `Potvrđeni novi: ${confirmedNewCount}`, sub2Cls: "text-gray-400", href: "/admin/sponsors?lead=confirmed_returning,confirmed_new" },
          { value: paidCount, label: "Plaćenih", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", sub: `${pendingCount} na čekanju`, sub2: `${overduePayments} kasni`, href: "/admin/sponsors?payment=paid" },
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
                  {(card as any).sub2 && <p className={`text-xs mt-0.5 ${(card as any).sub2Cls ?? "text-red-400"}`}>{(card as any).sub2}</p>}
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
        {/* Package breakdown — confirmed only */}
        <a href="/admin/sponsors" className="card p-6 block hover:shadow-md transition-shadow hover:border-brand-200 border border-transparent">
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Partneri po paketu</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">samo potvrđeni ({confirmedTotal})</p>
          <div className="space-y-3">
            {packageOrder.map((pkg) => {
              const count = byPackage[pkg] ?? 0;
              const paid = byPackagePaid[pkg] ?? 0;
              const pct = count > 0 ? Math.round((paid / count) * 100) : 0;
              return (
                <div key={pkg}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${packageBadgeColor(pkg as PackageType)}`} />
                      <span className="text-sm font-medium text-gray-700">{pkg}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {paid}/{count} <span className="text-xs text-gray-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </a>

        {/* Payment status — confirmed only */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Status plaćanja</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">samo potvrđeni ({confirmedTotal})</p>
          <div className="space-y-3">
            {[
              { label: "Plaćeno", count: paidCount, status: "paid", color: "bg-emerald-500" },
              { label: "Na čekanju", count: pendingCount, status: "pending", color: "bg-yellow-500" },
              { label: "Kasni", count: overduePayments, status: "overdue", color: "bg-red-500" },
              { label: "Kompenzacija", count: compensationCount, status: "compensation", color: "bg-violet-500" },
            ].map((item) => (
              <a key={item.status} href={`/admin/sponsors?payment=${item.status}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-400">({confirmedTotal > 0 ? Math.round((item.count / confirmedTotal) * 100) : 0}%)</span>
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
          <h3 className="font-semibold text-gray-900">Nedavno uređeni partneri</h3>
          <a href="/admin/sponsors" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Vidi sve →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Tvrtka</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Kategorija</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Iznos</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
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
                    <span className={`badge ${packageColor(sponsor.package_type as PackageType)}`}>
                      {sponsor.package_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`text-sm font-medium ${(sponsor as any).iznos ? "text-gray-900" : "text-gray-300"}`}>
                      {formatEur((sponsor as any).iznos ?? 0)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {sponsor.lead_status ? (
                      <span className={`badge border text-xs ${leadStatusColor(sponsor.lead_status as LeadStatus)}`}>
                        {leadStatusLabel(sponsor.lead_status as LeadStatus)}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">{sponsor.contact_name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge ${paymentStatusColor(sponsor.payment_status)}`}>
                      {paymentStatusLabel(sponsor.payment_status)}
                    </span>
                  </td>
                </tr>
              ))}
              {recentSponsors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Nema partnera u bazi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent partner logins */}
      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <LogIn size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900">Nedavne prijave partnera</h3>
          </div>
          <a href="/admin/inbox" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Inbox →
          </a>
        </div>
        {recentLogins.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Nema zabilježenih prijava</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Partner</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Vrijeme prijave</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((login) => {
                  const dt = new Date(login.created_at);
                  const dateStr = dt.toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" });
                  const timeStr = dt.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <tr key={login.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3">
                        {login.sponsorId ? (
                          <a href={`/admin/sponsors/${login.sponsorId}`} className="font-medium text-gray-900 hover:text-brand-600">
                            {login.sponsorName}
                          </a>
                        ) : (
                          <span className="font-medium text-gray-900">{login.sponsorName}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{login.email}</td>
                      <td className="py-2.5 px-3 text-gray-400 text-xs">
                        {dateStr} · {timeStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent contacts */}
      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Nedavno dodani kontakti</h3>
          <a href="/admin/contacts" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Vidi sve →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Ime</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Firma</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Email</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Tip</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Dodano</th>
              </tr>
            </thead>
            <tbody>
              {recentContacts.map((contact) => {
                const TYPE_LABELS: Record<string, string> = {
                  contact: "Kontakt",
                  ticket: "Ulaznica",
                  partner: "Partner",
                  visitor: "Posjetitelj",
                  speaker: "Govornik",
                  service_provider: "Usluga",
                  brand_ambassador: "Ambasador",
                };
                const sponsorName = contact.sponsors
                  ? (Array.isArray(contact.sponsors) ? contact.sponsors[0]?.name : (contact.sponsors as any)?.name)
                  : null;
                const addedDate = contact.created_at
                  ? new Date(contact.created_at).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "—";
                return (
                  <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <a href={`/admin/contacts/${contact.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                        {contact.name || "—"}
                      </a>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">{contact.company || sponsorName || "—"}</td>
                    <td className="py-2.5 px-3 text-gray-500">{contact.email || "—"}</td>
                    <td className="py-2.5 px-3">
                      <span className="badge bg-gray-100 text-gray-600 text-xs">
                        {TYPE_LABELS[contact.type] ?? contact.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 text-xs">{addedDate}</td>
                  </tr>
                );
              })}
              {recentContacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Nema kontakata u bazi
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
