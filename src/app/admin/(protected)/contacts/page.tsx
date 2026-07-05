import { cookies } from "next/headers";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import ContactsView from "@/components/admin/ContactsView";

export default async function ContactsPage() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const supabase = createAdminClientForProject(projectId);

  const [
    { data: existingContacts, error: existingError },
    { data: sponsors, error: sponsorsError },
  ] = await Promise.all([
    supabase.from("sponsor_contacts").select("sponsor_id, name, email"),
    supabase
      .from("sponsors")
      .select("id, name, contact_name, contact_email, contact_phone")
      .order("name"),
  ]);
  if (existingError) console.error("[contacts page] čitanje kontakata:", existingError.message);
  if (sponsorsError) console.error("[contacts page] čitanje partnera:", sponsorsError.message);

  // Automatski stvori sponsor_contacts za primarne kontakte koji još ne postoje
  // Provjera po imenu I po emailu — sprječava duplikate kad isti email ima drugačije ime
  const buildKeys = (rows: { sponsor_id: string | null; name: string | null; email: string | null }[]) => {
    const byName = new Set(
      rows.map((c) => `${c.sponsor_id}|${(c.name ?? "").toLowerCase()}`)
    );
    const byEmail = new Set(
      rows
        .filter((c) => c.email)
        .map((c) => `${c.sponsor_id}|${(c.email ?? "").toLowerCase()}`)
    );
    return { byName, byEmail };
  };

  const { byName: existingByName, byEmail: existingByEmail } = buildKeys(existingContacts ?? []);

  const toInsert = (sponsors ?? [])
    .filter(
      (s) =>
        s.contact_name &&
        !existingByName.has(`${s.id}|${s.contact_name.toLowerCase()}`) &&
        !(s.contact_email && existingByEmail.has(`${s.id}|${s.contact_email.toLowerCase()}`))
    )
    .map((s) => ({
      sponsor_id: s.id,
      name: s.contact_name as string,
      email: s.contact_email ?? null,
      phone: (s as any).contact_phone ?? null,
      type: "contact" as const,
    }));

  if (toInsert.length > 0) {
    // Zaštita od duplikata: ponovna provjera postojanja neposredno prije inserta
    // (paralelni loadovi ove stranice mogu ubaciti iste kontakte)
    const { data: recheck, error: recheckError } = await supabase
      .from("sponsor_contacts")
      .select("sponsor_id, name, email");
    if (recheckError) {
      console.error("[contacts page] recheck kontakata:", recheckError.message);
    } else {
      const { byName, byEmail } = buildKeys(recheck ?? []);
      const safeToInsert = toInsert.filter(
        (r) =>
          !byName.has(`${r.sponsor_id}|${r.name.toLowerCase()}`) &&
          !(r.email && byEmail.has(`${r.sponsor_id}|${r.email.toLowerCase()}`))
      );
      if (safeToInsert.length > 0) {
        const { error: insertError } = await supabase.from("sponsor_contacts").insert(safeToInsert);
        if (insertError) console.error("[contacts page] insert primarnih kontakata:", insertError.message);
      }
    }
  }

  // Dohvati sve kontakte (uključujući upravo kreirane)
  const { data: contacts, error: contactsError } = await supabase
    .from("sponsor_contacts")
    .select("*")
    .order("created_at");
  if (contactsError) console.error("[contacts page] čitanje svih kontakata:", contactsError.message);

  const sponsorList = (sponsors ?? []).map((s) => ({ id: s.id, name: s.name }));

  return <ContactsView contacts={contacts ?? []} sponsors={sponsorList} />;
}
