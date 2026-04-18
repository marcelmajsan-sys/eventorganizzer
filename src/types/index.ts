export type PackageType = "Glavni" | "Zlatni" | "Srebrni" | "Brončani";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type BenefitStatus = "not_started" | "in_progress" | "completed" | "overdue";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Sponsor {
  id: string;
  name: string;
  package_type: PackageType;
  contact_email: string;
  contact_name: string;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
}

export interface Package {
  id: string;
  name: PackageType;
  benefits: Record<string, unknown>;
  price: number;
}

export interface SponsorBenefit {
  id: string;
  sponsor_id: string;
  benefit_name: string;
  deadline: string;
  status: BenefitStatus;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  sponsor_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  sponsor?: Sponsor;
}

export interface FileRecord {
  id: string;
  sponsor_id: string;
  benefit_id: string | null;
  filename: string;
  storage_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

export interface Notification {
  id: string;
  sponsor_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  totalSponsors: number;
  paidCount: number;
  pendingCount: number;
  overduePayments: number;
  openTasks: number;
  overdueBenefits: number;
  completedBenefits: number;
  byPackage: Record<PackageType, number>;
}
