# CRO Commerce Admin Portal — Dokumentacija

## Što aplikacija radi

Admin portal za upravljanje CRO Commerce konferencijom. Omogućuje:

- Praćenje sponzora, njihovih paketa i statusa plaćanja
- Upravljanje benefitima sponzora s rokovima i statusima
- Email obavijesti za benefite s praćenjem zadnjeg slanja
- Kontakt osobe i osobe za ulaznice po sponzoru
- Upload datoteka po sponzoru (Supabase Storage bucket `sponsor-files`)
- Program konferencije po pozornicama (Future / Action / Wonderland Stage)
- Praćenje troškova eventa s budžetom i statusima plaćanja
- Zadaci (Kanban board) s detaljnim stranicama po zadatku
- Rokovnik — godišnji pregled zadataka po rokovima s filtrom po odgovornoj osobi
- Postavke projekta (datum konferencije, upravljanje korisnicima)
- **Multi-projekt**: CRO Commerce 2026 i 2025 — prebacivanje bez ponovnog logina
- **Sponzorski portal** — read-only portal za sponzore na `/portal` i `/partner`

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
│   │   │   ├── program/          ← Program konferencije
│   │   │   ├── troskovi/         ← Troškovi eventa
│   │   │   ├── tasks/            ← Kanban zadaci
│   │   │   │   └── [id]/         ← Detaljna stranica zadatka
│   │   │   ├── calendar/         ← Rokovnik (zadaci po rokovima)
│   │   │   └── settings/         ← Datum konferencije + upravljanje korisnicima + partneri
│   │   ├── actions/
│   │   │   ├── switchProject.ts      ← Admin projekt switch + portal projekt switch (server-side)
│   │   │   ├── projectSettings.ts    ← Server action: datum konferencije
│   │   │   ├── userManagement.ts     ← Server action: CRUD admin korisnika u svim bazama
│   │   │   ├── partnerManagement.ts  ← Server action: CRUD partner korisnika (sponsor_users)
│   │   │   └── findPartnerProject.ts ← Server action: pronađi u kojoj bazi postoji email
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
│   │       ├── layout.tsx        ← Auth: admin → /admin/dashboard, bez pristupa → /login?error=no_access
│   │       ├── page.tsx          ← Redirect na /portal/benefits
│   │       ├── benefits/         ← Read-only lista benefita s filterom po statusu
│   │       └── sponsor/          ← Read-only info o sponzoru (kontakti, datoteke)
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── ProjectSwitcher.tsx
│   │   │   ├── ProjectSettingsForm.tsx
│   │   │   ├── UserManagementSection.tsx     ← CRUD admin korisnika (modal)
│   │   │   ├── PartnerManagementSection.tsx  ← CRUD partner korisnika (modal)
│   │   │   ├── CalendarView.tsx              ← Rokovnik (zadaci + edit modal)
│   │   │   ├── TaskDetailActions.tsx         ← Edit/delete na stranici zadatka
│   │   │   ├── BenefitsView.tsx              ← Prikaz benefita + scroll-to-top pri otvaranju modala
│   │   │   ├── BudgetView.tsx
│   │   │   ├── ProgramView.tsx
│   │   │   ├── ContactsSection.tsx           ← Kontakti + mail ikona za slanje portal pozivnice
│   │   │   ├── FileUploadSection.tsx         ← Upload na Supabase Storage (sponsor-files bucket)
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── AddBenefitModal.tsx
│   │   │   ├── AddSponsorModal.tsx
│   │   │   ├── AddTaskModal.tsx
│   │   │   ├── EditSponsorForm.tsx
│   │   │   ├── EditBenefitModal.tsx
│   │   │   ├── EditBenefitDialog.tsx         ← Edit + slanje obavijesti (router.refresh() nakon notify)
│   │   │   ├── RenameBenefitDialog.tsx
│   │   │   ├── BenefitStatusSelect.tsx
│   │   │   ├── DeleteBenefitButton.tsx
│   │   │   └── DeleteSponsorButton.tsx       ← Brisanje sponzora s potvrdom
│   │   └── portal/
│   │       ├── PortalSidebar.tsx             ← Sidebar s navom: Benefiti, Sponzor + projekt switcher
│   │       └── PortalBenefitCard.tsx         ← Read-only benefit kartica
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← Browser Supabase klijent
│   │   │   ├── server.ts             ← Server Supabase klijent (SSR)
│   │   │   ├── projects.ts           ← Konfiguracija projekata (2025/2026) — URL-ovi hardkodirani
│   │   │   └── adminProjectClient.ts ← Service role klijent za bilo koji projekt
│   │   ├── email.ts              ← Resend email helper (deadline reminder, welcome mail)
│   │   └── utils.ts              ← Utility funkcije (boje, formatiranje)
│   ├── middleware.ts              ← Auth guard (samo autentikacija, ne autorizacija)
│   └── types/index.ts
├── supabase/                     ← SQL migracije
│   ├── migration_001_initial.sql
│   ├── migration_002_nullable_sponsor_benefit.sql
│   ├── migration_003_optional_deadline_assigned_to.sql
│   ├── migration_004_task_benefit_category.sql
│   ├── migration_005_project_settings.sql
│   ├── migration_006_sponsor_contacts.sql
│   ├── migration_007_program_budget.sql
│   ├── migration_008_project_id.sql
│   ├── migration_009_email_system.sql    ← email_templates, email_automations, email_logs, reminder_email
│   ├── migration_010_package_types.sql
│   ├── migration_011_contact_notes.sql
│   ├── migration_012_contact_company.sql
│   └── migration_013_sponsor_portal.sql ← sponsor_users tablica + RLS politike za portal
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
| `sponsors` | Sponzori — naziv, paket, kontakt, status plaćanja |
| `sponsor_benefits` | Benefiti sponzora s rokovima, statusima, `reminder_email`, `assigned_to` |
| `sponsor_contacts` | Kontakt osobe i osobe za ulaznice po sponzoru |
| `sponsor_users` | Mapiranje auth korisnika → sponsor_id (za sponzorski portal) |
| `files` | Upload datoteke vezane za sponzore |
| `tasks` | Kanban zadaci |
| `notifications` | Obavijesti |
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

### Tipovi statusa benefita
`'not_started' | 'in_progress' | 'completed' | 'overdue'`

### Tipovi statusa plaćanja
`'paid' | 'pending' | 'overdue'`

### Izolacija podataka po projektu
Tablice `program_sessions` i `budget_items` koriste `project_id TEXT` kolonu (`'2025'` ili `'2026'`) za izolaciju podataka između projekata. Ostale tablice (sponzori, benefiti, zadaci) koriste zasebne Supabase instance ako su konfigurirani zasebni URL-ovi.

---

## Supabase Storage

### Bucket: `sponsor-files`
- Tip: **Public bucket**
- Koristi se za upload datoteka po sponzoru
- Putanja uploada: `{sponsor_id}/{timestamp}_{filename}`

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
4. Ponovi za svaki projekt (2025 i 2026) ako dijele istu bazu

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
migration_013_sponsor_portal           ← Tablica sponsor_users + RLS politike za portal
```

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

```sql
-- Ručno dodavanje sponzor korisnika
INSERT INTO sponsor_users (user_id, sponsor_id)
VALUES ('uuid-korisnika', 'uuid-sponzora');

-- Potvrda emaila (ako nije potvrđen)
UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'uuid-korisnika';
```

### Arhitektura auth-a (važno!)

- **`middleware.ts`** — samo provjera je li korisnik **prijavljen**. Ne radi provjeru admin/sponzor liste (service role ključevi nisu dostupni u Edge runtimeu).
- **`admin/layout.tsx`** — provjerava `project_admins` tablicu (server-side). Ako nije admin → redirect na `/portal`.
- **`portal/layout.tsx`** — provjerava `project_admins` (ako admin → `/admin/dashboard`), zatim `sponsor_users` (ako nema → sign out + `/login?error=no_access`). UUID korisnika se traži po emailu jer su UUID-ovi različiti između projekata.
- **`login/page.tsx`** — admin login, nakon prijave redirecta na `/admin/dashboard`.
- **`partner/page.tsx`** — partner login. Poziva `findPartnerProject(email)` server action da pronađe u kojoj bazi postoji email, pa kreira **jedan** `createBrowserClient` za točan projekt. Izbjegava singleton problem `@supabase/ssr`.

> **Važno**: Ne pokušavati raditi DB upite sa service role klijentom u `middleware.ts` — Edge runtime ne može pristupiti `SUPABASE_SERVICE_ROLE_KEY`.

> **Važno**: `createBrowserClient` iz `@supabase/ssr` je **singleton po modulu** — drugi poziv s različitim URL-om vraća isti (prvi) klijent. Uvijek kreirati samo jedan klijent po modulu, ili koristiti server action za određivanje projekta.

### Promjena projekta — admin
- Cookie `cro_active_project` (`'2026'` | `'2025'`)
- Prebacivanje bez ponovnog logina putem `ProjectSwitcher` komponente u sidebaru

### Promjena projekta — partner (sponzorski portal)
- Gumb "Prebaci na CRO Commerce 20XX" vidljiv samo ako partner postoji u obje baze (`sponsor_users` u oba projekta)
- `switchPortalProject(targetProjectId)` server action radi **sve server-side**:
  1. Generira magic link u target projektu (`admin.generateLink`)
  2. Fetchuje action_link server-side s `redirect: "manual"`
  3. Izvlači `access_token` + `refresh_token` iz `Location` headera (implicit flow)
  4. Poziva `setSession` server-side → cookie store prima novu sesiju
  5. Postavlja `cro_active_project` cookie
  6. Vraća `true` — klijent radi `window.location.href = "/portal/benefits"`
- **Nema browser magic link redirecta** — sve se izvršava server-side, bez `/auth/callback` roundtripa
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
- Lista sponzora s tražilicom (`?q=` URL param) — naziv tvrtke je klikabilan link na profil
- Detaljna stranica sponzora (`/admin/sponsors/[id]`)
- Edit forma s paketom, kontaktom, statusom plaćanja
- Upload datoteka po sponzoru (Supabase Storage)
- **Brisanje sponzora** s potvrdom (`DeleteSponsorButton`) — redirect na `/admin/sponsors`

### Benefiti
- Kliktabilne stat kartice — filtriranje po statusu via `?status=X` URL param
- Dodavanje benefita s benefiti stranice (multi-select sponzori + kategorije)
- Edit benefit modal (`EditBenefitDialog`) — inline edit, rename, slanje obavijesti
- Tražilica (client-side, pretražuje naziv i sponzora)
- **Auto-scroll na vrh** pri otvaranju edit modala (`document.querySelector("main")?.scrollTo`)
- **"Zadnji podsjetnik"** — datum zadnjeg poslanog maila vidljiv u accordion headeru benefita

### Email obavijesti za benefite
- Gumb **"Pošalji obavijest"** u `EditBenefitDialog`
- Poziva `/api/benefits/[id]/notify` — šalje mail odgovornoj osobi
- **Subject**: `CRO Commerce [GODINA] - Podsjetnik za [naziv benefita]` (godina iz cookieja `cro_active_project`)
- **Tijelo**: "Poštovani, podsjećamo vas na rok za korištenje benefita [naziv]..."
- Nakon slanja: upisuje zapis u `email_logs` + `router.refresh()` — badge se odmah prikazuje
- Tablica `email_logs` koristi kolonu `sent_at` (ne `created_at`)
- FROM adresa: `konferencija@ecommerce.hr` (verificirana domena na Resend)

### Kontakti sponzora
- Dvije sekcije: **Kontakt osobe** i **Osobe za ulaznice**
- Inline dodavanje, uređivanje i brisanje
- **Mail ikona** na hover — šalje Supabase pozivnicu za sponzorski portal + upisuje `sponsor_users`

### Sponzorski portal (`/portal`)
- Login na `/partner` — namjenska stranica s "Prijava za sponzore" dizajnom
- Sidebar s navom: **Benefiti** i **Sponzor** + gumb za promjenu projekta (ako postoji u oba)
- **`/portal/benefits`** — read-only lista benefita s progress barom, kliktabilne status kartice za filter (`?status=X`), prikaz roka, napomena i odgovorne osobe
- **`/portal/sponsor`** — read-only info: naziv, paket, status plaćanja, kontakt osobe, osobe za ulaznice, datoteke
- Pristup samo korisnicima u `sponsor_users` tablici
- Admin korisnici se automatski redirectaju na `/admin/dashboard`

### Upravljanje partnerima (Postavke)
- `PartnerManagementSection` — lista partner korisnika s delete
- Novi partner: ime, email, lozinka, sponzor (kreira u aktivnom projektu)
- Prikaz deduplikacira po emailu i preskače orphaned `sponsor_users` unose (bez matching auth usera)

### Upload datoteka
- Komponenta `FileUploadSection` — drag & drop ili odabir datoteka
- Upload na Supabase Storage bucket `sponsor-files`
- Prikazuje vidljivi error u UI ako upload ne uspije
- Datoteke vidljive i na sponzorskom portalu (`/portal/sponsor`)

### Program konferencije
- Stranica `/admin/program`
- Tabovi po pozornici: Sve / Future Stage / Action Stage / Wonderland Stage
- Timeline prikaz grupiran po vremenskim slotovima; paralelne sesije side-by-side
- Badge za tip sesije (Predavanje, Panel, Fireside, Keynote, Pauza, Networking)
- CRUD: dodaj/uredi/briši sesiju + tražilica

### Troškovi eventa
- Stranica `/admin/troskovi`
- 4 summary kartice: Ukupni budžet, Plaćeno (s progress barom), Na čekanju, Preostalo
- Tablica s filterom po statusu + tražilica
- CRUD: dodaj/uredi/briši stavku
- Izolacija po projektu putem `project_id` kolone

### Zadaci
- Kanban board — kliktabilni naslovi kartica vode na detaljnu stranicu
- Detaljna stranica zadatka (`/admin/tasks/[id]`) — prikaz svih podataka + edit + delete
- `AddTaskModal` — polja: naziv, opis, rok, status, odgovorna osoba

### Rokovnik
- Ruta `/admin/calendar`
- Godišnji pregled svih zadataka iz DB-a po rokovima i mjesecima
- Filtar po odgovornoj osobi (gumbi s imenima iz `assigned_to`)
- Klik na zadatak otvara modal s detaljima + inline edit + brisanje

### Upravljanje korisnicima (Postavke)
- `UserManagementSection` — lista admin korisnika s edit i delete
- Novi korisnik modal: ime, email, lozinka (s show/hide)
- Uredi korisnika modal: ime, email, opcijska nova lozinka
- Kreiranje u **svim Supabase bazama** (2025 i 2026) automatski

### UI
- Svi modalni prozori otvaraju se pri **vrhu viewporta** (`items-start pt-8`)
- Modali koriste fixed overlay s Tailwind klasama (ne `<dialog>` element)
- Klik na benefit red skrola stranicu na vrh (`<main>` element, ne `window`)
- Naslov aplikacije: `EventOrganizzer - CRO Commerce Conference`

---

## Poznati detalji i napomene

- `cro-commerce-portal/cro-commerce-portal/` je lokalni dev dir — datoteke se uvijek kopiraju u root `src/` prije commita
- `router.refresh()` koristi se za re-fetch server komponenti nakon mutacija
- `useState + useEffect([initial])` pattern koristi se u klijentskim komponentama za sync s novim props-ima
- Graceful degradation: sve stranice rade i bez migriranih tablica (try/catch s fallbackom)
- Ako je samo jedna Supabase instanca, `program_sessions` i `budget_items` koriste `project_id` za izolaciju; ostale tablice dijele podatke
- **Scroll container** u admin layoutu je `<main className="overflow-y-auto">` — koristiti `document.querySelector("main")` za programatski scroll, ne `window`
- **Resend SDK** vraća `{ data, error }` — ne baca exception. Uvijek provjeriti `error` nakon `resend.emails.send()`
- `email_logs.sent_at` je timestamp kolona (ne `created_at`) — query i order moraju koristiti `sent_at`
- `RESEND_API_KEY` mora biti postavljen i u Vercel env i u lokalnom `.env.local`
- **Supabase join** vraća array u TypeScript tipu ali objekt u runtime — koristiti `Array.isArray(raw) ? raw[0] : raw` za sigurno castanje
- **`useSearchParams()`** mora biti unutar `<Suspense>` wrappera u Next.js 14 App Routeru
- **Storage bucket** `sponsor-files` mora biti kreiran kao Public u Supabase Dashboard + RLS politike za `authenticated` korisnike
- **`createBrowserClient` singleton**: `@supabase/ssr` kešira klijent po modulu — nikad ne pozivati s dva različita URL-a u istom modulu. Koristiti `findPartnerProject` server action za određivanje projekta prije kreiranja klijenta
- **Portal projekt switch** ide potpuno server-side: `admin.generateLink` → `fetch(url, {redirect:"manual"})` → parse Location header → `setSession`. Ne koristi browser redirect niti `/auth/callback` stranicu
- **UUID-ovi korisnika su različiti** između projekata (2025 i 2026 su zasebne Supabase instance). `portal/layout.tsx` traži korisnika po emailu u admin API, ne po UUID-u iz sesije
- **Orphaned `sponsor_users` unosi** (bez matching auth usera) se preskaču u prikazu na settings stranici
- `NEXT_PUBLIC_APP_URL` mora biti postavljen u Vercel env varijablama na `https://eventorganizzer.vercel.app` — koristi se za `redirectTo` u magic link generaciji
