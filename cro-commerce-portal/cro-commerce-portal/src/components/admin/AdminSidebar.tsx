"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, KanbanSquare, Calendar, Gift,
  LogOut, ChevronRight, Building2, Settings, ListVideo, Receipt,
  Menu, X, Mail, Zap, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectId } from "@/lib/supabase/projects";
import ProjectSwitcher from "@/components/admin/ProjectSwitcher";

const navItems = [
  { href: "/admin/dashboard",       label: "Nadzorna ploča", icon: LayoutDashboard },
  { href: "/admin/sponsors",        label: "Sponzori",        icon: Users },
  { href: "/admin/benefits",        label: "Benefiti",        icon: Gift },
  { href: "/admin/contacts",        label: "Kontakti",        icon: Phone },
  { href: "/admin/program",         label: "Program",         icon: ListVideo },
  { href: "/admin/troskovi",        label: "Troškovi",        icon: Receipt },
  { href: "/admin/tasks",           label: "Zadaci",          icon: KanbanSquare },
  { href: "/admin/calendar",        label: "Rokovnik",        icon: Calendar },
  { href: "/admin/email-predlosci", label: "Email predlošci", icon: Mail },
  { href: "/admin/automatizacija",  label: "Automatizacija",  icon: Zap },
  { href: "/admin/settings",        label: "Postavke",        icon: Settings },
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
  const [open, setOpen] = useState(false);

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
    <>
      {/* Mobile top bar — only visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Otvori izbornik"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-white" />
          </div>
          <p className="font-display font-bold text-white text-sm">CRO Commerce</p>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        // Mobile: fixed overlay, slide in/out
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col transition-transform duration-300 ease-in-out",
        // Desktop: static in flex flow, no transition
        "md:static md:translate-x-0 md:flex-shrink-0 md:transition-none md:h-full",
        // Mobile open/close
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Zatvori izbornik"
        >
          <X size={20} />
        </button>

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
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
    </>
  );
}
