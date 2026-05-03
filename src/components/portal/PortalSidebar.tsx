"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gift, LogOut, Building2, Menu, X, ArrowLeftRight, CalendarDays } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { packageColor } from "@/lib/utils";
import { PROJECTS } from "@/lib/supabase/projects";
import { switchPortalProject } from "@/app/actions/switchProject";
import type { PackageType } from "@/types";
import type { ProjectId } from "@/lib/supabase/projects";

interface Props {
  sponsor: { id: string; name: string; package_type: string };
  userEmail: string;
  activeProjectId: ProjectId;
  otherProjectId?: ProjectId;
}

const navItems = [
  { href: "/portal/sponsor",  label: "Partner",  icon: Building2 },
  { href: "/portal/benefits", label: "Benefiti", icon: Gift },
  { href: "/portal/program",  label: "Program",  icon: CalendarDays },
];

export default function PortalSidebar({ sponsor, userEmail, activeProjectId, otherProjectId }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [switching, setSwitching] = useState(false);
  const supabase = createClient();

  const activeLabel = PROJECTS[activeProjectId].label;
  const otherLabel = otherProjectId ? PROJECTS[otherProjectId].label : null;

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleSwitch() {
    if (!otherProjectId) return;
    setSwitching(true);
    const ok = await switchPortalProject(otherProjectId);
    if (ok) {
      window.location.href = "/portal/benefits";
    } else {
      setSwitching(false);
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo + project + sponsor */}
      <div className="p-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">CRO Commerce</p>
        <p className="text-xs text-brand-600 font-medium mb-3">{activeLabel}</p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={15} className="text-brand-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{sponsor.name}</p>
            <span className={`badge text-xs ${packageColor(sponsor.package_type as PackageType)}`}>
              {sponsor.package_type}
            </span>
          </div>
        </div>

        {/* Project switcher */}
        {otherProjectId && otherLabel && (
          <button
            onClick={handleSwitch}
            disabled={switching}
            className="mt-3 w-full flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors bg-gray-50 hover:bg-brand-50 rounded-lg px-2.5 py-1.5"
          >
            <ArrowLeftRight size={12} />
            {switching ? "Prebacivanje..." : `Prebaci na ${otherLabel}`}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={16} className={active ? "text-brand-600" : "text-gray-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 truncate mb-2">{userEmail}</p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={14} />
          {signingOut ? "Odjava..." : "Odjava"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-40">
        <button onClick={() => setMobileOpen(true)} className="p-1 text-gray-600">
          <Menu size={20} />
        </button>
        <span className="ml-3 font-semibold text-gray-900 text-sm">{sponsor.name}</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-400">
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
