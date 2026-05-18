import { createAdminClient } from "@/lib/supabase/server";
import { Bell, Building2 } from "lucide-react";
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

export default async function InboxPage() {
  const supabase = await createAdminClient();

  const { data: raw } = await supabase
    .from("notifications")
    .select("id, title, message, read, created_at, sponsor_id, sponsors(id, name)")
    .order("created_at", { ascending: false });

  const notifications = (raw ?? []).map((n) => ({
    ...n,
    sponsor: Array.isArray(n.sponsors) ? n.sponsors[0] : n.sponsors,
  }));

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

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

      {unread.length > 0 && (
        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Nepročitano</p>
          {unread.map((n) => (
            <div key={n.id} className="card p-4 border-l-4 border-l-brand-500 flex items-start gap-4">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell size={14} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                {n.sponsor && (
                  <Link
                    href={`/admin/sponsors/${n.sponsor.id}`}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:underline mt-1.5"
                  >
                    <Building2 size={11} />
                    {n.sponsor.name}
                  </Link>
                )}
              </div>
              <MarkReadButton id={n.id} />
            </div>
          ))}
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-2">
          {unread.length > 0 && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pročitano</p>
          )}
          {read.map((n) => (
            <div key={n.id} className="card p-4 flex items-start gap-4 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-700">{n.title}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                {n.sponsor && (
                  <Link
                    href={`/admin/sponsors/${n.sponsor.id}`}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 hover:underline mt-1.5"
                  >
                    <Building2 size={11} />
                    {n.sponsor.name}
                  </Link>
                )}
              </div>
              <MarkUnreadButton id={n.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
