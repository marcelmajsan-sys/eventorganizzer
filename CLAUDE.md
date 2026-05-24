# CRO Commerce Admin Portal — Dokumentacija

## Što aplikacija radi

Admin portal za upravljanje CRO Commerce konferencijom. Omogućuje:

- Praćenje sponzora, njihovih paketa i statusa plaćanja
- Upravljanje benefitima sponzora s rokovima i statusima
- Email obavijesti za benefite s praćenjem zadnjeg slanja
- Kontakt osobe i osobe za ulaznice po sponzoru
- Upload datoteka po sponzoru i po benefitu (Supabase Storage bucket `sponsor-files`)
- Program konferencije po pozornicama (Future / Action / Wonderland Stage)
- Praćenje troškova eventa s budžetom i statusima plaćanja
- Zadaci (Kanban board) s detaljnim stranicama po zadatku
- Rokovnik — godišnji pregled zadataka po rokovima s filtrom po odgovornoj osobi
- Postavke projekta (datum konferencije, upravljanje korisnicima)
- **Multi-projekt**: CRO Commerce 2026 i 2025 — prebacivanje bez ponovnog logina
- **Sponzorski portal** — portal za sponzore na `/portal` i `/partner` s mogućnošću uređivanja kontakata

Deployano na: https://eventorganizzer.vercel.app

---

## Struktura repozitorija

```
eventorganizzer/
├── src/                          ← Vercel deploya odavde (root)
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx        ← Auth guard + sidebar layout (scroll container: <main overflow-y-auto>)
│   │   │   ├── dashboard/        ← Nadzorna ploča
│   │   │   ├── sponsors/         ← Lista sponzora (naziv = klikabilan link na profil)
│   │   │   │   └── [id]/         ← Detaljna stranica sponzora
│   │   │   ├── benefits/         ← Svi benefiti (filter po statusu via ?status=)
│   │   │   ├── contacts/         ← Svi kontakti (createAdminClient — zaobilazi RLS)
│   │   │   │   └── [id]/         ← Detaljna stranica kontakta
│   │   │   ├── program/          ← Program konferencije
│   │   │   ├── troskovi/         ← Troškovi eventa
│   │   │   ├── tasks/            ← Kanban zadaci
│   │   │   │   └── [id]/         ← Detaljna stranica zadatka
│   │   │   ├── calendar/         ← Rokovnik (zadaci po rokovima)
│   │   │   ├── inbox/            ← Inbox obavijesti (tabovi po tipu)
│   │   │   └── settings/         ← Datum konferencije + upravljanje korisnicima + partneri
│   │   ├── actions/
│   │   │   ├── switchProject.ts      ← Admin projekt switch (token exchange) + portal projekt switch
│   │   │   ├── projectSettings.ts    ← Server action: datum konferencije
│   │   │   ├── userManagement.ts     ← Server action: CRUD admin korisnika u svim bazama
│   │   │   ├── partnerManagement.ts  ← Server action: CRUD partner korisnika + updatePrimaryContact
│   │   │   ├── findPartnerProject.ts ← Server action: pronađi u kojoj bazi postoji email
│   │   │   ├── notifications.ts      ← Server actions: markRead/Unread/All, deleteNotification, deleteAllNotifications, recordPartnerLogin
│   │   │   └── sponsorBulkUpdate.ts  ← Server action: bulk update package_type/payment_status/lead_status za više sponzora
│   │   ├── api/
│   │   │   ├── benefits/[id]/
│   │   │   │   ├── notify/       ← POST: šalje email obavijest + logira u email_logs
│   │   │   │   └── remind/       ← POST: šalje podsjetnik (s predloškom) + logira u email_logs
│   │   │   ├── cron/reminders/   ← Cron job za automatske email podsjetnike
│   │   │   ├── portal/invite/    ← POST: šalje Supabase invite + upisuje sponsor_users
│   │   │   └── sponsors/         ← REST API za sponzore
│   │   ├── auth/
│   │   │   └── callback/         ← Client page: PKCE/implicit flow fallback (zamjena projekta)
│   │   ├── login/                ← Login stranica za admins (email + lozinka)
│   │   ├── partner/              ← Login stranica za partnere/sponzore (/partner)
│   │   └── portal/               ← Sponzorski portal
│   │       ├── layout.tsx        ← Auth: admin → /admin/dashboard, bez pristupa → /login?error=no_access; wrapa PortalLangProvider
│   │       ├── page.tsx          ← Redirect na /portal/sponsor (Partner je homepage)
│   │       ├── benefits/         ← Read-only lista benefita s filterom po statusu
│   │       ├── program/          ← Read-only program konferencije (bez uređivanja)
│   │       ├── sponsor/          ← Partner info: kontakti (editable), datoteke, primarni kontakt
│   │       └── video/            ← CRO Commerce 2025 YouTube plejlista (embed)
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── ProjectSwitcher.tsx         ← window.location.href za reset browser klijenta
│   │   │   ├── ProjectSettingsForm.tsx
│   │   │   ├── UserManagementSection.tsx     ← CRUD admin korisnika (modal)
│   │   │   ├── PartnerManagementSection.tsx  ← CRUD partner korisnika + promjena lozinke
│   │   │   ├── CalendarView.tsx              ← Rokovnik (zadaci + edit modal)
│   │   │   ├── TaskDetailActions.tsx         ← Edit/delete na stranici zadatka
│   │   │   ├── BenefitsView.tsx              ← Prikaz benefita; Po kategoriji = horizontalni tabovi
│   │   │   ├── BudgetView.tsx                ← Troškovi; status: pending|paid|cancelled|unconfirmed
│   │   │   ├── ProgramView.tsx
│   │   │   ├── ContactsSection.tsx           ← Kontakti + mail ikona za slanje portal pozivnice
│   │   │   ├── ContactsView.tsx              ← Lista kontakata; email ćelija = link na profil kontakta
│   │   │   ├── FileUploadSection.tsx         ← Upload na Supabase Storage (sponsor-files bucket)
│   │   │   ├── BenefitFileUpload.tsx         ← Upload datoteka vezanih uz specifični benefit
│   │   │   ├── InboxView.tsx                 ← Inbox s tabovima (zadatak/kontakt/ulaznica/sve)
│   │   │   ├── InboxActions.tsx              ← MarkRead/Unread/All + Delete (samo marcel@ecommerce.hr)
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── AddBenefitModal.tsx           ← Dropdown postojećih naziva; admin email dropdown za assigned_to
│   │   │   ├── AddContactModal.tsx           ← Dodaj kontakt s tipom, sponzorom, napomenom
│   │   │   ├── ContactDetailActions.tsx      ← Uredi/briši kontakt — s dropdown za sponzora i tipom
│   │   │   ├── AddSponsorModal.tsx           ← Paket sort: Nedefinirano prvo, zatim standardni redoslijed
│   │   │   ├── AddTaskModal.tsx
│   │   │   ├── EditSponsorForm.tsx           ← lead_status + iznos + contact_phone polje
│   │   │   ├── EditBenefitModal.tsx          ← Primarni kontakt pre-selektiran (★); svi kontakti sponzora
│   │   │   ├── EditBenefitDialog.tsx         ← Primarni kontakt pre-selektiran (★); svi kontakti sponzora
│   │   │   ├── RenameBenefitDialog.tsx       ← Preimenuj + postavi rok za sve sponzore odjednom
│   │   │   ├── BenefitStatusSelect.tsx
│   │   │   ├── DeleteBenefitButton.tsx
│   │   │   ├── DeleteSponsorButton.tsx       ← Brisanje sponzora s potvrdom
│   │   │   ├── AdminPrimaryContactEdit.tsx   ← Inline edit primarnog kontakta na stranici sponzora
│   │   │   ├── PackageTypeManager.tsx        ← Pill kategorije; isti sort kao AddSponsorModal
│   │   │   └── SponsorsTableWithSelect.tsx   ← Tablica sponzora s multi-select + bulk action barom + Iznos stupac
│   │   └── portal/
│   │       ├── PortalSidebar.tsx             ← Nav: Partner → Benefiti → Program → Video + projekt switcher + jezik toggle
│   │       ├── PortalBenefitCard.tsx         ← Read-only benefit kartica (opis, kontakt, dokumenti, napomena s labelom)
│   │       ├── PortalBenefitsView.tsx        ← Klijentska komponenta: progress bar + status filtri + benefit kartice (useLang)
│   │       ├── PortalPartnerTabs.tsx         ← Tabovi: Informacije / Dokumenti / Vaš paket (ili Opcije suradnje)
│   │       ├── PortalContactsSection.tsx     ← Editable: primarni kontakt + kontakt osobe + ulaznice
│   │       ├── PortalCollaborationOptions.tsx ← Tablica usporedbe paketa (prevedeni nazivi paketa)
│   │       ├── PortalProgramView.tsx         ← Read-only program (tabovi po pozornici)
│   │       ├── PortalPageHeader.tsx          ← Generička komponenta za translated naslove stranica
│   │       └── PortalLangProvider.tsx        ← Client wrapper koji injektira LanguageProvider
│   ├── context/
│   │   └── LanguageContext.tsx   ← React context: lang (hr|en), toggleLang(), t() hook; localStorage persistence
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← Browser Supabase klijent
│   │   │   ├── server.ts             ← Server Supabase klijent (SSR)
│   │   │   ├── projects.ts           ← Konfiguracija projekata (2025/2026) — URL-ovi hardkodirani
│   │   │   └── adminProjectClient.ts ← Service role klijent za bilo koji projekt
│   │   ├── i18n/
│   │   │   └── portal.ts         ← HR/EN prijevodi za portal; translate() + translatePackage() helperi
│   │   ├── email.ts              ← Resend email helper (deadline reminder, welcome mail)
│   │   └── utils.ts              ← Utility funkcije (boje, formatiranje, leadStatusLabel/Color)
│   ├── middleware.ts              ← Auth guard (getSession + 1200ms timeout, ne getUser)
│   └── types/index.ts            ← Sadrži LeadStatus tip + Sponsor interface s lead_status + contact_phone
├── supabase/                     ← SQL migracije
│   ├── migration_001_initial.sql
│   ├── ...
│   └── migration_035_partner_login_notification_fn.sql
├── cro-commerce-portal/
│   └── cro-commerce-portal/      ← Dev working dir (lokalni dev)
│       └── src/                  ← Kopija root src/ za lokalni rad
├── .env.example                  ← Primjer env varijabli
├── .npmrc                        ← legacy-peer-deps=true
└── CLAUDE.md                     ← Ova datoteka
```

> **Važno**: Dvije su kopije koda — `src/` (root, Vercel deploya odavde) i `cro-commerce-portal/cro-commerce-portal/src/` (lokalni dev). Nakon svake promjene u lokalnom dev direktoriju, datoteke se kopiraju u root `src/` prije commita.

---

## Baza podataka (Supabase)

### Tablice

| Tablica | Opis |
|---------|------|
| `sponsors` | Sponzori — naziv, paket, `contact_name`, `contact_email`, `contact_phone`, `lead_status`, `iznos`, status plaćanja |
| `sponsor_benefits` | Benefiti sponzora — rokovi, statusi, `reminder_email`, `assigned_to`, `description`, `contact_person_id` |
| `sponsor_contacts` | Kontakt osobe i osobe za ulaznice po sponzoru (RLS: partneri mogu upravljati vlastitima) |
| `sponsor_users` | Mapiranje auth korisnika → sponsor_id (za sponzorski portal) |
| `files` | Upload datoteke — vezane za sponzora (`sponsor_id`) i/ili za benefit (`benefit_id`) |
| `tasks` | Kanban zadaci |
| `notifications` | Obavijesti — `sponsor_id` (nullable), `task_id` (nullable), `title`, `message`, `created_at` |
| `notification_reads` | Per-user read tracking — `notification_id`, `user_id` |
| `packages` | Paketi sponzorstva |
| `project_settings` | Postavke po projektu (datum konferencije: ključevi `conference_date_2026`, `conference_date_2025`) |
| `project_admins` | Email adrese koje imaju pristup admin panelu |
| `program_sessions` | Sesije programa konferencije (s `project_id`) |
| `budget_items` | Stavke troškova (s `project_id`) |
| `email_templates` | Predlošci za email podsjetnike (subject, body, button) |
| `email_automations` | Automatizacije slanja (trigger_type, days_before, template_id) |
| `email_logs` | Log svakog poslanog maila (benefit_id, recipient, subject, **sent_at**, status) |

> **Važno**: Timestamp kolona u `email_logs` je `sent_at`, **ne** `created_at`.

### Tipovi paketa
`'Glavni' | 'Zlatni' | 'Srebrni' | 'Brončani' | 'Medijski' | 'Community'`

**Sort redoslijed** (AddSponsorModal, PackageTypeManager): Nedefinirano → Glavni → Zlatni → Srebrni → Brončani → Medijski → Community → custom (alfabetski)

### Tipovi statusa benefita
`'not_started' | 'in_progress' | 'completed' | 'overdue'`

### Tipovi kontakata (sponsor_contacts.type)
`'contact' | 'ticket' | 'partner' | 'visitor' | 'speaker' | 'service_provider' | 'brand_ambassador'`
- Originalni CHECK constraint (migration_006) imao je samo `contact` i `ticket` — migration_023 proširuje na sve tipove
- `contact` = kontakt osoba sponzora, `ticket` = osoba za ulaznice; ostali = standalone kontakti

### Tipovi statusa plaćanja
`'paid' | 'pending' | 'overdue' | 'partial'`
- `partial` = Djelomično plaćeno (dodano migration_017)

### Tipovi statusa troškova (budget_items.status)
`'pending' | 'paid' | 'cancelled' | 'unconfirmed'`
- `unconfirmed` = Nepotvrđeno (dodano migration_031)

### Tipovi lead statusa (sponsors.lead_status)
`'cold_lead' | 'hot_lead' | 'confirmed_new' | 'confirmed_returning'`
- cold_lead = plava boja, hot_lead = crvena, confirmed_new = zelena, confirmed_returning = ljubičasta

### Izolacija podataka po projektu
Tablice `program_sessions` i `budget_items` koriste `project_id TEXT` kolonu (`'2025'` ili `'2026'`) za izolaciju podataka između projekata. Ostale tablice (sponzori, benefiti, zadaci) koriste zasebne Supabase instance ako su konfigurirani zasebni URL-ovi.

### Benefit-level datoteke (migration_018)
- `sponsor_benefits` dobio dvije nove kolone: `description TEXT` i `contact_person_id UUID REFERENCES sponsor_contacts(id) ON DELETE SET NULL`
- `files` tablica dobila `benefit_id UUID REFERENCES sponsor_benefits(id) ON DELETE CASCADE`
- Datoteke s `benefit_id IS NULL` su datoteke sponzora; datoteke s `benefit_id IS NOT NULL` su dokumenti specifičnog benefita
- **Graceful degradation**: sav kod koji koristi ove kolone ima fallback upit bez novih kolona, ako migration_018 još nije pokrenut

---

## Supabase Storage

### Bucket: `sponsor-files`
- Tip: **Public bucket**
- Sponzorske datoteke: `{sponsor_id}/{timestamp}_{filename}`
- Datoteke benefita: `{sponsor_id}/benefits/{benefit_id}/{timestamp}_{filename}`

### Potrebne RLS politike na `storage.objects`:
```sql
CREATE POLICY "authenticated upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'sponsor-files');

CREATE POLICY "authenticated read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'sponsor-files');

CREATE POLICY "authenticated delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'sponsor-files');
```

---

## Environment varijable

Postavi u Vercel Dashboard → Settings → Environment Variables i lokalno u `.env.local`:

```env
# Supabase — CRO Commerce 2026
NEXT_PUBLIC_SUPABASE_URL_2026=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_2026=...
SUPABASE_SERVICE_ROLE_KEY_2026=...

# Supabase — CRO Commerce 2025
NEXT_PUBLIC_SUPABASE_URL_2025=https://yyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_2025=...
SUPABASE_SERVICE_ROLE_KEY_2025=...

# Supabase — Fallback (koristi se ako _2026/_2025 nisu postavljeni)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Resend (email podsjetnici)
RESEND_API_KEY=re_...

# URL aplikacije — OBAVEZNO postaviti na produkcijski URL
NEXT_PUBLIC_APP_URL=https://eventorganizzer.vercel.app

# Admin email (prima cron obavijesti)
ADMIN_EMAIL=tim@ecommerce.hr

# Vercel Cron zaštita
CRON_SECRET=...
```

Nađi Supabase ključeve u: **Supabase Dashboard → Settings → API**

> **Napomena**: `projects.ts` ima hardkodirane URL-ove i anon ključeve za 2025 i 2026 kao fallback kad env varijable nisu postavljene. Service role ključevi moraju ostati isključivo u env varijablama.

---

## Pokretanje lokalno

```bash
# 1. Idi u dev direktorij
cd cro-commerce-portal/cro-commerce-portal

# 2. Instaliraj dependencije
npm install

# 3. Kreiraj .env.local s gore navedenim varijablama (uključi RESEND_API_KEY!)

# 4. Pokreni dev server
npm run dev
# → http://localhost:3000
```

---

## Migracije — kako pokrenuti

1. Idi na **Supabase Dashboard → SQL Editor → New query**
2. Kopiraj sadržaj migracije (iz `supabase/` foldera)
3. Klikni **Run**
4. Ponovi za svaki projekt (2025 i 2026)

### Redoslijed migracija (kronološki)

```
migration_001_initial.sql              ← Inicijalne tablice
migration_002_nullable_sponsor_benefit ← Nullable sponsor_id na benefitima
migration_003_optional_deadline        ← Opcijski rok i assigned_to
migration_004_task_benefit_category    ← Kategorija zadataka i benefita
migration_005_project_settings         ← Tablice project_settings i project_admins
migration_006_sponsor_contacts         ← Tablica sponsor_contacts
migration_007_program_budget           ← Tablice program_sessions i budget_items
migration_008_project_id               ← Kolona project_id na program/budget tablicama
migration_009_email_system             ← Tablice email_templates, email_automations, email_logs + reminder_email kolona
migration_010_package_types            ← Ažurirani tipovi paketa
migration_011_contact_notes            ← Napomene na kontaktima
migration_012_contact_company          ← Tvrtka na kontaktima
migration_013_sponsor_portal           ← Tablica sponsor_users + RLS politike + helper funkcije
migration_014_lead_status              ← Kolona lead_status na sponsors tablici
migration_015_contacts_partner_rls     ← RLS na sponsor_contacts: partneri mogu CRUD vlastite kontakte
migration_016_sponsor_contact_phone    ← Kolona contact_phone na sponsors tablici
migration_017_partial_payment          ← payment_status CHECK proširen s 'partial' (Djelomično plaćeno)
migration_017_enable_rls_all_tables    ← RLS na svim public tablicama + is_project_admin() helper funkcija
migration_018_benefit_description_contact_docs ← description + contact_person_id na sponsor_benefits; benefit_id na files
migration_019_contact_notification_trigger ← Postgres trigger: notifikacija pri dodavanju kontakta (SECURITY DEFINER)
migration_020_notifications_task_support   ← notifications.sponsor_id postaje nullable; dodaje task_id kolonu
migration_021_task_notification_trigger    ← Postgres trigger: notifikacija pri kreiranju zadatka s emailom (SECURITY DEFINER)
migration_022_fix_contact_notification_type ← Popravak triggera: samo 'ticket' tip → "Nova osoba za ulaznice"; ostali → "Dodan novi kontakt"
migration_023_extend_contact_type_check    ← CHECK constraint proširen: dozvoljava contact|ticket|partner|visitor|speaker|service_provider|brand_ambassador
migration_024_sponsor_amount               ← iznos NUMERIC(10,2) kolona na sponsors tablici
migration_031_budget_unconfirmed_status    ← budget_items CHECK proširen s 'unconfirmed' (Nepotvrđeno)
migration_032_default_benefit_contact      ← SET assigned_to = 'laura@ecommerce.hr' za sve benefite bez kontakta
migration_033_sync_primary_contacts        ← Sync: primarni kontakti iz sponsors.contact_name → sponsor_contacts
migration_034_partial_amount               ← partial_amount NUMERIC(10,2) kolona na sponsors tablici
migration_035_partner_login_notification_fn ← SECURITY DEFINER funkcija record_partner_login_notification() za INSERT u notifications zaobilazeći RLS; pokrenuti u OBJE baze
```

> **Napomena za migration_015**: Ako se pojavi greška "policy already exists", pokreni DROP IF EXISTS za sve politike pa ih recreiraj.

### Seed podaci za 2025

```sql
-- Pokreni samo za 2025 projekt!
-- seed_2025_program.sql — sav program + troškovi iz Google tablice
```

---

## Deployment na Vercel

### Automatski deploy
Push na `main` granu → Vercel automatski deploya.

```bash
git push origin main
```

### Ručni redeploy (bez promjena)
```bash
git commit --allow-empty -m 'Force redeploy'
git push
```

### Vercel konfiguracija
- **Root directory**: `/` (root repozitorija, ne subdirektorij)
- **Build command**: `next build`
- **Output directory**: `.next`
- **Node version**: 18+

### `.npmrc`
```
legacy-peer-deps=true
```
Potrebno zbog peer dependency konflikata s dnd-kit paketima.

---

## Autentikacija i pristup

### Admin korisnici
- Login: **email + lozinka** na `/login`
- Upravljanje kroz **Admin panel → Postavke → Pristup portalu**
- Novi admin korisnik se kreira u **obje baze** (2025 i 2026) i dodaje u `project_admins` tablicu
- Svi korisnici u `project_admins` imaju puni pristup admin panelu

### Sponzorski portal korisnici (partneri)
- Login: **email + lozinka** na `/partner` (namjenska stranica za sponzore)
- Korisnik mora biti u tablici `sponsor_users` (mapiranje `user_id` → `sponsor_id`)
- **Ne smije** biti u `project_admins` — inače će biti redirectan na admin panel
- Kreiranje: Admin panel → Postavke → Partneri → Novi partner (kreira u aktivnom projektu)
- Pozivnica putem admin panela: detalji sponzora → Kontakt osobe → mail ikona → `/api/portal/invite`
- Promjena lozinke partnera: Admin panel → Postavke → Partneri → ikona ključa na retku korisnika

```sql
-- Ručno dodavanje sponzor korisnika
INSERT INTO sponsor_users (user_id, sponsor_id)
VALUES ('uuid-korisnika', 'uuid-sponzora');

-- Potvrda emaila (ako nije potvrđen)
UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'uuid-korisnika';
```

### Arhitektura auth-a (važno!)

- **`middleware.ts`** — samo provjera je li korisnik **prijavljen**, koristi `getSession()` (čita cookie, bez network calla) s `Promise.race` timeoutom od 1200ms. Ne radi provjeru admin/sponzor liste.
- **`admin/layout.tsx`** — provjerava `project_admins` tablicu (server-side). Ako nije admin → redirect na `/portal`.
- **`portal/layout.tsx`** — provjerava `project_admins` (ako admin → `/admin/dashboard`), zatim `sponsor_users` (ako nema → sign out + `/login?error=no_access`). UUID korisnika se traži po emailu jer su UUID-ovi različiti između projekata.
- **`login/page.tsx`** — admin login, nakon prijave redirecta na `/admin/dashboard`.
- **`partner/page.tsx`** — partner login. Poziva `findPartnerProject(email)` server action da pronađe u kojoj bazi postoji email, pa kreira **jedan** `createBrowserClient` za točan projekt.

> **Važno**: Ne pokušavati raditi DB upite sa service role klijentom u `middleware.ts` — Edge runtime ne može pristupiti `SUPABASE_SERVICE_ROLE_KEY`.

> **Važno**: `createBrowserClient` iz `@supabase/ssr` je **singleton po modulu** — drugi poziv s različitim URL-om vraća isti (prvi) klijent. Uvijek kreirati samo jedan klijent po modulu, ili koristiti server action za određivanje projekta.

### Promjena projekta — admin
- Cookie `cro_active_project` (`'2026'` | `'2025'`)
- `switchProject` server action radi **token exchange** server-side:
  1. Čita korisnika iz TRENUTNOG projekta
  2. Provjerava access u ciljanom projektu (`project_admins`)
  3. Generira magic link u ciljanom projektu → fetchuje server-side → izvlači tokene
  4. Postavlja novu sesiju via `setSession` → cookie store
  5. Postavlja `cro_active_project` cookie
  6. Vraća `"dashboard"` ili `"login"` string — klijent navigira s `window.location.href`
- `window.location.href` (full page reload) resetira `createBrowserClient` singleton

### Promjena projekta — partner (sponzorski portal)
- Gumb "Prebaci na CRO Commerce 20XX" vidljiv samo ako partner postoji u obje baze
- `switchPortalProject(targetProjectId)` — isti token exchange flow kao admin switch
- Partner mora imati account u oba projekta + `sponsor_users` unos u oba projekta

### Supabase konfiguracija za projekt switch
U **oba** Supabase projekta (2025 i 2026):
- **Authentication → URL Configuration → Redirect URLs**: dodati `https://eventorganizzer.vercel.app/auth/callback`
- **Authentication → URL Configuration → Site URL**: `https://eventorganizzer.vercel.app`

---

## Branching strategija

- `main` — produkcija (Vercel deploya odavde)
- Direktni commit na main je OK za ovaj projekt

```bash
git add .
git commit -m "Opis promjene"
git push origin main
```

---

## Implementirane funkcionalnosti

### Sponzori
- **Prijave u portal** — kartica na stranici sponzora prikazuje povijest prijava partnera (email + datum+sat, max 20); dohvat iz `notifications` where `title='Prijava partnera'` and `sponsor_id=id`; email se parsira regex-om `/\(([^)]+@[^)]+)\)/` iz poruke
- Lista sponzora s tražilicom (`?q=` URL param) — naziv tvrtke je klikabilan link na profil
- **Multi-select filter paketa** (`PackageTypeManager`) — comma-separated `?package=Zlatni,Srebrni` URL param; × ikonica se prikazuje samo na aktivnom filteru i uklanja ga; olovka gumb → edit mode (rename/delete po kategoriji)
- **Multi-select filter plaćanja** — comma-separated `?payment=paid,partial` URL param; klik na pill togglea status (dodaje/uklanja); "Svi" resetira sve; kompatibilno s postojećim linkovima. Helper `parseList()` i `togglePayment()` u `sponsors/page.tsx`
- **Paket sort redoslijed** u AddSponsorModal i PackageTypeManager: Nedefinirano → Glavni → Zlatni → Srebrni → Brončani → Medijski → Community → custom (alfabetski). Default u AddSponsorModal = "Nedefinirano"
- **Lead status filter** — `?lead=cold_lead` itd., s obojenim badge-evima u tablici
- Detaljna stranica sponzora (`/admin/sponsors/[id]`) — prikazuje lead_status badge
- Edit forma (`EditSponsorForm`) s paketom, kontaktom, **brojem mobitela** (`contact_phone`), statusom plaćanja, **lead statusom** i **djelomično plaćenim iznosom**
- **Primarni kontakt — inline edit** (`AdminPrimaryContactEdit`) u sekciji Informacije na stranici sponzora — hover olovka, uređivanje direktno bez otvaranja modala
- Upload datoteka po sponzoru (Supabase Storage) — odvojene od datoteka po benefitu
- **Brisanje sponzora** s potvrdom (`DeleteSponsorButton`) — redirect na `/admin/sponsors`
- **Multi-select bulk edit** (`SponsorsTableWithSelect`) — checkbox stupac; bulk action bar s dropdownima za Paket/Plaćanje/Status; server action `bulkUpdateSponsors`
- **Iznos stupac** u tablici — formatiran kao EUR; graceful degradation u EditSponsorForm
- **Djelomično plaćeno** (`partial_amount`) — polje vidljivo u EditSponsorForm i AddSponsorModal samo kada je `payment_status = 'partial'`; prikazuje preostali iznos (`iznos − partial_amount`) ispod polja; graceful degradation (retry bez partial_amount ako kolona ne postoji)

### Benefiti
- Kliktabilne stat kartice — filtriranje po statusu via `?status=X` URL param
- **Dodavanje benefita** (`AddBenefitModal`) — dropdown s postojećim nazivima + opcija "Dodaj novi"; dropdown admin emailova za "Kontakt osoba (za partnera)"; default = `laura@ecommerce.hr`
- **Edit benefit** (`EditBenefitDialog` i `EditBenefitModal`):
  - "Kontakt osoba (za partnera)" — dropdown admin emailova, default `laura@ecommerce.hr`
  - "Kontakt osoba (od partnera)" — prikazuje **sve** kontakte sponzora (nije ograničeno na type='contact'); primarni kontakt sortiran na **prvo mjesto** i označen s **★**; automatski **pre-selektiran** ako benefit nema dodijeljen kontakt; matching po imenu (case-insensitive) + fallback po emailu
- Tražilica (client-side, pretražuje naziv i sponzora)
- **Po kategoriji** — horizontalni tabovi (Glavni, Zlatni, Srebrni...); svaki tab prikazuje broj partnera; hover tooltip ispisuje sve partnere; sekcije **sklopljene** po defaultu
- **Auto-scroll na vrh** pri otvaranju svakog modala
- **"Zadnji podsjetnik"** — datum zadnjeg poslanog maila vidljiv u accordion headeru
- **Brisanje po sponzoru** — Trash2 ikona na hover; inline Da/Ne potvrda; briše specifičan `benefit.id`
- **Dodavanje sponzora benefitu** — "+" gumb na dnu razvijenog AccordionGroup
- **Grupni edit benefita** (`RenameBenefitDialog`) — naziv i rok za sve sponzore te grupe odjednom

### Benefit-level dokumenti (migration_018)
- Nova komponenta `BenefitFileUpload` — upload/brisanje datoteka vezanih za specifični benefit
- Upload na putanju `{sponsor_id}/benefits/{benefit_id}/{timestamp}_{filename}`
- `files` tablica: `benefit_id IS NULL` = datoteke sponzora; `benefit_id IS NOT NULL` = dokumenti benefita
- Admin: EditBenefitModal i EditBenefitDialog prikazuju BenefitFileUpload
- Portal: `PortalBenefitCard` prikazuje opis, kontakt osobu i downloadable dokumente
- **Graceful degradation**: sve stranice rade i bez migration_018

### Email obavijesti za benefite
- Gumb **"Pošalji obavijest"** u `EditBenefitDialog`
- Poziva `/api/benefits/[id]/notify` — šalje mail odgovornoj osobi
- **Subject**: `CRO Commerce [GODINA] - Podsjetnik za [naziv benefita]` (godina iz cookieja `cro_active_project`)
- Nakon slanja: upisuje zapis u `email_logs` + `router.refresh()` — badge se odmah prikazuje
- Tablica `email_logs` koristi kolonu `sent_at` (ne `created_at`)
- FROM adresa: `konferencija@ecommerce.hr` (verificirana domena na Resend)

### Kontakti (`/admin/contacts`)
- Stranica koristi **`createAdminClient()`** (service role) da zaobiđe RLS — inače admini vide 0 kontakata jer nisu u `sponsor_users`
- **Auto-sync primarnih kontakata**: pri svakom učitavanju stranice, provjerava se `sponsors.contact_name` i insertaju nedostajući kontakti u `sponsor_contacts` (type='contact') — migration_033 radi isti posao jednom u bazi
- Filter po tipu, sponzoru i tražilica; bulk delete
- Email ćelija u tablici = **link na profil kontakta** (ne mailto:)
- **Dodavanje kontakta** (`AddContactModal`) — tip, sponzor (dropdown), ime, firma, email, telefon, funkcija, napomena
- **Uređivanje kontakta** (`ContactDetailActions`) — isti podaci + sponzor dropdown; graceful degradation za `notes`
- Detaljna stranica `/admin/contacts/[id]` — `TYPE_LABELS` mapa za ispravne oznake tipa

### Kontakti sponzora (admin — stranica sponzora)
- Dvije sekcije: **Kontakt osobe** i **Osobe za ulaznice**
- Inline dodavanje, uređivanje i brisanje
- **Mail ikona** na hover — šalje Supabase pozivnicu za sponzorski portal + upisuje `sponsor_users`

### Sponzorski portal (`/portal`)
- Login na `/partner` — namjenska stranica s "Prijava za sponzore" dizajnom; nakon uspješnog logina bilježi `recordPartnerLogin`
- **Homepage: `/portal/sponsor`** (Partner) — `/portal` redirecta ovdje
- Nav redoslijed: **Partner → Benefiti → Program → CRO Commerce 2025 (Video)** + projekt switcher + jezik toggle
- **`/portal/sponsor`** (tab Informacije): primarni kontakt (editable inline), kontakt osobe (CRUD), osobe za ulaznice (CRUD)
- **`/portal/sponsor`** (tab Dokumenti) — read-only lista datoteka sponzora
- **`/portal/sponsor`** (tab Vaš paket / Opcije suradnje) — usporedba paketa; "Vaš paket" za Glavni/Zlatni/Srebrni/Brončani, "Opcije suradnje" za ostale
- **`/portal/benefits`** — read-only benefiti s progress barom, filterom, opisom, kontaktom i dokumentima
- **`/portal/program`** — read-only program, tabovi po pozornici
- **`/portal/video`** — embed CRO Commerce 2025 YouTube plejliste
- Pristup samo korisnicima u `sponsor_users` tablici; admini → `/admin/dashboard`
- **i18n HR/EN**: gumb za promjenu jezika u sidebar footeru; localStorage persistenca; `useLang()` hook u svim portal komponentama
- **`translatePackage(lang, packageType)`** — helper za prevođenje naziva paketa (Brončani→Bronze, Srebrni→Silver, Zlatni→Gold, Glavni→Main, Medijski→Media)

### Upravljanje partnerima (Postavke)
- `PartnerManagementSection` — lista partner korisnika s delete + promjena lozinke
- Novi partner: ime, email, lozinka, sponzor (kreira u aktivnom projektu)
- Prikaz deduplikacira po emailu i preskače orphaned `sponsor_users` unose

### Upload datoteka
- Komponenta `FileUploadSection` — drag & drop ili odabir datoteka za sponzora
- Komponenta `BenefitFileUpload` — upload za specifični benefit
- Upload na Supabase Storage bucket `sponsor-files`
- Prikazuje vidljivi error u UI ako upload ne uspije

### Program konferencije
- Admin: `/admin/program` — tabovi po pozornici, CRUD sesija + tražilica
- Portal: `/portal/program` — isti prikaz, read-only
- Timeline prikaz grupiran po vremenskim slotovima; paralelne sesije side-by-side

### Troškovi eventa
- Stranica `/admin/troskovi`
- Status plaćanja: `paid | pending | overdue | partial | unconfirmed` (Nepotvrđeno dodano migration_031)
- Tablica s filterom po statusu + tražilica; CRUD; izolacija po `project_id`

### Nadzorna ploča (Dashboard)
- **5 summary kartica** (gore): Profitabilnost, Plaćeno (troškovi), **Ukupni troškovi** (zbroj svih stavki), Naplaćeno, Neplaćeno
- **Profitabilnost** = `(Naplaćeno + Neplaćeno) − Ukupni troškovi`
- **Naplaćeno** = `sum(iznos za paid)` + `sum(partial_amount za partial)`; link → `?payment=paid,partial`; subtitle: "X plaćenih + Y djelomičnih" kad ima djelomičnih
- **Neplaćeno** = `sum(iznos za pending/overdue/ostalo)` + `sum(iznos − partial_amount za partial)`; link → `?payment=overdue,partial,pending&type=clients`
- **Partneri po paketu** — prikazuje postotak plaćenih za svaki paket (zelena progress bar); link → `/admin/sponsors`; samo potvrđeni sponzori
- **Status plaćanja** — tortni prikaz; samo potvrđeni sponzori
- **Isporuka benefita** — kružni progress chart
- Tablice: nedavno uređeni partneri + **nedavne prijave partnera** (naziv tvrtke, email, datum+sat) + nedavno dodani kontakti

### Zadaci
- Kanban board — kliktabilni naslovi kartica vode na detaljnu stranicu
- Detaljna stranica zadatka (`/admin/tasks/[id]`) — prikaz svih podataka + edit + delete
- **Inbox notifikacija pri dodjeli**: Postgres trigger (`migration_021`) automatski upisuje notifikaciju

### Inbox obavijesti
- Ruta `/admin/inbox` — tabovi: **Novi zadatak / Novi kontakt / Nova osoba za ulaznice / Prijave partnera / Sve obavijesti**
- Badge s brojem nepročitanih vidljiv u sidebaru
- Per-user read tracking via `notification_reads` tablica
- Akcije: označi kao pročitano / nepročitano (po notifikaciji), označi sve kao pročitano
- **Brisanje po notifikaciji** (trash ikona) — vidljivo samo za `marcel@ecommerce.hr`
- **Obriši sve** (gumb u headeru, s Da/Ne potvrdom) — vidljivo samo za `marcel@ecommerce.hr`; briše sve zapise iz baze; nitko ih više ne vidi
- **Prijava partnera** (tab narančaste boje, `LogIn` ikona): `recordPartnerLogin(userId, email, projectId)` server action se poziva iz `/partner` nakon uspješnog logina; prikazuje naziv tvrtke i email; link na profil sponzora
- **Svi inbox upiti koriste `createAdminClientForProject(projectId)`** — `createAdminClient()` iz `@supabase/ssr` ne zaobilazi RLS pouzdano za `notifications` tablicu

### Rokovnik
- Ruta `/admin/calendar`
- Godišnji pregled svih zadataka iz DB-a po rokovima i mjesecima
- Filtar po odgovornoj osobi; klik otvara modal s detaljima + inline edit + brisanje

### Upravljanje korisnicima (Postavke)
- `UserManagementSection` — lista admin korisnika s edit i delete
- Kreiranje u **svim Supabase bazama** (2025 i 2026) automatski

### UI
- Svi modalni prozori otvaraju se pri **vrhu viewporta** (`items-start pt-8`) + `<main>` se scrolla na vrh pri svakom otvaranju
- Modali koriste fixed overlay s Tailwind klasama (ne `<dialog>` element)
- Naslov aplikacije: `EventOrganizzer - CRO Commerce Conference`

---

## Poznati detalji i napomene

- `cro-commerce-portal/cro-commerce-portal/` je lokalni dev dir — datoteke se uvijek kopiraju u root `src/` prije commita
- `router.refresh()` koristi se za re-fetch server komponenti nakon mutacija
- `useState + useEffect([initial])` pattern koristi se u klijentskim komponentama za sync s novim props-ima
- Graceful degradation: sve stranice rade i bez migriranih tablica (try/catch s fallbackom)
- **Scroll container** u admin layoutu je `<main className="overflow-y-auto">` — koristiti `document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" })` za scroll na vrh pri otvaranju modala; ne koristiti `window`
- **Resend SDK** vraća `{ data, error }` — ne baca exception. Uvijek provjeriti `error` nakon `resend.emails.send()`
- `email_logs.sent_at` je timestamp kolona (ne `created_at`) — query i order moraju koristiti `sent_at`
- `RESEND_API_KEY` mora biti postavljen i u Vercel env i u lokalnom `.env.local`
- **Supabase join** vraća array u TypeScript tipu ali objekt u runtime — koristiti `Array.isArray(raw) ? raw[0] : raw` za sigurno castanje
- **`useSearchParams()`** mora biti unutar `<Suspense>` wrappera u Next.js 14 App Routeru
- **Storage bucket** `sponsor-files` mora biti kreiran kao Public u Supabase Dashboard + RLS politike za `authenticated` korisnike
- **`createBrowserClient` singleton**: `@supabase/ssr` kešira klijent po modulu — nikad ne pozivati s dva različita URL-a u istom modulu
- **Admin i partner projekt switch** rade identično — server-side token exchange: `admin.generateLink` → `fetch(url, {redirect:"manual"})` → parse Location header → `setSession`
- **UUID-ovi korisnika su različiti** između projekata (2025 i 2026 su zasebne Supabase instance)
- **Orphaned `sponsor_users` unosi** (bez matching auth usera) se preskaču u prikazu na settings stranici
- `NEXT_PUBLIC_APP_URL` mora biti postavljen na `https://eventorganizzer.vercel.app` — koristi se za `redirectTo` u magic link generaciji
- **`updatePrimaryContact` server action** koristi admin klijent za update `contact_name/email/phone` na `sponsors` tablici — vraća `{ error: string | null }` (ne baca exception)
- **`sponsor_contacts` RLS** (migration_015): partneri mogu SELECT/INSERT/UPDATE/DELETE samo za vlastiti `sponsor_id` (via `get_my_sponsor_id()` helper funkcija). **Admini nemaju unos u `sponsor_users`**, pa `createClient()` (browser) vraća 0 kontakata za admina — koristiti `createAdminClient()` na server komponentama koje prikazuju kontakte adminu
- **`contact_phone` kolona** dodana migration_016 — nije bila u inicijalnoj shemi
- **Server action error pattern**: server actions ne smiju bacati exception — koristiti `return { error: message }` pattern
- **Inline edit pattern** (`AdminPrimaryContactEdit`, `PrimaryContactSection`): `useState displayed` za optimistički prikaz, `useEffect` za sync s props-ima
- **Graceful degradation pattern** za nove kolone: probati s novim kolonama; na error retry bez novih kolona; `as any` cast za TypeScript
- **Brisanje benefita**: Trash2 ikona briše specifičan `sponsor_benefits` zapis po `id` — ne sve zapise s istim `benefit_name`
- **Spread operater na `Set`** (`[...new Set(...)]`) zahtijeva `downlevelIteration` — umjesto toga koristiti `forEach` + ručno deduplicirani array
- **Notifikacije — koristiti Postgres trigere, NE JS klijent**: `createServerClient` s service role keyem ne bypassira RLS pouzdano za INSERT u `notifications`. Jedino sigurno rješenje je Postgres trigger s `SECURITY DEFINER`. Iznimka: `recordPartnerLogin` koristi `createAdminClientForProject` (direktni `createClient` iz `@supabase/supabase-js`, ne `createServerClient`) koji pouzdano bypassira RLS
- **`recordPartnerLogin` pattern**: prima `userId` (iz `signInWithPassword` response — ne treba `listUsers`!); awaita se u `partner/page.tsx` PRIJE `router.push` (fire-and-forget može biti prekinut navigacijom); email se parsira iz poruke regex-om `/\(([^)]+@[^)]+)\)/` na dashboardu i sponsor profilu
- **KRITIČNO — `createAdminClient()` vs `createAdminClientForProject()`**: `createAdminClient()` iz `@/lib/supabase/server` koristi `createServerClient` iz `@supabase/ssr` koji je **podložan RLS** i ne garantira pristup project-specifičnim tablicama. Za sve upite na `notifications`, `notification_reads`, `project_admins` i slične RLS-zaštićene tablice **uvijek koristiti `createAdminClientForProject(projectId)`** iz `adminProjectClient.ts`. `admin/layout.tsx`, `admin/inbox/page.tsx`, `admin/dashboard/page.tsx`, `admin/sponsors/[id]/page.tsx` i sve notification server akcije koriste `createAdminClientForProject`
- **`getProjectAdminClient()` helper** u `actions/notifications.ts`: čita `PROJECT_COOKIE`, razrješava `projectId`, vraća `createAdminClientForProject(projectId)` — koristi se u svim notification server akcijama (markRead, markUnread, delete, markAll)
- **Portal i18n**: `LanguageProvider` u `context/LanguageContext.tsx`; `useLang()` hook vraća `{ lang, toggleLang, t }`. Prijevodi u `lib/i18n/portal.ts`. `translatePackage(lang, type)` za nazive paketa — za nepoznate pakete vraća izvorni naziv. Svi portal klijentski komponenti koriste `useLang()`
- **`notifications` tablica**: `sponsor_id` nullable (od migration_020), `task_id` nullable UUID FK. Inbox query uključuje `task_id` — obavezno pokrenuti migration_020
- **`sponsor_contacts.type` CHECK constraint** (migration_006) originalno ima samo `contact` i `ticket` — migration_023 proširuje. Bez te migracije, spremanje kontakta s novim tipom tiho faila
- **`ContactDetailActions` graceful degradation**: retry update bez `notes` ako kolona ne postoji
- **`RenameBenefitDialog` useEffect sync**: koristiti `useEffect(() => { if (currentName) setName(currentName); }, [currentName])` — komponenta ostaje mountirana s `currentName=null` kad je zatvoren
- **Kontakt tipovi — `TYPE_LABELS` mapa**: koristiti u svim komponentama. Ne koristiti ternary jer ne pokriva nove tipove
- **Bulk select pattern** (`SponsorsTableWithSelect`): `useState<Set<string>>`; `useTransition` za non-blocking server action; bulk action bar `sticky top-0 z-10`. Lead status `"__clear__"` = sentinel za brisanje (šalje `null`)
- **`iznos` kolona** (migration_024): EditSponsorForm ima graceful degradation — ako update s `iznos` vrati grešku, retry bez. Kritično: bez migration_024 cijeli update tiho faila
- **`partial_amount` kolona** (migration_034): `NUMERIC(10,2) DEFAULT NULL`; vidljivo u formama samo kad `payment_status = 'partial'`; graceful degradation — retry bez `partial_amount` ako kolona ne postoji. Naplaćeno na dashboardu = `sum(iznos za paid) + sum(partial_amount za partial)`; Neplaćeno = ostalo + `sum(iznos − partial_amount za partial)`
- **Multi-select filter plaćanja** (`sponsors/page.tsx`): `parseList()` (dijeli comma-separated string), `togglePayment()` (dodaje/uklanja iz aktivnog seta); identičan pattern kao package filter. URL: `?payment=paid,partial` itd.
- **Dashboard kartice**: Profitabilnost = prihodi − `budgetAll`; Naplaćeno → `?payment=paid,partial`; Neplaćeno → `?payment=overdue,partial,pending&type=clients`; "Partneri po paketu" = paid/total po paketu s postotkom, samo potvrđeni
- **EditBenefitDialog/Modal — primarni kontakt**: fetchuje sve kontakte sponzora (bez type filtera) + `sponsors.contact_name` i `contact_email`; matching: ime (case-insensitive trim) → fallback email; primarni sort prvi + ★ u dropdownu; pre-select kad `contact_person_id` je prazan. Ako kontakt nije u `sponsor_contacts`, pokrenuti migration_033
- **Inbox brisanje** (samo `marcel@ecommerce.hr`): `DeleteNotificationButton` (inline Da/Ne po notifikaciji) + `DeleteAllNotificationsButton` (header, briše sve iz baze); korisnik email se dohvaća u server komponenti (`inbox/page.tsx`) i prosljeđuje kao prop
- **`deleteAllNotifications` server action**: koristi `.neq("id", "00000000-...")` jer Supabase zahtijeva WHERE uvjet za DELETE (ne može obrisati sve bez filtera)
