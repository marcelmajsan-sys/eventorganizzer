"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Building2, SquareCheckBig, UserPlus, Ticket, LayoutList, MessageSquare, CalendarClock } from "lucide-react";
import { MarkAllReadButton, MarkReadButton, MarkUnreadButton, DeleteNotificationButton, DeleteAllNotificationsButton } from "@/components/admin/InboxActions";

type NotifType = "task" | "contact" | "ticket" | "followup";
type Tab = NotifType | "comments" | "all";

interface SponsorComment {
  id: string;
  sponsor_id: string;
  comment: string;
  admin_email: string;
  created_at: string;
  sponsor: { id: string; name: string } | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  task_id: string | null;
  sponsor: { id: string; name: string } | null;
  notifType: NotifType;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "upravo";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "jučer";
  if (days < 7) return `${days} d`;
  return new Date(dateStr).toLocaleDateString("hr-HR", { day: "numeric", month: "numeric" });
}

const TYPE_META: Record<NotifType, {
  label: string;
  Icon: any;
  iconColor: string;
  iconBg: string;
  border: string;
  badge: string;
}> = {
  task: {
    label: "Novi zadatak",
    Icon: SquareCheckBig,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  contact: {
    label: "Novi kontakt",
    Icon: UserPlus,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    border: "border-l-green-500",
    badge: "bg-green-100 text-green-700",
  },
  ticket: {
    label: "Nova osoba za ulaznice",
    Icon: Ticket,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    border: "border-l-purple-500",
    badge: "bg-purple-100 text-purple-700",
  },
  followup: {
    label: "Follow up podsjetnik",
    Icon: CalendarClock,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    border: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
};

const TABS: { id: Tab; label: string; Icon: any }[] = [
  { id: "task",     label: "Novi zadatak",           Icon: SquareCheckBig },
  { id: "contact",  label: "Novi kontakt",            Icon: UserPlus },
  { id: "ticket",   label: "Nova osoba za ulaznice",  Icon: Ticket },
  { id: "comments", label: "Novi komentar",           Icon: MessageSquare },
  { id: "followup", label: "Follow up podsjetnici",   Icon: CalendarClock },
  { id: "all",      label: "Sve obavijesti",          Icon: LayoutList },
];

const ADMIN_DELETE_EMAIL = "marcel@ecommerce.hr";

function NotifCard({ n, canDelete }: { n: Notification; canDelete: boolean }) {
  const meta = TYPE_META[n.notifType];
  const { Icon, iconColor, iconBg, border } = meta;

  return (
    <div
      className={`card p-4 flex items-start gap-4 ${
        n.read ? "opacity-60 hover:opacity-100 transition-opacity" : `border-l-4 ${border}`
      }`}
    >
      <div className={`w-8 h-8 ${n.read ? "bg-gray-100" : iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={14} className={n.read ? "text-gray-400" : iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${n.read ? "font-medium text-gray-700" : "font-semibold text-gray-900"}`}>
            {n.title}
          </p>
          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
        </div>
        <p className={`text-sm mt-0.5 ${n.read ? "text-gray-500" : "text-gray-600"}`}>{n.message}</p>
        {n.sponsor && (
          <Link
            href={`/admin/sponsors/${n.sponsor.id}`}
            className={`flex items-center gap-1 text-xs mt-1.5 hover:underline ${n.read ? "text-gray-400 hover:text-brand-600" : "text-brand-600"}`}
          >
            <Building2 size={11} />
            {n.sponsor.name}
          </Link>
        )}
        {n.task_id && (
          <Link
            href={`/admin/tasks/${n.task_id}`}
            className={`flex items-center gap-1 text-xs mt-1.5 hover:underline ${n.read ? "text-gray-400 hover:text-brand-600" : "text-brand-600"}`}
          >
            <SquareCheckBig size={11} />
            Otvori zadatak
          </Link>
        )}
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {n.read ? <MarkUnreadButton id={n.id} /> : <MarkReadButton id={n.id} />}
        {canDelete && <DeleteNotificationButton id={n.id} />}
      </div>
    </div>
  );
}

function CommentCard({ c }: { c: SponsorComment }) {
  return (
    <div className="card p-4 flex items-start gap-4 border-l-4 border-l-orange-400">
      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <MessageSquare size={14} className="text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">Novi komentar</p>
          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.created_at)}</span>
        </div>
        <p className="text-sm mt-0.5 text-gray-600 whitespace-pre-wrap">{c.comment}</p>
        <p className="text-xs text-gray-400 mt-1">{c.admin_email.split("@")[0]}</p>
        {c.sponsor && (
          <Link
            href={`/admin/sponsors/${c.sponsor.id}`}
            className="flex items-center gap-1 text-xs mt-1 text-brand-600 hover:underline"
          >
            <Building2 size={11} />
            {c.sponsor.name}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function InboxView({ notifications, comments, userEmail }: {
  notifications: Notification[];
  comments: SponsorComment[];
  userEmail: string | null;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const canDelete = userEmail === ADMIN_DELETE_EMAIL;

  const unread = notifications.filter((n) => !n.read);

  function sortedFor(items: Notification[]) {
    return [...items.filter((n) => !n.read), ...items.filter((n) => n.read)];
  }

  const isCommentsTab = activeTab === "comments";

  const visibleNotifs = sortedFor(
    activeTab === "all"
      ? notifications
      : activeTab === "comments"
      ? []
      : notifications.filter((n) => n.notifType === activeTab)
  );

  function badgeCount(tab: Tab) {
    if (tab === "comments") return comments.length;
    if (tab === "all") return unread.length;
    return unread.filter((n) => n.notifType === tab).length;
  }

  return (
    <div className="animate-enter">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Inbox</h1>
          <p className="page-subtitle">
            {unread.length > 0
              ? `${unread.length} nepročitan${unread.length === 1 ? "a obavijest" : unread.length < 5 ? "e obavijesti" : "ih obavijesti"}`
              : "Sve obavijesti su pročitane"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MarkAllReadButton disabled={unread.length === 0} />
          {canDelete && <DeleteAllNotificationsButton total={notifications.length} />}
        </div>
      </div>

      {/* Tabovi */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => {
          const count = badgeCount(id);
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-1 justify-center ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={13} />
              {label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-brand-100 text-brand-700" : "bg-gray-200 text-gray-600"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sadržaj */}
      {isCommentsTab ? (
        comments.length === 0 ? (
          <div className="card p-16 text-center">
            <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nema komentara</p>
          </div>
        ) : (
          <div className="space-y-2">
            {comments.map((c) => <CommentCard key={c.id} c={c} />)}
          </div>
        )
      ) : visibleNotifs.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nema obavijesti u ovoj kategoriji</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleNotifs.map((n) => (
            <NotifCard key={n.id} n={n} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
