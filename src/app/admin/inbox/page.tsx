import { createAdminClient } from "@/lib/supabase/server";
import InboxView from "@/components/admin/InboxView";

type NotifType = "task" | "contact" | "ticket";

function getNotifType(n: any): NotifType {
  if (n.task_id) return "task";
  if (n.title === "Nova osoba za ulaznice") return "ticket";
  return "contact";
}

export default async function InboxPage() {
  const supabase = await createAdminClient();

  const { data: raw } = await supabase
    .from("notifications")
    .select("id, title, message, read, created_at, sponsor_id, task_id, sponsors(id, name)")
    .order("created_at", { ascending: false });

  const notifications = (raw ?? []).map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    read: n.read,
    created_at: n.created_at,
    task_id: n.task_id ?? null,
    sponsor: Array.isArray(n.sponsors) ? (n.sponsors[0] ?? null) : (n.sponsors ?? null),
    notifType: getNotifType(n),
  }));

  return <InboxView notifications={notifications} />;
}
