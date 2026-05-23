"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { benefitStatusLabel, benefitStatusColor } from "@/lib/utils";
import { updateBenefitStatus } from "@/app/actions/benefitActions";
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sync with server value after refresh (per CLAUDE.md pattern)
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  async function handleChange(newStatus: BenefitStatus) {
    setError(null);
    setStatus(newStatus); // optimistic update

    startTransition(async () => {
      const result = await updateBenefitStatus(benefitId, newStatus);
      if (result.error) {
        setError(result.error);
        setStatus(currentStatus); // revert on error
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as BenefitStatus)}
        disabled={isPending}
        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${benefitStatusColor(status)} ${isPending ? "opacity-50" : ""}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{benefitStatusLabel(s)}</option>
        ))}
      </select>
      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-600 whitespace-nowrap z-10 bg-white border border-red-200 rounded px-2 py-1 shadow-sm">
          Greška: {error}
        </p>
      )}
    </div>
  );
}
