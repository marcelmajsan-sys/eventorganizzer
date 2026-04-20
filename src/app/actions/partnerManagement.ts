"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PROJECTS, PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";

export interface PartnerUser {
  id: string; // sponsor_users.id
  user_id: string;
  sponsor_id: string;
  sponsor_name: string;
  email: string;
  name: string | null;
}

export async function createPartnerUser(
  email: string,
  password: string,
  sponsorId: string,
  name: string
) {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const adminClient = createAdminClientForProject(projectId);

  // Kreiraj/pronađi korisnika u aktivnom projektu
  let userId: string | null = null;
  const { data: existing } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const existingUser = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      user_metadata: { name: name.trim() },
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Greška pri kreiranju korisnika");
    userId = data.user.id;
  }

  // Upsert sponsor_users u aktivnom projektu
  const { error: suError } = await adminClient
    .from("sponsor_users")
    .upsert({ user_id: userId, sponsor_id: sponsorId, invited_by: "admin" }, { onConflict: "user_id" });

  if (suError) throw new Error(`sponsor_users: ${suError.message}`);

  // Pronađi naziv sponzora u aktivnom projektu
  const { data: sponsorData } = await adminClient
    .from("sponsors")
    .select("name")
    .eq("id", sponsorId)
    .maybeSingle();
  const sponsorName = sponsorData?.name;

  // Pokušaj i u drugom projektu (ako ima zasebnu Supabase instancu)
  const otherProjectId: ProjectId = projectId === "2026" ? "2025" : "2026";
  if (PROJECTS[otherProjectId].url !== PROJECTS[projectId].url && sponsorName) {
    try {
      const otherAdmin = createAdminClientForProject(otherProjectId);

      // Pronađi ili kreiraj auth usera u drugom projektu
      const { data: otherExisting } = await otherAdmin.auth.admin.listUsers({ perPage: 1000 });
      let otherUserId: string | null = otherExisting?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      )?.id ?? null;

      if (!otherUserId) {
        const { data: newUser } = await otherAdmin.auth.admin.createUser({
          email: email.toLowerCase().trim(),
          password,
          user_metadata: { name: name.trim() },
          email_confirm: true,
        });
        otherUserId = newUser?.user?.id ?? null;
      }

      if (otherUserId) {
        // Pronađi sponsor_id u drugom projektu (po imenu)
        const { data: otherSponsor } = await otherAdmin
          .from("sponsors")
          .select("id")
          .eq("name", sponsorName)
          .maybeSingle();

        if (otherSponsor) {
          await otherAdmin
            .from("sponsor_users")
            .upsert({ user_id: otherUserId, sponsor_id: otherSponsor.id, invited_by: "admin" }, { onConflict: "user_id" });
        }
      }
    } catch {
      // Drugi projekt nije dostupan ili nema isti sponzor — nema greške
    }
  }
}

export async function deletePartnerUser(sponsorUsersId: string, userId: string) {
  const supabase = await createAdminClient();
  await supabase.from("sponsor_users").delete().eq("id", sponsorUsersId);

  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const adminClient = createAdminClientForProject(projectId);
  await adminClient.auth.admin.deleteUser(userId);
}

export async function listSponsorsForSelect(): Promise<{ id: string; name: string }[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase.from("sponsors").select("id, name").order("name");
  return data ?? [];
}
