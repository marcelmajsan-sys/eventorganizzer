"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Clock, AlertTriangle, XCircle, Gift,
  ChevronDown, LayoutList, Tag, Pencil, Trash2, Loader2, Users, Search, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  packageColor, benefitStatusLabel, benefitStatusColor, formatDate, daysUntil
} from "@/lib/utils";
import type { PackageType, BenefitStatus } from "@/types";
import EditBenefitDialog from "@/components/admin/EditBenefitDialog";
import RenameBenefitDialog from "@/components/admin/RenameBenefitDialog";

type BenefitRow = {
  id: string;
  benefit_name: string;
  deadline: string | null;
  status: string;
  notes?: string | null;
  assigned_to?: string | null;
  sponsors: { id: string; name: string; package_type: string } | null;
};

const PACKAGE_ORDER: PackageType[] = ["Glavni", "Zlatni", "Srebrni", "Brončani"];

const PACKAGE_COLORS: Record<string, string> = {
  Glavni: "border-purple-300 bg-purple-50",
  Zlatni: "border-yellow-300 bg-yellow-50",
  Srebrni: "border-slate-300 bg-slate-50",
  "Brončani": "border-orange-300 bg-orange-50",
};

const PACKAGE_HEADER_COLORS: Record<string, string> = {
  Glavni: "text-purple-800 bg-purple-100 border-purple-200",
  Zlatni: "text-yellow-800 bg-yellow-100 border-yellow-200",
  Srebrni: "text-slate-700 bg-slate-100 border-slate-200",
  "Brončani": "text-orange-800 bg-orange-100 border-orange-200",
};

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-emerald-500" />,
  in_progress: <Clock size={14} className="text-blue-500" />,
  not_started: <XCircle size={14} className="text-gray-400" />,
  overdue: <AlertTriangle size={14} className="text-red-500" />,
};

function SponsorRow({ benefit }: { benefit: BenefitRow }) {
  const [editing, setEditing] = useState(false);
  const days = benefit.deadline ? daysUntil(benefit.deadline) : null;
  const isOverdue = days !== null && days < 0 && benefit.status !== "completed";
  const isUrgent = days !== null && days >= 0 && days <= 7 && benefit.status !== "completed";

  return (
    <>
      <EditBenefitDialog
        benefit={editing ? { ...benefit, sponsor_name: benefit.sponsors?.name ?? undefined } : null}
        onClose={() => setEditing(false)}
      />
      <div
        onClick={() => setEditing(true)}
        className={`group flex items-center gap-4 px-5 py-3 text-sm cursor-pointer transition-colors ${
          isOverdue
            ? "bg-red-50 hover:bg-red-100"
            : isUrgent
            ? "bg-orange-50 hover:bg-orange-100"
            : "hover:bg-gray-50"
        }`}
      >
        <span className="flex-shrink-0">{statusIcon[benefit.status]}</span>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link
            href={`/admin/sponsors/${benefit.sponsors?.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-gray-900 hover:text-brand-600 truncate"
          >
            {benefit.sponsors?.name}
          </Link>
          <span className={`badge text-xs flex-shrink-0 ${packageColor(benefit.sponsors?.package_type as PackageType)}`}>
            {benefit.sponsors?.package_type}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-400 text-xs">
            {benefit.deadline ? formatDate(benefit.deadline) : "Bez roka"}
          </span>
          {isOverdue && days !== null && (
            <span className="text-xs text-red-600 font-medium">Kasni {Math.abs(days)}d</span>
          )}
          {isUrgent && days !== null && (
            <span className="text-xs text-orange-600 font-medium">Za {days}d</span>
          )}
        </div>

        <span className={`badge text-xs flex-shrink-0 ${benefitStatusColor(benefit.status as BenefitStatus)}`}>
          {benefitStatusLabel(benefit.status as BenefitStatus)}
        </span>

        <Pencil size={13} className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </>
  );
}

function AccordionGroup({ name, rows }: { name: string; rows: BenefitRow[] }) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const doneCount = rows.filter((r) => r.status === "completed").length;
  const overdueCount = rows.filter(
    (r) => r.status === "overdue" || (r.deadline !== null && daysUntil(r.deadline) < 0 && r.status !== "completed")
  ).length;

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("sponsor_benefits").delete().eq("benefit_name", name);
    setDeleting(false);
    setConfirming(false);
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <RenameBenefitDialog
        currentName={renaming ? name : null}
        onClose={() => setRenaming(false)}
      />
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
        <button
          onClick={() => setRenaming(true)}
          className="group flex items-center gap-2.5 text-left hover:text-brand-700 transition-colors"
          title="Klikni za preimenovanje"
        >
          <Gift size={14} className="text-brand-500 flex-shrink-0" />
          <span className="font-semibold text-gray-900 text-sm group-hover:text-brand-700">{name}</span>
          <Pencil size={12} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
        </button>
        <div className="flex items-center gap-3 flex-shrink-0">
          {overdueCount > 0 && (
            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertTriangle size={12} /> {overdueCount} kasni
            </span>
          )}
          <span className="text-xs text-gray-500">{rows.length} sponzora</span>
          <span className="text-xs text-gray-400">{doneCount}/{rows.length} završeno</span>
          {confirming ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-red-600 font-medium">Obriši svugdje?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                {deleting ? <Loader2 size={11} className="animate-spin" /> : "Da"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
              >
                Ne
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Obriši benefit svugdje"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="divide-y divide-gray-50 border-t border-gray-100">
          {rows.map((b) => <SponsorRow key={b.id} benefit={b} />)}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs text-gray-500 hover:text-brand-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
      >
        {open
          ? <><ChevronDown size={13} className="rotate-180" /> Sakrij sponzore</>
          : <><ChevronDown size={13} /> Prikaži sve ({rows.length})</>
        }
      </button>
    </div>
  );
}

function CategoryBenefitGroup({ name, rows }: { name: string; rows: BenefitRow[] }) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const doneCount = rows.filter((r) => r.status === "completed").length;
  const donePct = Math.round((doneCount / rows.length) * 100);
  const overdueCount = rows.filter(
    (r) => r.status === "overdue" || (r.deadline !== null && daysUntil(r.deadline) < 0 && r.status !== "completed")
  ).length;

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("sponsor_benefits").delete().eq("benefit_name", name);
    setDeleting(false);
    setConfirming(false);
    router.refresh();
  }

  return (
    <div className="bg-white/70">
      <RenameBenefitDialog
        currentName={renaming ? name : null}
        onClose={() => setRenaming(false)}
      />
      <div className="flex items-center gap-2 px-5 py-2.5 bg-white/40">
        <button
          onClick={() => setRenaming(true)}
          className="group flex items-center gap-1.5 flex-1 min-w-0 text-left"
          title="Klikni za preimenovanje"
        >
          <Gift size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 transition-colors truncate">{name}</span>
          <Pencil size={11} className="text-gray-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
        </button>
        {overdueCount > 0 && (
          <span className="text-xs text-red-600 font-medium flex items-center gap-1">
            <AlertTriangle size={11} /> {overdueCount} kasni
          </span>
        )}
        <span className="text-xs text-gray-400">{donePct}%</span>
        {confirming ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-red-600 font-medium">Obriši svugdje?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              {deleting ? <Loader2 size={11} className="animate-spin" /> : "Da"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              Ne
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
            title="Obriši benefit svugdje"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="divide-y divide-gray-50">
          {rows.map((b) => <SponsorRow key={b.id} benefit={b} />)}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 px-5 py-2 text-xs text-gray-500 hover:text-brand-600 hover:bg-white/60 transition-colors border-t border-white/60"
      >
        {open
          ? <><ChevronDown size={13} className="rotate-180" /> Sakrij sponzore</>
          : <><ChevronDown size={13} /> Prikaži sve ({rows.length})</>
        }
      </button>
    </div>
  );
}

function BenefitItemRow({ benefit }: { benefit: BenefitRow }) {
  const [editing, setEditing] = useState(false);
  const days = benefit.deadline ? daysUntil(benefit.deadline) : null;
  const isOverdue = days !== null && days < 0 && benefit.status !== "completed";
  const isUrgent = days !== null && days >= 0 && days <= 7 && benefit.status !== "completed";

  return (
    <>
      <EditBenefitDialog
        benefit={editing ? { ...benefit, sponsor_name: benefit.sponsors?.name ?? undefined } : null}
        onClose={() => setEditing(false)}
      />
      <div
        onClick={() => setEditing(true)}
        className={`group flex items-center gap-4 px-5 py-3 text-sm cursor-pointer transition-colors ${
          isOverdue ? "bg-red-50 hover:bg-red-100" : isUrgent ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-gray-50"
        }`}
      >
        <span className="flex-shrink-0">{statusIcon[benefit.status]}</span>

        <span className="flex-1 font-medium text-gray-900 truncate">{benefit.benefit_name}</span>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-400 text-xs">
            {benefit.deadline ? formatDate(benefit.deadline) : "Bez roka"}
          </span>
          {isOverdue && days !== null && (
            <span className="text-xs text-red-600 font-medium">Kasni {Math.abs(days)}d</span>
          )}
          {isUrgent && days !== null && (
            <span className="text-xs text-orange-600 font-medium">Za {days}d</span>
          )}
        </div>

        <span className={`badge text-xs flex-shrink-0 ${benefitStatusColor(benefit.status as BenefitStatus)}`}>
          {benefitStatusLabel(benefit.status as BenefitStatus)}
        </span>

        <Pencil size={13} className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </>
  );
}

function SponsorGroup({ sponsorId, sponsorName, packageType, rows }: {
  sponsorId: string;
  sponsorName: string;
  packageType: string;
  rows: BenefitRow[];
}) {
  const [open, setOpen] = useState(false);
  const doneCount = rows.filter((r) => r.status === "completed").length;
  const overdueCount = rows.filter(
    (r) => r.status === "overdue" || (r.deadline !== null && daysUntil(r.deadline) < 0 && r.status !== "completed")
  ).length;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
        <div className="flex items-center gap-2.5">
          <Link
            href={`/admin/sponsors/${sponsorId}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-gray-900 text-sm hover:text-brand-600 transition-colors"
          >
            {sponsorName}
          </Link>
          <span className={`badge text-xs flex-shrink-0 ${packageColor(packageType as PackageType)}`}>
            {packageType}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {overdueCount > 0 && (
            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertTriangle size={12} /> {overdueCount} kasni
            </span>
          )}
          <span className="text-xs text-gray-400">{doneCount}/{rows.length} završeno</span>
        </div>
      </div>

      {open && (
        <div className="divide-y divide-gray-50 border-t border-gray-100">
          {rows.map((b) => <BenefitItemRow key={b.id} benefit={b} />)}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs text-gray-500 hover:text-brand-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
      >
        {open
          ? <><ChevronDown size={13} className="rotate-180" /> Sakrij benefite</>
          : <><ChevronDown size={13} /> Prikaži sve ({rows.length})</>
        }
      </button>
    </div>
  );
}

interface Props {
  benefits: BenefitRow[];
}

export default function BenefitsView({ benefits }: Props) {
  const [view, setView] = useState<"benefit" | "category" | "sponsor">("benefit");
  const [query, setQuery] = useState("");

  const filtered = query
    ? benefits.filter(
        (b) =>
          b.benefit_name.toLowerCase().includes(query.toLowerCase()) ||
          b.sponsors?.name.toLowerCase().includes(query.toLowerCase())
      )
    : benefits;

  const groupedByBenefit: Record<string, BenefitRow[]> = {};
  filtered.forEach((b) => {
    if (!groupedByBenefit[b.benefit_name]) groupedByBenefit[b.benefit_name] = [];
    groupedByBenefit[b.benefit_name]!.push(b);
  });
  const benefitNames = Object.keys(groupedByBenefit).sort();

  const groupedByPackage: Record<string, BenefitRow[]> = {};
  filtered.forEach((b) => {
    const pkg = b.sponsors?.package_type ?? "Ostalo";
    if (!groupedByPackage[pkg]) groupedByPackage[pkg] = [];
    groupedByPackage[pkg]!.push(b);
  });

  // Group by sponsor, preserving sponsor metadata
  const groupedBySponsor: Record<string, { id: string; name: string; packageType: string; rows: BenefitRow[] }> = {};
  filtered.forEach((b) => {
    if (!b.sponsors) return;
    const key = b.sponsors.id;
    if (!groupedBySponsor[key]) {
      groupedBySponsor[key] = { id: b.sponsors.id, name: b.sponsors.name, packageType: b.sponsors.package_type, rows: [] };
    }
    groupedBySponsor[key]!.rows.push(b);
  });
  const sponsorGroups = Object.values(groupedBySponsor).sort((a, b) => a.name.localeCompare(b.name));

  const tabs = [
    { key: "benefit", label: "Po benefitu", icon: <LayoutList size={15} /> },
    { key: "category", label: "Po kategoriji", icon: <Tag size={15} /> },
    { key: "sponsor", label: "Po sponzoru", icon: <Users size={15} /> },
  ] as const;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === tab.key
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži benefite..."
            className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-56"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {view === "benefit" && (
        <div className="space-y-3">
          {benefitNames.map((name) => (
            <AccordionGroup key={name} name={name} rows={groupedByBenefit[name]!} />
          ))}
          {benefitNames.length === 0 && (
            <div className="card p-12 text-center text-gray-400 text-sm">
              Nema benefita za prikaz
            </div>
          )}
        </div>
      )}

      {view === "category" && (
        <div className="space-y-6">
          {PACKAGE_ORDER.filter((pkg) => groupedByPackage[pkg]?.length).map((pkg) => {
            const rows = groupedByPackage[pkg]!;
            const byBenefit: Record<string, BenefitRow[]> = {};
            rows.forEach((b) => {
              if (!byBenefit[b.benefit_name]) byBenefit[b.benefit_name] = [];
              byBenefit[b.benefit_name]!.push(b);
            });
            const names = Object.keys(byBenefit).sort();
            const doneCount = rows.filter((r) => r.status === "completed").length;

            return (
              <div key={pkg} className={`rounded-xl border-2 overflow-hidden ${PACKAGE_COLORS[pkg]}`}>
                <div className={`flex items-center justify-between px-5 py-3 border-b ${PACKAGE_HEADER_COLORS[pkg]}`}>
                  <h2 className="font-bold text-base">{pkg} sponzori</h2>
                  <span className="text-xs font-medium opacity-70">{doneCount}/{rows.length} završeno</span>
                </div>
                <div className="divide-y divide-white/60">
                  {names.map((benefitName) => (
                    <CategoryBenefitGroup
                      key={benefitName}
                      name={benefitName}
                      rows={byBenefit[benefitName]!}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {PACKAGE_ORDER.every((pkg) => !groupedByPackage[pkg]?.length) && (
            <div className="card p-12 text-center text-gray-400 text-sm">
              Nema benefita za prikaz
            </div>
          )}
        </div>
      )}

      {view === "sponsor" && (
        <div className="space-y-3">
          {sponsorGroups.map((s) => (
            <SponsorGroup
              key={s.id}
              sponsorId={s.id}
              sponsorName={s.name}
              packageType={s.packageType}
              rows={s.rows}
            />
          ))}
          {sponsorGroups.length === 0 && (
            <div className="card p-12 text-center text-gray-400 text-sm">
              Nema sponzora s benefitima
            </div>
          )}
        </div>
      )}
    </>
  );
}
