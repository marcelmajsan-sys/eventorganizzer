# CRO Commerce Admin Portal — Dokumentacija

## Što aplikacija radi

Admin portal za upravljanje CRO Commerce konferencijom. Omogućuje:

- Praćenje sponzora, njihovih paketa i statusa plaćanja
- Upravljanje benefitima sponzora s rokovima i statusima
- Kontakt osobe i osobe za ulaznice po sponzoru
- Upload datoteka po sponzoru
- Program konferencije po pozornicama (Future / Action / Wonderland Stage)
- Praćenje troškova eventa s budžetom i statusima plaćanja
- Zadaci (Kanban board) s detaljnim stranicama po zadatku
- Rokovnik — godišnji pregled zadataka po rokovima s filtrom po odgovornoj osobi
- Postavke projekta (datum konferencije, upravljanje korisnicima)
- **Multi-projekt**: CRO Commerce 2026 i 2025 — prebacivanje bez ponovnog logina

Deployano na: https://eventorganizzer.vercel.app

---

## Struktura repozitorija

```
eventorganizzer/
├── src/                          ← Vercel deploya odavde (root)
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx        ← Auth guard + sidebar layout
│   │   │   ├── dashboard/        ← Nadzorna ploča
│   │   │   ├── sponsors/         ← Lista + detalji sponzora
│   │   │   ├── benefits/         ← Svi benefiti (filter po statusu via ?status=)
│   │   │   ├── program/          ← Program konferencije
│   │   │   ├── troskovi/         ← Troškovi eventa
│   │   │   ├── tasks/            ← Kanban zadaci
│   │   │   │   └── [id]/         ← Detaljna stranica zadatka
│   │   │   ├── calendar/         ← Rokovnik (zadaci po rokovima)
│   │   │   └── settings/         ← Datum konferencije + upravljanje korisnicima
│   │   ├── actions/
│   │   │   ├── switchProject.ts  ← Server action: promjena projekta
│   │   │   ├── projectSettings.ts ← Server action: datum konferencije
│   │   │   └── userManagement.ts ← Server action: CRUD korisnika u svim bazama
│   │   ├── api/
│   │   │   ├── cron/reminders/   ← Cron job za email podsjetnike
│   │   │   └── sponsors/         ← REST API za sponzore
│   │   ├── login/                ← Login stranica (email + lozinka)
│   │   └── portal/               ← Sponzorski portal (javni)
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── ProjectSwitcher.tsx
│   │   │   ├── ProjectSettingsForm.tsx
│   │   │   ├── UserManagementSection.tsx ← CRUD korisnika (modal)
│   │   │   ├── CalendarView.tsx          ← Rokovnik (zadaci + edit modal)
│   │   │   ├── TaskDetailActions.tsx     ← Edit/delete na stranici zadatka
│   │   │   ├── BenefitsView.tsx
│   │   │   ├── BudgetView.tsx
│   │   │   ├── ProgramView.tsx
│   │   │   ├── ContactsSection.tsx
│   │   │   ├── FileUploadSection.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── AddBenefitModal.tsx
│   │   │   ├── AddSponsorModal.tsx
│   │   │   ├── AddTaskModal.tsx
│   │   │   ├── EditSponsorForm.tsx
│   │   │   ├── EditBenefitModal.tsx
│   │   │   ├── EditBenefitDialog.tsx
│   │   │   ├── RenameBenefitDialog.tsx
│   │   │   ├── BenefitStatusSelect.tsx
│   │   │   └── DeleteBenefitButton.tsx
│   │   └── portal/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         ← Browser Supabase klijent
│   │   │   ├── server.ts         ← Server Supabase klijent (SSR)
│   │   │   ├── projects.ts       ← Konfiguracija projekata (2025/2026)
│   │   │   └── adminProjectClient.ts ← Service role klijent za bilo koji projekt
│   │   ├── email.ts              ← Resend email helper
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
│   └── seed_2025_program.sql     ← Seed podaci za 2025 (program + troškovi)
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
| `sponsor_benefits` | Benefiti sponzora s rokovima i statusima |
| `sponsor_contacts` | Kontakt osobe i osobe za ulaznice po sponzoru |
| `files` | Upload datoteke vezane za sponzore |
| `tasks` | Kanban zadaci |
| `notifications` | Obavijesti |
| `packages` | Paketi sponzorstva |
| `project_settings` | Postavke po projektu (datum konferencije: ključevi `conference_date_2026`, `conference_date_2025`) |
| `project_admins` | Email adrese koje imaju pristup portalu |
| `program_sessions` | Sesije programa konferencije (s `project_id`) |
| `budget_items` | Stavke troškova (s `project_id`) |

### Tipovi paketa
`'Glavni' | 'Zlatni' | 'Srebrni' | 'Brončani' | 'Medijski' | 'Community'`

### Tipovi statusa benefita
`'not_started' | 'in_progress' | 'completed' | 'overdue'`

### Tipovi statusa plaćanja
`'paid' | 'pending' | 'overdue'`

### Izolacija podataka po projektu
Tablice `program_sessions` i `budget_items` koriste `project_id TEXT` kolonu (`'2025'` ili `'2026'`) za izolaciju podataka između projekata. Ostale tablice (sponzori, benefiti, zadaci) koriste zasebne Supabase instance ako su konfigurirani zasebni URL-ovi.

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

# URL aplikacije
NEXT_PUBLIC_APP_URL=https://eventorganizzer.vercel.app

# Admin email (prima cron obavijesti)
ADMIN_EMAIL=tim@cro-commerce.hr

# Vercel Cron zaštita
CRON_SECRET=...
```

Nađi Supabase ključeve u: **Supabase Dashboard → Settings → API**

---

## Pokretanje lokalno

```bash
# 1. Idi u dev direktorij
cd cro-commerce-portal/cro-commerce-portal

# 2. Instaliraj dependencije
npm install

# 3. Kreiraj .env.local s gore navedenim varijablama

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

- Login: email + lozinka na `/login`
- Korisnici se upravljaju kroz **Admin panel → Postavke → Pristup portalu**
- Novi korisnik se kreira u **obje baze** (2025 i 2026) i dodaje u `project_admins` tablicu u obje baze
- Svi korisnici u tablici `project_admins` imaju puni pristup admin panelu

### Arhitektura auth-a (važno!)
- **`middleware.ts`** radi samo provjeru je li korisnik **prijavljen** (koristi anon key koji radi u Edge runtimeu). Ne radi provjeru admin liste — service role ključevi nisu dostupni u Edge runtimeu.
- **`admin/layout.tsx`** radi provjeru je li korisnik u `project_admins` tablici (server-side, ima pristup service role ključevima). Ako nije, redirecta na `/portal`.
- **`login/page.tsx`** nakon uspješne prijave uvijek redirecta na `/admin/dashboard` — layout.tsx dalje gatekeepa.

### Promjena projekta
- Cookie `cro_active_project` (`'2026'` | `'2025'`)
- Prebacivanje bez ponovnog logina putem ProjectSwitcher komponente u sidebaru

---

## Branching strategija

- `main` — produkcija (Vercel deploya odavde)
- Direktni commit na main je OK za ovaj projekt

```bash
git add .
git commit -m "Opis promjene"
git push
```

---

## Promjene napravljene na projektu

### Inicijalno
- Upload inicijalnog koda
- Fix `.gitignore` (isključi `node_modules`, `.next`, `.env.local`)
- Postavljanje `.npmrc` (`legacy-peer-deps=true`) zbog dnd-kit konflikata
- Premještanje koda u root za Vercel deployment

### Autentikacija i projekti
- **Multi-projekt podrška**: zasebni Supabase klijenti za 2025/2026 s environment varijablama
- **Prebacivanje projekata** bez ponovnog logina
- **ProjectSwitcher** komponenta u sidebaru
- **Postavke projekta** (`/admin/settings`): promjena datuma konferencije
- **Datum konferencije** prikazuje broj dana do/od konferencije
- Fix zasebnih ključeva za datum po projektu (`conference_date_2026`, `conference_date_2025`)

### Auth fix (kritično)
- **Problem**: `SUPABASE_SERVICE_ROLE_KEY` nije dostupan u Edge middleware runtimeu → `project_admins` query uvijek failao → fallback na 3 hardkodirana emaila
- **Fix**: middleware provjerava samo autentikaciju; `admin/layout.tsx` provjerava admin listu server-side
- **Fix**: `login/page.tsx` više ne sadrži hardkodirani popis emailova — svi korisnici redirectaju na `/admin/dashboard`
- **Fix**: `createUserInAllProjects` upisuje u `project_admins` u **svim** projektima (ne samo defaultnom)

### Login
- Promijenjen naziv subtitle iz "CRO Commerce Sponzorski portal 2025" u "Admin portal"

### Sponzori
- Tražilica (`?q=` URL param) na stranici sponzora
- Detaljna stranica sponzora (`/admin/sponsors/[id]`)

### Benefiti
- **Kliktabilne stat kartice** — filtriranje po statusu via `?status=X` URL param
- **Dodavanje benefita s benefiti stranice** (nije samo iz detalja sponzora)
- **Multi-select sponzori** i **kategorije sponzorstva** pri dodavanju benefita
- Edit benefit modal (inline edit + rename dialog)
- Tražilica na stranici benefita (client-side)

### Kontakti sponzora (`migration_006`)
- Dvije sekcije: **Kontakt osobe** i **Osobe za ulaznice**
- Inline dodavanje, uređivanje i brisanje

### Program konferencije (`migration_007`, `migration_008`)
- Stranica `/admin/program`
- Tabovi po pozornici: Sve / Future Stage / Action Stage / Wonderland Stage
- Timeline prikaz; paralelne sesije side-by-side
- CRUD: dodaj/uredi/briši sesiju
- Seed podaci iz Google tablice (CRO Commerce 2025 program)

### Troškovi eventa (`migration_007`, `migration_008`)
- Stranica `/admin/troskovi`
- 4 summary kartice: Ukupni budžet, Plaćeno, Na čekanju, Preostalo
- CRUD: dodaj/uredi/briši stavku
- Seed podaci (18 stavki)
- Izolacija po projektu putem `project_id` kolone

### Zadaci
- **Kanban board** — kliktabilni naslovi kartica vode na detaljnu stranicu
- **Detaljna stranica zadatka** (`/admin/tasks/[id]`) — prikaz svih podataka + edit + delete
- **`AddTaskModal` pojednostavljen** — uklonjena polja Sponzor, Benefit, Kategorija sponzorstva

### Rokovnik (nekad "Kalendar")
- Preimenovan iz "Kalendar aktivnosti" u **"Rokovnik"** (ruta ostaje `/admin/calendar`)
- Prikazuje **samo zadatke iz DB-a** (nema hardkodiranih statičnih događaja)
- Subtitle: "Niže se prikazuju rokovi za sve zadatke po svim mjesecima u godini."
- **Filtar po odgovornoj osobi** — gumbi s imenima iz `assigned_to` polja zadataka
- Klikom na zadatak otvara se modal s detaljima + inline edit (naziv, opis, rok, status, odgovorna osoba) + brisanje

### Upravljanje korisnicima (Postavke)
- **`UserManagementSection`** — lista korisnika s edit i delete
- **Novi korisnik** modal: ime, email, lozinka (s show/hide)
- **Uredi korisnika** modal: ime, email, opcijska nova lozinka
- Kreiranje u **svim Supabase bazama** (2025 i 2026) automatski
- Korisnici se dodaju u `project_admins` u **svim projektima**

### UI poboljšanja
- Svi modalni prozori otvaraju se pri **vrhu viewporta** (`items-start pt-8`) umjesto na sredini

---

## Poznati detalji i napomene

- `cro-commerce-portal/cro-commerce-portal/` subdirektorij je lokalni dev dir — datoteke se uvijek moraju kopirati u root `src/` prije commita na main
- Ako je samo jedna Supabase instanca (isti URL za 2025 i 2026), `program_sessions` i `budget_items` tablice koriste `project_id` za izolaciju; ostale tablice (sponzori itd.) dijele podatke
- Modali ne koriste `<dialog>` element nego fixed overlay s Tailwind klasama
- `router.refresh()` se koristi za re-fetch server komponenti nakon mutacija
- Graceful degradation: sve stranice rade i bez migriranih tablica (try/catch s fallbackom)
- **Edge middleware ne može pristupiti `SUPABASE_SERVICE_ROLE_KEY`** — ne pokušavati raditi DB upite sa service role klijentom u `middleware.ts`
