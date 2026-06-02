"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";

async function getProjectId() {
  const cookieStore = await cookies();
  return resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
}

export type SponsorComment = {
  id: string;
  sponsor_id: string;
  comment: string;
  admin_email: string;
  created_at: string;
  remind_at?: string | null;
};

export async function getSponsorComments(
  sponsorId: string
): Promise<{ data: SponsorComment[] | null; error: string | null }> {
  const projectId = await getProjectId();
  const supabase = createAdminClientForProject(projectId);
  let { data, error } = await supabase
    .from("sponsor_comments")
    .select("*, sponsor_comment_reminders(remind_at)")
    .eq("sponsor_id", sponsorId)
    .order("created_at", { ascending: false });

  if (error) {
    // fallback: migration_025 nije pokrenuta, dohvati bez reminders
    ({ data, error } = await supabase
      .from("sponsor_comments")
      .select("*")
      .eq("sponsor_id", sponsorId)
      .order("created_at", { ascending: false }));
  }

  if (error) return { data: null, error: error.message };
  const mapped = (data ?? []).map((c: any) => {
    const reminders = Array.isArray(c.sponsor_comment_reminders)
      ? c.sponsor_comment_reminders
      : c.sponsor_comment_reminders ? [c.sponsor_comment_reminders] : [];
    return { ...c, remind_at: reminders[0]?.remind_at ?? null };
  });
  return { data: mapped as SponsorComment[], error: null };
}

export async function addSponsorComment(
  sponsorId: string,
  comment: string
): Promise<{ data: SponsorComment | null; error: string | null }> {
  const projectId = await getProjectId();
  const adminClient = await createAdminClient();
  const { data: { user } } = await adminClient.auth.getUser();
  if (!user?.email) return { data: null, error: "Niste prijavljeni" };

  const supabase = createAdminClientForProject(projectId);
  const { data, error } = await supabase
    .from("sponsor_comments")
    .insert({ sponsor_id: sponsorId, comment, admin_email: user.email })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as SponsorComment, error: null };
}

export async function updateSponsorComment(
  commentId: string,
  comment: string
): Promise<{ error: string | null }> {
  const projectId = await getProjectId();
  const supabase = createAdminClientForProject(projectId);
  const { error } = await supabase
    .from("sponsor_comments")
    .update({ comment })
    .eq("id", commentId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteSponsorComment(
  commentId: string
): Promise<{ error: string | null }> {
  const projectId = await getProjectId();
  const supabase = createAdminClientForProject(projectId);
  const { error } = await supabase
    .from("sponsor_comments")
    .delete()
    .eq("id", commentId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function updateCommentReminder(
  commentId: string,
  remindAt: string
): Promise<{ error: string | null }> {
  const projectId = await getProjectId();
  const supabase = createAdminClientForProject(projectId);
  const { error } = await supabase
    .from("sponsor_comment_reminders")
    .update({ remind_at: remindAt })
    .eq("comment_id", commentId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function createCommentReminder(
  commentId: string,
  sponsorId: string,
  commentText: string,
  remindAt: string
): Promise<{ error: string | null }> {
  const projectId = await getProjectId();
  const adminClient = await createAdminClient();
  const { data: { user } } = await adminClient.auth.getUser();
  if (!user?.email) return { error: "Niste prijavljeni" };

  const supabase = createAdminClientForProject(projectId);
  const { error } = await supabase.from("sponsor_comment_reminders").insert({
    comment_id: commentId,
    sponsor_id: sponsorId,
    comment_text: commentText,
    admin_email: user.email,
    remind_at: remindAt,
  });
  if (error) return { error: error.message };
  return { error: null };
}
