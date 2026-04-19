"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, KanbanSquare, Calendar, Gift,
  LogOut, ChevronRight, Building2, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectId } from "@/lib/supabase/projects";
import ProjectSwitcher from "@/components/admin/ProjectSwitcher";

const navItems = [
  { href: "/admin/dashboard", label: "Nadzorna ploča", icon: LayoutDashboard },
  { href: "/admin/sponsors", label: "Sponzori", icon: Users },
  { href: "/admin/benefits", label: "Benefiti", icon: Gift },
  { href: "/admin/tasks", label: "Zadaci", icon: KanbanSquare },
  { href: "/admin/calendar", label: "Kalendar", icon: Calendar },
  { href: "/admin/settings", label: "Postavke", icon: Settings },
];

interface Props {
  userEmail: string;
  activeProject: ProjectId;
  conferenceDate: string;
  conferenceDates: Record<ProjectId, string>;
}

export default function AdminSidebar({ userEmail, activeProject, conferenceDate, conferenceDates }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const firstName = userEmail.split("@")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const rawDays = Math.ceil(
    (new Date(conferenceDate).getTime() - Date.now()) / 86400000
  );
  const isPast = rawDays < 0;
  const daysDisplay = Math.abs(rawDays);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-gray-900 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-none">CRO Commerce</p>
            <p className="text-gray-500 text-xs mt-0.5">Admin portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon size={17} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Project switcher + days countdown */}
      <div className="px-4 pb-2 space-y-2">
        <ProjectSwitcher activeProject={activeProject} conferenceDates={conferenceDates} />
        <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
          <p className="text-gray-500 text-xs">
            {isPast ? "Dana od konferencije" : "Dana do konferencije"}
          </p>
          <p className={`text-sm font-bold ${isPast ? "text-gray-500" : "text-brand-400"}`}>
            {isPast ? `-${daysDisplay}` : daysDisplay}
          </p>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">{displayName[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{displayName}</p>
            <p className="text-gray-500 text-xs truncate">Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Odjava"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
