"use client";

import { useTransition } from "react";
import { ShieldAlert, LogOut, Loader2 } from "lucide-react";
import { stopImpersonation } from "@/app/actions/impersonate";

interface Props {
  sponsorName: string;
  adminEmail: string;
}

export default function ImpersonationBanner({ sponsorName, adminEmail }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleExit() {
    startTransition(async () => {
      const result = await stopImpersonation();
      window.location.href = result.redirect;
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-amber-400 border-t border-amber-500 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="max-w-[1200px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-amber-950 min-w-0">
          <ShieldAlert size={16} className="shrink-0" />
          <span className="truncate">
            <strong>Admin testni način</strong> — portal gledate kao{" "}
            <strong>{sponsorName}</strong>. Vaša admin prijava ({adminEmail}) čeka izlaz.
          </span>
        </p>
        <button
          onClick={handleExit}
          disabled={isPending}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-950 text-amber-50 text-sm font-medium rounded-lg hover:bg-amber-900 transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          {isPending ? "Izlazim..." : "Izađi"}
        </button>
      </div>
    </div>
  );
}
