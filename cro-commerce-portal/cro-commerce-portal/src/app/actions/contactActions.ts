"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { requireAdmin } from "@/lib/authGuards";

/**
 * Briše kontakt iz sponsor_contacts tablice koristeći admin klijent.
 * Automatski poništava FK reference (benefit contact_person_id) prije brisanja.
 * Vraća { error: string | null }
 */
export async function deleteContact(id: string): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = createAdminClientForProject(auth.projectId);

  // 1. Poništi referencu kontakta na benefitima (contact_person_id → NULL)
  await supabase
    .from("sponsor_benefits")
    .update({ contact_person_id: null })
    .eq("contact_person_id", id);

  // 2. Pokušaj brisanje
  const { error } = await supabase
    .from("sponsor_contacts")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.message?.includes("foreign key") || error.code === "23503") {
      return {
        error:
          "Ovaj kontakt je povezan s korisničkim računom sponzorskog portala i ne može se obrisati. " +
          "Najprije obrišite korisnika u Postavke → Partneri.",
      };
    }
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Briše više kontakata odjednom — ista logika kao deleteContact po svakom id-u.
 * Kontakte vezane uz portal korisnika (FK) preskače i prijavljuje u error poruci.
 */
export async function deleteContactsBulk(
  ids: string[]
): Promise<{ error?: string; deleted?: number }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };
  if (ids.length === 0) return { deleted: 0 };

  const supabase = createAdminClientForProject(auth.projectId);

  let deleted = 0;
  let skippedFk = 0;
  const otherErrors: string[] = [];

  for (const id of ids) {
    // Poništi referencu kontakta na benefitima (contact_person_id → NULL)
    await supabase
      .from("sponsor_benefits")
      .update({ contact_person_id: null })
      .eq("contact_person_id", id);

    const { error } = await supabase
      .from("sponsor_contacts")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.message?.includes("foreign key") || error.code === "23503") {
        skippedFk++;
      } else {
        otherErrors.push(error.message);
      }
      continue;
    }
    deleted++;
  }

  const parts: string[] = [];
  if (skippedFk > 0) {
    parts.push(
      `${skippedFk} kontakata je preskočeno jer su povezani s korisničkim računom sponzorskog portala.`
    );
  }
  if (otherErrors.length > 0) {
    parts.push(otherErrors.join("; "));
  }

  return parts.length > 0 ? { deleted, error: parts.join(" ") } : { deleted };
}

/**
 * Briše sve duplikate kontakata (isti email + isti partner), zadržavajući prioritetni zapis:
 * partner > ticket > contact > ostali; dulje ime ima prednost unutar istog tipa.
 * Kontakti sa slugom (žive QR stranice) se preskaču.
 * Vraća { deleted: number, error: string | null }
 */
export async function deleteDuplicateContacts(): Promise<{ deleted: number; error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { deleted: 0, error: auth.error };

  const supabase = createAdminClientForProject(auth.projectId);

  // Dohvati sve kontakte s emailom
  const { data: contacts, error: fetchError } = await supabase
    .from("sponsor_contacts")
    .select("id, name, email, type, created_at, sponsor_id, slug")
    .not("email", "is", null)
    .neq("email", "");

  if (fetchError) return { deleted: 0, error: fetchError.message };
  if (!contacts || contacts.length === 0) return { deleted: 0, error: null };

  // Preskoči kontakte sa slugom — imaju živu QR stranicu
  const candidates = contacts.filter((c) => !c.slug);

  const TYPE_PRIORITY: Record<string, number> = {
    partner: 1,
    ticket: 2,
    contact: 3,
  };

  // Grupiraj po emailu (case-insensitive) + sponzoru
  const byKey = new Map<string, typeof candidates>();
  for (const c of candidates) {
    const key = `${c.email!.toLowerCase().trim()}|${c.sponsor_id ?? ""}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(c);
  }

  const toDelete: string[] = [];

  byKey.forEach((group) => {
    if (group.length <= 1) return;

    // Sortiraj: najmanji prioritetni broj = zadrži; unutar istog tipa dulje ime = zadrži
    group.sort((a, b) => {
      const pa = TYPE_PRIORITY[a.type] ?? 99;
      const pb = TYPE_PRIORITY[b.type] ?? 99;
      if (pa !== pb) return pa - pb;
      const la = (a.name ?? "").length;
      const lb = (b.name ?? "").length;
      if (la !== lb) return lb - la; // dulje ime ima prednost
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    // Zadrži prvi (index 0), ostale obriši
    for (let i = 1; i < group.length; i++) {
      toDelete.push(group[i].id);
    }
  });

  if (toDelete.length === 0) return { deleted: 0, error: null };

  // Poništi FK reference na benefitima za sve koji se brišu
  await supabase
    .from("sponsor_benefits")
    .update({ contact_person_id: null })
    .in("contact_person_id", toDelete);

  // Obriši u batchevima od 50
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += 50) {
    const batch = toDelete.slice(i, i + 50);
    const { error } = await supabase
      .from("sponsor_contacts")
      .delete()
      .in("id", batch);
    if (error) return { deleted, error: error.message };
    deleted += batch.length;
  }

  return { deleted, error: null };
}
