"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECTS, PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import { requireAdmin } from "@/lib/authGuards";
import { IMP_COOKIE, IMP_MAX_AGE, decodeImp, encodeImp } from "@/lib/impersonation";
import type { ProjectId } from "@/lib/supabase/projects";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://partners.ecommerce.hr";

type Tokens = { accessToken: string; refreshToken: string };

/**
 * Isti token exchange kao switchProject: generiraj magic link service role
 * klijentom, dohvati ga server-side bez praćenja redirecta i izvuci tokene
 * iz Location hasha.
 */
async function exchangeMagicLink(projectId: ProjectId, email: string): Promise<Tokens | null> {
  const admin = createAdminClientForProject(projectId);
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${APP_URL}/auth/callback` },
  });
  if (linkError || !linkData?.properties?.action_link) return null;

  try {
    const resp = await fetch(linkData.properties.action_link, { redirect: "manual" });
    const location = resp.headers.get("location") ?? "";
    const hashStart = location.indexOf("#");
    if (hashStart === -1) return null;
    const params = new URLSearchParams(location.substring(hashStart + 1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  } catch {
    return null;
  }
}

function sessionClient(projectId: ProjectId, cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(PROJECTS[projectId].url, PROJECTS[projectId].anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
}

function setProjectCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, projectId: ProjectId) {
  cookieStore.set(PROJECT_COOKIE, projectId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/**
 * Admin preuzima sesiju partnera. Adminova sesija se sprema u httpOnly cookie
 * i vraća se pozivom stopImpersonation().
 */
export async function impersonatePartner(
  sponsorId: string
): Promise<{ ok: true; redirect: string } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const cookieStore = await cookies();
  const projectId = auth.projectId;
  const admin = createAdminClientForProject(projectId);

  const { data: sponsor } = await admin
    .from("sponsors")
    .select("id, name, contact_email")
    .eq("id", sponsorId)
    .maybeSingle();
  if (!sponsor) return { ok: false, error: "Partner nije pronađen." };

  const { data: sponsorUsers } = await admin
    .from("sponsor_users")
    .select("user_id")
    .eq("sponsor_id", sponsorId);

  const userIds = (sponsorUsers ?? []).map((r: { user_id: string }) => r.user_id);
  if (userIds.length === 0) {
    return {
      ok: false,
      error: "Ovaj partner još nema korisnika portala. Kreiraj ga u Postavke → Partneri.",
    };
  }

  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const candidates = (authList?.users ?? []).filter((u) => userIds.includes(u.id) && u.email);
  if (candidates.length === 0) {
    return { ok: false, error: "Korisnik portala ne postoji u ovom projektu." };
  }

  // Ako partner ima više korisnika, uzmi onog koji je primarni kontakt.
  const primaryEmail = (sponsor.contact_email ?? "").toLowerCase();
  const target =
    candidates.find((u) => u.email?.toLowerCase() === primaryEmail) ?? candidates[0];
  const partnerEmail = target.email!;

  // Adminova sesija koja se vraća na izlazu
  const supabase = await createClient();
  const { data: { session: adminSession } } = await supabase.auth.getSession();
  if (!adminSession?.access_token || !adminSession?.refresh_token) {
    return { ok: false, error: "Vaša sesija nije dostupna — prijavite se ponovno." };
  }

  const tokens = await exchangeMagicLink(projectId, partnerEmail);
  if (!tokens) {
    return { ok: false, error: "Prijava kao partner nije uspjela (token exchange)." };
  }

  // Cookie s adminovim tokenima MORA biti postavljen prije zamjene sesije —
  // inače bi admin ostao zaključan u partnerskoj sesiji bez povratka.
  cookieStore.set(
    IMP_COOKIE,
    encodeImp({
      adminEmail: auth.user.email,
      adminProjectId: projectId,
      adminAccessToken: adminSession.access_token,
      adminRefreshToken: adminSession.refresh_token,
      sponsorId: sponsor.id,
      sponsorName: sponsor.name,
      partnerEmail,
    }),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: IMP_MAX_AGE,
    }
  );

  const { error: sessionError } = await sessionClient(projectId, cookieStore).auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  if (sessionError) {
    cookieStore.delete(IMP_COOKIE);
    return { ok: false, error: "Postavljanje partnerske sesije nije uspjelo." };
  }

  return { ok: true, redirect: "/portal/benefits" };
}

/** Vraća adminovu sesiju iz cookieja i briše oznaku impersonacije. */
export async function stopImpersonation(): Promise<{ ok: boolean; redirect: string }> {
  const cookieStore = await cookies();
  const payload = decodeImp(cookieStore.get(IMP_COOKIE)?.value);
  cookieStore.delete(IMP_COOKIE);

  if (!payload) return { ok: false, redirect: "/admin" };

  // Vrati sesiju samo onome tko je stvarno u preuzetoj partnerskoj sesiji —
  // inače bi zaostali cookie mogao nekom drugom dati adminovu prijavu.
  const { data: { user: current } } = await (await createClient()).auth.getUser();
  if (!current?.email || current.email.toLowerCase() !== payload.partnerEmail.toLowerCase()) {
    return { ok: false, redirect: "/api/auth/signout?redirect=%2Fadmin" };
  }

  const projectId = payload.adminProjectId ?? resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const { error } = await sessionClient(projectId, cookieStore).auth.setSession({
    access_token: payload.adminAccessToken,
    refresh_token: payload.adminRefreshToken,
  });

  // Admin je možda unutar portala prebacio projekt — vrati ga na svoj.
  setProjectCookie(cookieStore, projectId);

  if (error) {
    // Token je istekao/rotiran — treba nova prijava.
    return { ok: false, redirect: "/api/auth/signout?redirect=%2Fadmin" };
  }

  return { ok: true, redirect: `/admin/sponsors/${payload.sponsorId}` };
}
