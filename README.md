# CRO Commerce Event Organizer

Interni admin portal za upravljanje CRO Commerce konferencijom. Izgrađen s Next.js 14, Supabase i Tailwind CSS.

**Live:** https://eventorganizzer.vercel.app

---

## Što aplikacija radi

- **Sponzori** — praćenje sponzora, paketa i statusa plaćanja
- **Benefiti** — upravljanje benefitima sponzora s rokovima i statusima (nije početo / u tijeku / završeno / kasni)
- **Kontakti** — kontakt osobe i osobe za ulaznice po sponzoru
- **Upload datoteka** — dokumenti vezani za sponzore
- **Program** — program konferencije po pozornicama (Future / Action / Wonderland Stage)
- **Troškovi** — praćenje troškova eventa s budžetom i statusima plaćanja
- **Zadaci** — Kanban board (Za napraviti / U tijeku / Završeno)
- **Rokovnik** — godišnji pregled svih zadataka po rokovima s filtrom po odgovornoj osobi
- **Postavke** — datum konferencije, upravljanje korisnicima (dodavanje, uređivanje, brisanje)
- **Multi-projekt** — CRO Commerce 2026 i 2025, prebacivanje bez ponovnog logina

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Baza podataka | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + lozinka) |
| Styling | Tailwind CSS |
| Drag & drop | @dnd-kit (Kanban) |
| Email | Resend |
| Deployment | Vercel |

---

## Pokretanje lokalno

```bash
# Dev direktorij
cd cro-commerce-portal/cro-commerce-portal

# Instaliraj dependencije
npm install

# Kreiraj .env.local (pogledaj .env.example)
cp ../../.env.example .env.local

# Pokreni
npm run dev
# → http://localhost:3000
```

---

## Environment varijable

```env
# Supabase — CRO Commerce 2026
NEXT_PUBLIC_SUPABASE_URL_2026=
NEXT_PUBLIC_SUPABASE_ANON_KEY_2026=
SUPABASE_SERVICE_ROLE_KEY_2026=

# Supabase — CRO Commerce 2025
NEXT_PUBLIC_SUPABASE_URL_2025=
NEXT_PUBLIC_SUPABASE_ANON_KEY_2025=
SUPABASE_SERVICE_ROLE_KEY_2025=

# Fallback (ako _2026/_2025 nisu postavljeni)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://eventorganizzer.vercel.app
ADMIN_EMAIL=tim@cro-commerce.hr
CRON_SECRET=
```

Supabase ključeve naći ćeš u: **Supabase Dashboard → Settings → API**

---

## Baza podataka

### Tablice

| Tablica | Opis |
|---|---|
| `sponsors` | Sponzori — naziv, paket, kontakt, status plaćanja |
| `sponsor_benefits` | Benefiti sponzora s rokovima i statusima |
| `sponsor_contacts` | Kontakt osobe i osobe za ulaznice po sponzoru |
| `files` | Upload datoteke vezane za sponzore |
| `tasks` | Kanban zadaci |
| `program_sessions` | Sesije programa konferencije (s `project_id`) |
| `budget_items` | Stavke troškova (s `project_id`) |
| `project_settings` | Datum konferencije po projektu |
| `project_admins` | Korisnici s pristupom portalu |

### Tipovi paketa
`Glavni` · `Zlatni` · `Srebrni` · `Brončani` · `Medijski` · `Community`

### Statusi benefita
`not_started` · `in_progress` · `completed` · `overdue`

### Statusi plaćanja
`paid` · `pending` · `overdue`

### Migracije (kronološki redoslijed)

```
supabase/migration_001_initial.sql
supabase/migration_002_nullable_sponsor_benefit.sql
supabase/migration_003_optional_deadline_assigned_to.sql
supabase/migration_004_task_benefit_category.sql
supabase/migration_005_project_settings.sql
supabase/migration_006_sponsor_contacts.sql
supabase/migration_007_program_budget.sql
supabase/migration_008_project_id.sql
```

**Pokretanje:** Supabase Dashboard → SQL Editor → New query → kopiraj sadržaj → Run.
Ponovi za oba projekta (2025 i 2026) ako dijele istu bazu.

---

## Autentikacija i pristup

- Login: email + lozinka na `/login`
- Korisnici se upravljaju kroz **Admin panel → Postavke → Pristup portalu**
- Novi korisnik se automatski kreira u obje baze (2025 i 2026)
- Svi korisnici u tablici `project_admins` imaju puni pristup admin panelu

### Promjena projekta
Cookie `cro_active_project` (`2026` | `2025`) — prebacivanje bez ponovnog logina putem ProjectSwitcher komponente u sidebaru.

---

## Deployment

```bash
# Push na main → automatski deploy na Vercel
git push origin main

# Ručni redeploy (bez promjena koda)
git commit --allow-empty -m 'Force redeploy'
git push
```

### Vercel konfiguracija
- Root directory: `/`
- Build command: `next build`
- Output: `.next`
- Node: 18+

---

## Email podsjetnici (Cron)

Vercel Cron pokreće `/api/cron/reminders` svaki dan u 8:00 UTC.

| Kada | Kome | Sadržaj |
|---|---|---|
| 30 dana prije roka | Sponzoru | Prijateljski podsjetnik |
| 7 dana prije roka | Sponzoru | Urgentni email |
| Dan nakon roka | Admin timu | Alert s detaljima kašnjenja |

---

## Struktura repozitorija

```
eventorganizzer/
├── src/                          ← Vercel deploya odavde (root)
│   ├── app/
│   │   ├── admin/                ← Admin panel (zaštićeno auth-om)
│   │   │   ├── layout.tsx        ← Auth guard + sidebar
│   │   │   ├── dashboard/
│   │   │   ├── sponsors/
│   │   │   ├── benefits/
│   │   │   ├── program/
│   │   │   ├── troskovi/
│   │   │   ├── tasks/
│   │   │   ├── calendar/
│   │   │   └── settings/
│   │   ├── actions/              ← Server actions (mutacije)
│   │   ├── api/                  ← REST API + cron job
│   │   ├── login/
│   │   └── portal/               ← Sponzorski portal (javni)
│   ├── components/
│   │   ├── admin/                ← Admin UI komponente
│   │   └── portal/               ← Portal UI komponente
│   ├── lib/
│   │   ├── supabase/             ← Supabase klijenti (client/server/admin)
│   │   ├── email.ts
│   │   └── utils.ts
│   └── middleware.ts             ← Auth guard
├── supabase/                     ← SQL migracije
├── cro-commerce-portal/          ← Lokalni dev direktorij (kopija src/)
├── .env.example
├── .npmrc                        ← legacy-peer-deps=true (dnd-kit)
└── CLAUDE.md                     ← Interne upute za AI asistenta
```

> **Napomena:** Postoje dvije kopije koda — `src/` (root, Vercel deploya odavde) i `cro-commerce-portal/cro-commerce-portal/src/` (lokalni dev). Nakon svake promjene u lokalnom dev direktoriju, datoteke je potrebno kopirati u root `src/` prije commita.

---

© 2025–2026 CRO Commerce · Sva prava pridržana
