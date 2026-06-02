import { createClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { cookies } from "next/headers";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import InboxView from "@/components/admin/InboxView";

type NotifType = "task" | "contact" | "ticket" | "login" | "followup";

function getNotifType(n: any): NotifType {
  if (n.task_id) return "task";
  if (n.title === "Follow up podsjetnik") return "followup";
  if (n.title === "Prijava partnera") return "login";
  if (n.title === "Nova osoba za ulaznice") return "ticket";
  return "contact";
}

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const adminClient = createAdminClientForProject(projectId);

  const [{ data: raw }, { data: reads }, { data: rawComments }] = await Promise.all([
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
    adminClient
      .from("sponsor_comments")
      .select("id, sponsor_id, comment, admin_email, created_at, sponsors(id, name)")
      .order("created_at", { ascending: false }),
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

  const comments = (rawComments ?? []).map((c: any) => ({
    id: c.id,
    sponsor_id: c.sponsor_id,
    comment: c.comment,
    admin_email: c.admin_email,
    created_at: c.created_at,
    sponsor: Array.isArray(c.sponsors) ? (c.sponsors[0] ?? null) : (c.sponsors ?? null),
  }));

  return <InboxView notifications={notifications} comments={comments} userEmail={user?.email ?? null} />;
}
