// Impersonacija partnera ("Logiraj se kao partner").
//
// Za razliku od members portala (JWT u sessionStorageu, izolirano po tabu), ovdje
// sesija živi u Supabase COOKIEJIMA i portal je server-rendered — sessionStorage
// server ne vidi. Zato se adminova sesija privremeno ZAMJENJUJE partnerovom, a
// adminovi tokeni se čuvaju u httpOnly cookieju da se izlaskom vrate.
//
// Cookie sadrži adminov refresh token → posjedovanje cookieja JE kredencijal
// (ne može se falsificirati kao npr. obična "adminEmail" oznaka).

import { cookies } from "next/headers";
import type { ProjectId } from "@/lib/supabase/projects";

export const IMP_COOKIE = "cro_imp";
export const IMP_MAX_AGE = 60 * 60 * 2; // 2h, kao na members portalu

export type ImpersonationPayload = {
  adminEmail: string;
  adminProjectId: ProjectId;
  adminAccessToken: string;
  adminRefreshToken: string;
  sponsorId: string;
  sponsorName: string;
  partnerEmail: string;
};

/** Samo podaci sigurni za slanje u browser (bez tokena). */
export type ImpersonationInfo = {
  adminEmail: string;
  sponsorId: string;
  sponsorName: string;
  partnerEmail: string;
};

export function encodeImp(payload: ImpersonationPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeImp(raw: string | undefined): ImpersonationPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (!parsed?.adminAccessToken || !parsed?.adminRefreshToken) return null;
    return parsed as ImpersonationPayload;
  } catch {
    return null;
  }
}

/** Čita stanje impersonacije za prikaz (banner) — NIKAD ne vraća tokene. */
export async function getImpersonation(): Promise<ImpersonationInfo | null> {
  const cookieStore = await cookies();
  const payload = decodeImp(cookieStore.get(IMP_COOKIE)?.value);
  if (!payload) return null;
  return {
    adminEmail: payload.adminEmail,
    sponsorId: payload.sponsorId,
    sponsorName: payload.sponsorName,
    partnerEmail: payload.partnerEmail,
  };
}
