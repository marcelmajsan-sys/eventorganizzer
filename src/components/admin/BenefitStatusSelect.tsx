"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { benefitStatusLabel, benefitStatusColor } from "@/lib/utils";
import type { BenefitStatus } from "@/types";

const STATUSES: BenefitStatus[] = ["not_started", "in_progress", "completed", "overdue"];

export default function BenefitStatusSelect({
  benefitId,
  currentStatus,
}: {
  benefitId: string;
  currentStatus: BenefitStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(newStatus: BenefitStatus) {
    setLoading(true);
    setStatus(newStatus);
    await supabase.from("sponsor_benefits").update({ status: newStatus }).eq("id", benefitId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as BenefitStatus)}
        disabled={loading}
        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${benefitStatusColor(status)} ${loading ? "opacity-50" : ""}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{benefitStatusLabel(s)}</option>
        ))}
      </select>
    </div>
  );
}
