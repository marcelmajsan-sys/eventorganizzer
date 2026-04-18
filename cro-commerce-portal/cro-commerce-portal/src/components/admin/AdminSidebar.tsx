"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, KanbanSquare, Calendar,
  LogOut, ChevronRight, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Nadzorna ploča", icon: LayoutDashboard },
  { href: "/admin/sponsors", label: "Sponzori", icon: Users },
  { href: "/admin/tasks", label: "Zadaci", icon: KanbanSquare },
  { href: "/admin/calendar", label: "Kalendar", icon: Calendar },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const firstName = userEmail.split("@")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

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

      {/* Conference info */}
      <div className="px-4 pb-2">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Konferencija</p>
          <p className="text-white text-sm font-semibold mt-0.5">CRO Commerce 2025</p>
          <div className="mt-2 bg-gray-700 rounded-full h-1.5">
            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: "42%" }} />
          </div>
          <p className="text-gray-500 text-xs mt-1">42% do konferencije</p>
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
