"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authGuards";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";

export interface ShareDocumentInput {
  /** Public URL storage objekta u bucketu `sponsor-files` (putanja `shared/...`). */
  storageUrl: string;
  filename: string;
  fileSize: number | null;
  mimeType: string | null;
  /** Partneri koji dobivaju dokument (prazno = nitko). */
  sponsorIds: string[];
}

export interface ShareDocumentResult {
  error: string | null;
  /** Broj partnera kojima je dokument upravo dodan. */
  shared: number;
  /** Broj partnera koji su isti dokument već imali (preskočeni). */
  skipped: number;
}

/**
 * Dijeljeni dokument za više partnera: JEDAN storage objekt (`sponsor-files/shared/...`)
 * + po jedan `files` red po partneru (`benefit_id: null`, isti `storage_url`).
 * Portal svakom partneru prikazuje red u tabu "Dokumenti" na /portal/sponsor.
 * Brisanje pojedinog reda u adminu ne dira storage objekt (pattern iz FileUploadSection).
 */
export async function shareDocumentWithSponsors(
  input: ShareDocumentInput
): Promise<ShareDocumentResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error, shared: 0, skipped: 0 };

  const storageUrl = (input.storageUrl ?? "").trim();
  const filename = (input.filename ?? "").trim();
  if (!storageUrl.includes("/sponsor-files/shared/")) {
    return { error: "Neispravna putanja dokumenta (očekuje se sponsor-files/shared/).", shared: 0, skipped: 0 };
  }
  if (!filename) return { error: "Naziv datoteke je obavezan.", shared: 0, skipped: 0 };

  const requested: string[] = [];
  const seen = new Set<string>();
  (input.sponsorIds ?? []).forEach((id) => {
    if (typeof id === "string" && id && !seen.has(id)) {
      seen.add(id);
      requested.push(id);
    }
  });
  if (requested.length === 0) {
    return { error: "Nije odabran nijedan partner.", shared: 0, skipped: 0 };
  }

  const admin = createAdminClientForProject(auth.projectId);

  // Samo partneri koji stvarno postoje u aktivnom projektu.
  const { data: sponsors, error: sponsorsError } = await admin
    .from("sponsors")
    .select("id")
    .in("id", requested);
  if (sponsorsError) return { error: sponsorsError.message, shared: 0, skipped: 0 };
  const validIds = (sponsors ?? []).map((s: { id: string }) => s.id);
  if (validIds.length === 0) {
    return { error: "Odabrani partneri nisu pronađeni.", shared: 0, skipped: 0 };
  }

  // Idempotentno: partner koji već ima ovaj dokument ne dobiva duplikat.
  const { data: existing, error: existingError } = await admin
    .from("files")
    .select("sponsor_id")
    .eq("storage_url", storageUrl)
    .in("sponsor_id", validIds);
  if (existingError) return { error: existingError.message, shared: 0, skipped: 0 };
  const already = new Set<string>();
  (existing ?? []).forEach((f: { sponsor_id: string }) => already.add(f.sponsor_id));

  const rows = validIds
    .filter((id) => !already.has(id))
    .map((id) => ({
      sponsor_id: id,
      benefit_id: null,
      filename,
      storage_url: storageUrl,
      file_size: input.fileSize ?? null,
      mime_type: input.mimeType ?? null,
    }));

  if (rows.length > 0) {
    const { error: insertError } = await admin.from("files").insert(rows);
    if (insertError) return { error: insertError.message, shared: 0, skipped: already.size };
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/portal/sponsor");

  return { error: null, shared: rows.length, skipped: already.size };
}
