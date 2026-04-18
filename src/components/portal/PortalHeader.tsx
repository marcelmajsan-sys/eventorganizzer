"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Building2, LogOut } from "lucide-react";
import { packageColor } from "@/lib/utils";
import type { Sponsor, PackageType } from "@/types";

export default function PortalHeader({
  sponsor,
  userEmail,
}: {
  sponsor: Sponsor | null;
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Building2 size={15} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-gray-900 text-sm leading-none">CRO Commerce</p>
            <p className="text-gray-400 text-xs">Sponzorski portal 2025</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sponsor && (
            <span className={`badge ${packageColor(sponsor.package_type as PackageType)} hidden sm:inline-flex`}>
              {sponsor.package_type}
            </span>
          )}
          <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="btn-secondary py-1.5 text-xs"
          >
            <LogOut size={13} />
            Odjava
          </button>
        </div>
      </div>
    </header>
  );
}
