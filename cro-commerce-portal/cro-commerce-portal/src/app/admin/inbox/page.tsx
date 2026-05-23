import { createAdminClient } from "@/lib/supabase/server";
import { Bell, Building2, SquareCheckBig, UserPlus, Ticket } from "lucide-react";
import Link from "next/link";
import { MarkAllReadButton, MarkReadButton, MarkUnreadButton } from "@/components/admin/InboxActions";

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

type NotifType = "task" | "contact" | "ticket";

function getNotifType(n: any): NotifType {
  if (n.task_id) return "task";
  if (n.title === "Nova osoba za ulaznice") return "ticket";
  return "contact";
}

const GROUPS: {
  type: NotifType;
  label: string;
  Icon: any;
  iconColor: string;
  iconBg: string;
  border: string;
  badge: string;
}[] = [
  {
    type: "task",
    label: "Novi zadatak",
    Icon: SquareCheckBig,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    type: "contact",
    label: "Novi kontakt",
    Icon: UserPlus,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    border: "border-l-green-500",
    badge: "bg-green-100 text-green-700",
  },
  {
    type: "ticket",
    label: "Nova osoba za ulaznice",
    Icon: Ticket,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    border: "border-l-purple-500",
    badge: "bg-purple-100 text-purple-700",
  },
];

export default async function InboxPage() {
  const supabase = await createAdminClient();

  const { data: raw } = await supabase
    .from("notifications")
    .select("id, title, message, read, created_at, sponsor_id, task_id, sponsors(id, name)")
    .order("created_at", { ascending: false });

  const notifications = (raw ?? []).map((n: any) => ({
    ...n,
    sponsor: Array.isArray(n.sponsors) ? n.sponsors[0] : n.sponsors,
    notifType: getNotifType(n),
  }));

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inbox</h1>
          <p className="page-subtitle">
            {unread.length > 0
              ? `${unread.length} nepročitana obavijest${unread.length === 1 ? "" : unread.length < 5 ? "e" : "i"}`
              : "Sve obavijesti su pročitane"}
          </p>
        </div>
        <MarkAllReadButton disabled={unread.length === 0} />
      </div>

      {notifications.length === 0 && (
        <div className="card p-16 text-center">
          <Bell size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nema obavijesti</p>
        </div>
      )}

      <div className="space-y-8">
        {GROUPS.map(({ type, label, Icon, iconColor, iconBg, border, badge }) => {
          const items = notifications.filter((n) => n.notifType === type);
          if (items.length === 0) return null;

          // Nepročitani prvi, onda pročitani
          const sorted = [
            ...items.filter((n) => !n.read),
            ...items.filter((n) => n.read),
          ];
          const unreadCount = items.filter((n) => !n.read).length;

          return (
            <div key={type}>
              {/* Zaglavlje grupe */}
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={iconColor} />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {label}
                </p>
                {unreadCount > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${badge}`}>
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Kartice */}
              <div className="space-y-2">
                {sorted.map((n) => (
                  <div
                    key={n.id}
                    className={`card p-4 flex items-start gap-4 ${
                      n.read
                        ? "opacity-60 hover:opacity-100 transition-opacity"
                        : `border-l-4 ${border}`
                    }`}
                  >
                    <div
                      className={`w-8 h-8 ${n.read ? "bg-gray-100" : iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <Icon size={14} className={n.read ? "text-gray-400" : iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            n.read ? "font-medium text-gray-700" : "font-semibold text-gray-900"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 ${n.read ? "text-gray-500" : "text-gray-600"}`}>
                        {n.message}
                      </p>
                      {n.sponsor && (
                        <Link
                          href={`/admin/sponsors/${n.sponsor.id}`}
                          className={`flex items-center gap-1 text-xs mt-1.5 hover:underline ${
                            n.read ? "text-gray-400 hover:text-brand-600" : "text-brand-600"
                          }`}
                        >
                          <Building2 size={11} />
                          {n.sponsor.name}
                        </Link>
                      )}
                      {n.task_id && (
                        <Link
                          href={`/admin/tasks/${n.task_id}`}
                          className={`flex items-center gap-1 text-xs mt-1.5 hover:underline ${
                            n.read ? "text-gray-400 hover:text-brand-600" : "text-brand-600"
                          }`}
                        >
                          <SquareCheckBig size={11} />
                          Otvori zadatak
                        </Link>
                      )}
                    </div>
                    {n.read ? <MarkUnreadButton id={n.id} /> : <MarkReadButton id={n.id} />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
