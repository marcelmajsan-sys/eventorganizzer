# Popis SQL migracija

Sve migracije su u `supabase/` folderu. Pokrenuti u Supabase Dashboard → SQL Editor za **oba projekta** (2025 i 2026), osim ako nije naznačeno drugačije.

## Redoslijed (kronološki)

| Migracija | Opis |
|-----------|------|
| `migration_001_initial.sql` | Inicijalne tablice |
| `migration_002_nullable_sponsor_benefit` | Nullable `sponsor_id` na benefitima |
| `migration_003_optional_deadline` | Opcijski rok i `assigned_to` |
| `migration_004_task_benefit_category` | Kategorija zadataka i benefita |
| `migration_005_project_settings` | Tablice `project_settings` i `project_admins` |
| `migration_006_sponsor_contacts` | Tablica `sponsor_contacts` (CHECK: samo `contact` i `ticket`) |
| `migration_007_program_budget` | Tablice `program_sessions` i `budget_items` |
| `migration_008_project_id` | Kolona `project_id` na program/budget tablicama |
| `migration_009_email_system` | Tablice `email_templates`, `email_automations`, `email_logs` + `reminder_email` kolona |
| `migration_010_package_types` | Ažurirani tipovi paketa |
| `migration_011_contact_notes` | Napomene na kontaktima |
| `migration_012_contact_company` | Tvrtka na kontaktima |
| `migration_013_sponsor_portal` | Tablica `sponsor_users` + RLS politike + helper funkcije |
| `migration_014_lead_status` | Kolona `lead_status` na `sponsors` tablici |
| `migration_015_contacts_partner_rls` | RLS na `sponsor_contacts`: partneri mogu CRUD vlastite kontakte. Ako greška "policy already exists" → DROP IF EXISTS pa recreiraj |
| `migration_016_sponsor_contact_phone` | Kolona `contact_phone` na `sponsors` tablici |
| `migration_017_partial_payment` | `payment_status` CHECK proširen s `'partial'` |
| `migration_017_enable_rls_all_tables` | RLS na svim public tablicama + `is_project_admin()` helper |
| `migration_018_benefit_description_contact_docs` | `description` + `contact_person_id` na `sponsor_benefits`; `benefit_id` na `files` |
| `migration_019_contact_notification_trigger` | Postgres trigger: notifikacija pri dodavanju kontakta (SECURITY DEFINER) |
| `migration_020_notifications_task_support` | `notifications.sponsor_id` postaje nullable; dodaje `task_id` kolonu |
| `migration_021_task_notification_trigger` | Postgres trigger: notifikacija pri kreiranju zadatka s emailom (SECURITY DEFINER) |
| `migration_022_fix_contact_notification_type` | Popravak triggera: samo `'ticket'` tip → "Nova osoba za ulaznice"; ostali → "Dodan novi kontakt" |
| `migration_023_extend_contact_type_check` | CHECK constraint proširen: `contact\|ticket\|partner\|visitor\|speaker\|service_provider\|brand_ambassador` |
| `migration_024_sponsor_amount` | `iznos NUMERIC(10,2)` kolona na `sponsors` tablici |
| `migration_031_budget_unconfirmed_status` | `budget_items` CHECK proširen s `'unconfirmed'` |
| `migration_032_default_benefit_contact` | SET `assigned_to = 'laura@ecommerce.hr'` za sve benefite bez kontakta |
| `migration_033_sync_primary_contacts` | Sync: primarni kontakti iz `sponsors.contact_name` → `sponsor_contacts` |
| `migration_034_partial_amount` | `partial_amount NUMERIC(10,2) DEFAULT NULL` na `sponsors` tablici |
| `migration_035_partner_login_notification_fn` | SECURITY DEFINER funkcija `record_partner_login_notification()` za INSERT u `notifications` zaobilazeći RLS — pokrenuti u **OBJE** baze |

## Napomene

- **migration_023** je obavezan za spremanje kontakata novih tipova (speaker, visitor, itd.) — bez nje tiho faila
- **migration_020** je obavezan za inbox query koji uključuje `task_id`
- **migration_024**: bez nje cijeli update sponzora tiho faila — obavezno pokrenuti
- **migration_034**: `partial_amount` se prikazuje samo kad `payment_status = 'partial'`

## Seed podaci za 2025

```sql
-- Pokreni samo za 2025 projekt!
-- seed_2025_program.sql — sav program + troškovi iz Google tablice
```

## Supabase Storage

Bucket `sponsor-files` mora biti kreiran kao **Public** u Supabase Dashboard + RLS politike:

```sql
CREATE POLICY "authenticated upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sponsor-files');

CREATE POLICY "authenticated read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'sponsor-files');

CREATE POLICY "authenticated delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'sponsor-files');
```

**Putanje**: `{sponsor_id}/{timestamp}_{filename}` (sponzor) | `{sponsor_id}/benefits/{benefit_id}/{timestamp}_{filename}` (benefit)
