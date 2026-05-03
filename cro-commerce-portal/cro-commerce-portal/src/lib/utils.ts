import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PackageType, PaymentStatus, BenefitStatus, LeadStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function packageColor(pkg: PackageType): string {
  const colors: Record<PackageType, string> = {
    Glavni: "text-purple-700 bg-purple-100 border-purple-200",
    Zlatni: "text-yellow-700 bg-yellow-100 border-yellow-200",
    Srebrni: "text-slate-700 bg-slate-100 border-slate-200",
    "Brončani": "text-orange-700 bg-orange-100 border-orange-200",
    Medijski: "text-blue-700 bg-blue-100 border-blue-200",
    Community: "text-teal-700 bg-teal-100 border-teal-200",
  };
  return colors[pkg] ?? "text-gray-700 bg-gray-100";
}

export function packageBadgeColor(pkg: PackageType): string {
  const colors: Record<PackageType, string> = {
    Glavni: "bg-purple-600",
    Zlatni: "bg-yellow-500",
    Srebrni: "bg-slate-400",
    "Brončani": "bg-orange-600",
    Medijski: "bg-blue-500",
    Community: "bg-teal-500",
  };
  return colors[pkg] ?? "bg-gray-400";
}

export function paymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    paid: "Plaćeno",
    pending: "Na čekanju",
    overdue: "Kasni",
  };
  return labels[status];
}

export function paymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    paid: "text-emerald-700 bg-emerald-100",
    pending: "text-yellow-700 bg-yellow-100",
    overdue: "text-red-700 bg-red-100",
  };
  return colors[status];
}

export function benefitStatusLabel(status: BenefitStatus): string {
  const labels: Record<BenefitStatus, string> = {
    not_started: "Nije početo",
    in_progress: "U tijeku",
    completed: "Završeno",
    overdue: "Kasni",
  };
  return labels[status];
}

export function benefitStatusColor(status: BenefitStatus): string {
  const colors: Record<BenefitStatus, string> = {
    not_started: "text-gray-600 bg-gray-100",
    in_progress: "text-blue-700 bg-blue-100",
    completed: "text-emerald-700 bg-emerald-100",
    overdue: "text-red-700 bg-red-100",
  };
  return colors[status];
}

export function leadStatusLabel(status: LeadStatus): string {
  const labels: Record<LeadStatus, string> = {
    cold_lead:            "Cold Lead",
    hot_lead:             "Hot Lead",
    confirmed_new:        "Potvrđeno Novi",
    confirmed_returning:  "Potvrđeno Stari",
  };
  return labels[status];
}

export function leadStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    cold_lead:            "text-blue-600 bg-blue-50 border-blue-200",
    hot_lead:             "text-red-700 bg-red-50 border-red-200",
    confirmed_new:        "text-emerald-700 bg-emerald-50 border-emerald-200",
    confirmed_returning:  "text-purple-700 bg-purple-50 border-purple-200",
  };
  return colors[status];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function daysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const PACKAGE_BENEFITS: Record<PackageType, string[]> = {
  Glavni: [
    "Govor na glavnoj pozornici",
    "Podcast pozornica",
    "VIP štand (premium lokacija)",
    "Naslovnica konferencijskog magazina",
    "3 stranice oglasa u magazinu",
    "10 kotizacija",
  ],
  Zlatni: [
    "Govor ili panel diskusija",
    "Veliki izložbeni štand",
    "Oglas u konferencijskom magazinu",
    "8 kotizacija",
  ],
  Srebrni: [
    "Workshop predavanje",
    "Veliki izložbeni štand",
    "Branding u goodie bag-u",
    "Oglas u magazinu (manja veličina)",
    "5 kotizacija",
  ],
  "Brončani": [
    "Mali izložbeni štand",
    "Branding u goodie bag-u",
    "3 kotizacije",
  ],
  Medijski: [],
  Community: [],
};
