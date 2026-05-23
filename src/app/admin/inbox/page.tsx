import { createAdminClient, createClient } from "@/lib/supabase/server";
import InboxView from "@/components/admin/InboxView";

type NotifType = "task" | "contact" | "ticket";

function getNotifType(n: any): NotifType {
  if (n.task_id) return "task";
  if (n.title === "Nova osoba za ulaznice") return "ticket";
  return "contact";
}

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const adminClient = await createAdminClient();

  const [{ data: raw }, { data: reads }] = await Promise.all([
    adminClient
      .from("notifications")
      .select("id, title, message, created_at, sponsor_id, task_id, sponsors(id, name)")
      .order("created_at", { ascending: false }),
    userId
      ? adminClient
          .from("notification_reads")
          .select("notification_id")
          .eq("user_id", userId)
      : Promise.resolve({ data: [] }),
  ]);

  const readSet = new Set((reads ?? []).map((r: any) => r.notification_id));

  const notifications = (raw ?? []).map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    read: readSet.has(n.id),
    created_at: n.created_at,
    task_id: n.task_id ?? null,
    sponsor: Array.isArray(n.sponsors) ? (n.sponsors[0] ?? null) : (n.sponsors ?? null),
    notifType: getNotifType(n),
  }));

  return <InboxView notifications={notifications} />;
}
