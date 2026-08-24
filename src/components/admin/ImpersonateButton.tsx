"use client";

import { useState, useTransition } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { impersonatePartner } from "@/app/actions/impersonate";

interface Props {
  sponsorId: string;
}

export default function ImpersonateButton({ sponsorId }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await impersonatePartner(sponsorId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Full reload — resetira createBrowserClient singleton na novu sesiju.
      window.location.href = result.redirect;
    });
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isPending}
        title="Otvori portal kao ovaj partner"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors border border-gray-200 hover:border-brand-300 disabled:opacity-50"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
        {isPending ? "Prijava..." : "Logiraj se kao partner"}
      </button>

      {error && (
        <p className="absolute right-0 top-full mt-1 w-72 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 shadow-sm z-20">
          {error}
        </p>
      )}
    </div>
  );
}
