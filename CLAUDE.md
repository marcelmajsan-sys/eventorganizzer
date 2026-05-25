# CRO Commerce Admin Portal — Dokumentacija

## Što aplikacija radi

Admin portal za upravljanje CRO Commerce konferencijom:
- Sponzori, paketi, plaćanja, benefiti s rokovima i statusima
- Email obavijesti za benefite (Resend), upload datoteka (Supabase Storage `sponsor-files`)
- Program konferencije, troškovi, Kanban zadaci, rokovnik, inbox obavijesti
- **Multi-projekt**: CRO Commerce 2026 i 2025 (prebacivanje bez ponovnog logina)
- **Sponzorski portal** na `/portal` i `/partner` (HR/EN i18n, editable kontakti)

Deployano na: https://eventorganizzer.vercel.app

> **Dvije kopije koda**: `src/` (root, Vercel) i `cro-commerce-portal/cro-commerce-portal/src/` (lokalni dev). Nakon promjene u lokalnom dev direktoriju, kopiraj u root `src/` prije commita.

---

## Pokretanje lokalno

```bash
cd cro-commerce-portal/cro-commerce-portal
npm install
# Kreiraj .env.local (vidi sekciju Environment varijable)
npm run dev   # → http://localhost:3000
```

---

## Ključne rute i komponente

| Ruta | Opis |
|------|------|
| `/admin/dashboard` | Nadzorna ploča |
| `/admin/sponsors` | Lista sponzora (multi-select bulk edit) |
| `/admin/sponsors/[id]` | Detaljna stranica sponzora |
| `/admin/benefits` | Svi benefiti (filter `?status=`) |
| `/admin/contacts` | Svi kontakti (koristi `createAdminClient`) |
| `/admin/contacts/[id]` | Detaljna stranica kontakta |
| `/admin/program` | Program konferencije |
| `/admin/troskovi` | Troškovi eventa |
| `/admin/tasks` / `/admin/tasks/[id]` | Kanban + detaljna stranica |
| `/admin/calendar` | Rokovnik (zadaci po rokovima) |
| `/admin/inbox` | Inbox obavijesti |
| `/admin/settings` | Datum, korisnici, partneri |
| `/login` | Admin login |
| `/partner` | Partner login |
| `/portal/*` | Sponzorski portal |

**Ključne server actions** (`src/app/actions/`):
- `switchProject.ts` — token exchange za admin i partner projekt switch
- `userManagement.ts` — CRUD admin korisnika u svim bazama
- `partnerManagement.ts` — CRUD partner korisnika + `updatePrimaryContact`
- `notifications.ts` — markRead/Unread/All, delete, `recordPartnerLogin`
- `contactActions.ts` — `deleteContact()` + `deleteDuplicateContacts()` (koristi `createAdminClientForProject`)
- `sponsorBulkUpdate.ts` — bulk update paketa/plaćanja/statusa
- `findPartnerProject.ts` — pronađi u kojoj bazi postoji email

---

## Baza podataka (Supabase)

### Tablice

| Tablica | Opis |
|---------|------|
| `sponsors` | Naziv, paket, `contact_name/email/phone`, `lead_status`, `iznos`, `partial_amount`, payment_status |
| `sponsor_benefits` | Benefiti — rokovi, statusi, `reminder_email`, `assigned_to`, `description`, `contact_person_id` |
| `sponsor_contacts` | Kontakt osobe i osobe za ulaznice po sponzoru |
| `sponsor_users` | Mapiranje `user_id → sponsor_id` (za portal) |
| `files` | Upload — `sponsor_id` i/ili `benefit_id` |
| `tasks` | Kanban zadaci |
| `notifications` | `sponsor_id` (nullable), `task_id` (nullable), `title`, `message` |
| `notification_reads` | Per-user read tracking |
| `program_sessions` | Program konferencije (`project_id`) |
| `budget_items` | Troškovi (`project_id`) |
| `email_logs` | Log poslanih mailova — timestamp kolona je **`sent_at`** (ne `created_at`) |
| `email_templates` / `email_automations` | Predlošci i automatizacije podsjetnika |
| `project_settings` | Datum konferencije (`conference_date_2026`, `conference_date_2025`) |
| `project_admins` | Email adrese s admin pristupom |
| `packages` | Paketi sponzorstva |

### Enumeracije

**Tipovi paketa**: `'Glavni' | 'Zlatni' | 'Srebrni' | 'Brončani' | 'Medijski' | 'Community'`
**Sort redoslijed**: Nedefinirano → Glavni → Zlatni → Srebrni → Brončani → Medijski → Community → custom (alfab.)

**Status benefita**: `'not_started' | 'in_progress' | 'completed' | 'overdue'`

**Status plaćanja**: `'paid' | 'pending' | 'overdue' | 'partial'`
- `partial` = Djelomično plaćeno; `partial_amount` kolona sadrži plaćeni iznos

**Status troškova**: `'pending' | 'paid' | 'cancelled' | 'unconfirmed'`

**Lead status**: `'cold_lead'(plava) | 'hot_lead'(crvena) | 'confirmed_new'(zelena) | 'confirmed_returning'(ljubičasta)`

**Tipovi kontakata**: `'contact' | 'ticket' | 'partner' | 'visitor' | 'speaker' | 'service_provider' | 'brand_ambassador'`
- Koristiti `TYPE_LABELS` mapu (ne ternary) — pokriva sve tipove

### Izolacija po projektu
`program_sessions` i `budget_items` koriste `project_id TEXT` (`'2025'` | `'2026'`).
Ostale tablice su na zasebnim Supabase instancama.

---

## Autentikacija i arhitektura

### Tko ima pristup čemu
- **`middleware.ts`** — samo provjera je li korisnik prijavljen (`getSession()`, bez DB calla, timeout 1200ms)
- **`admin/layout.tsx`** — provjerava `project_admins` tablicu → nije admin → redirect `/portal`
- **`portal/layout.tsx`** — ako admin → `/admin/dashboard`; ako nema u `sponsor_users` → sign out + `/login?error=no_access`
- **`login/page.tsx`** — admin login → `/admin/dashboard`
- **`partner/page.tsx`** — partner login; poziva `findPartnerProject(email)` za točan projekt; bilježi `recordPartnerLogin`

### Projekt switch
Cookie `cro_active_project` (`'2026'` | `'2025'`). Token exchange flow:
1. Čita korisnika iz trenutnog projekta
2. Provjerava access u ciljanom projektu
3. Generira magic link → fetchuje server-side → izvlači tokene
4. `setSession` → cookie store → vraća `"dashboard"` ili `"login"`
5. Klijent navigira s `window.location.href` (full page reload, resetira `createBrowserClient` singleton)

### Supabase klijenti — KRITIČNO
- **`createAdminClient()`** (`@/lib/supabase/server`) — koristi `createServerClient` iz `@supabase/ssr`, **podložan RLS**
- **`createAdminClientForProject(projectId)`** (`adminProjectClient.ts`) — direktni `createClient` iz `@supabase/supabase-js`, **pouzdano bypassira RLS**
- Koristiti `createAdminClientForProject` za: `notifications`, `notification_reads`, `project_admins`, `contacts` (admin prikaz)
- **`createBrowserClient` je singleton po modulu** — nikad ne kreirati s dva različita URL-a u istom modulu

### Notifikacije — koristiti Postgres triggere
`createServerClient` s service role keyem ne bypassira RLS pouzdano za INSERT u `notifications`.
Jedino sigurno rješenje: Postgres trigger s `SECURITY DEFINER`.
Iznimka: `recordPartnerLogin` koristi `createAdminClientForProject` direktno.

### Partner login flow
`recordPartnerLogin(userId, email, projectId)` — prima `userId` iz `signInWithPassword` response.
Awaita se u `partner/page.tsx` PRIJE `router.push` (fire-and-forget može biti prekinut navigacijom).

---

## Environment varijable

```env
# Supabase — CRO Commerce 2026
NEXT_PUBLIC_SUPABASE_URL_2026=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_2026=...
SUPABASE_SERVICE_ROLE_KEY_2026=...

# Supabase — CRO Commerce 2025
NEXT_PUBLIC_SUPABASE_URL_2025=https://yyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_2025=...
SUPABASE_SERVICE_ROLE_KEY_2025=...

# Fallback (ako _2026/_2025 nisu postavljeni)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://eventorganizzer.vercel.app
ADMIN_EMAIL=tim@ecommerce.hr
CRON_SECRET=...
```

> `projects.ts` ima hardkodirane URL-ove i anon ključeve kao fallback. Service role ključevi moraju biti isključivo u env varijablama.

---

## Deployment

```bash
git add . && git commit -m "Opis" && git push origin main
# Vercel automatski deploya iz main grane
```

**Vercel config**: Root directory `/`, Build command `next build`, Node 18+, `.npmrc`: `legacy-peer-deps=true`

**Supabase config** (u oba projekta): Authentication → URL Configuration → Redirect URLs dodati `https://eventorganizzer.vercel.app/auth/callback`

---

## Ključne implementacijske napomene

- **Scroll container** u admin layoutu: `<main className="overflow-y-auto">` → koristiti `document.querySelector("main")?.scrollTo(...)`, ne `window`
- **Supabase join** vraća array u TS tipu ali objekt u runtime → koristiti `Array.isArray(raw) ? raw[0] : raw`
- **`useSearchParams()`** mora biti unutar `<Suspense>` wrappera (Next.js 14 App Router)
- **Resend SDK** vraća `{ data, error }`, ne baca exception — uvijek provjeriti `error`
- **Server action error pattern**: ne bacati exception → koristiti `return { error: message }`
- **`iznos` i `partial_amount`**: graceful degradation — retry bez kolone ako ne postoji
- **UUID-ovi korisnika su različiti** između 2025 i 2026 projekata (zasebne Supabase instance)
- **`NEXT_PUBLIC_APP_URL`** mora biti `https://eventorganizzer.vercel.app` — za `redirectTo` u magic link generaciji
- **Spread na `Set`** (`[...new Set(...)]`) zahtijeva `downlevelIteration` → koristiti `forEach` + ručni array
- **`getProjectAdminClient()` helper** u `actions/notifications.ts`: čita `PROJECT_COOKIE`, vraća `createAdminClientForProject(projectId)`
- **Dashboard**: Naplaćeno = `sum(iznos za paid) + sum(partial_amount za partial)`; Neplaćeno = ostalo + `sum(iznos − partial_amount za partial)`; Profitabilnost = prihodi − budgetAll
- **Email**: FROM adresa `konferencija@ecommerce.hr`; subject uključuje godinu iz cookieja `cro_active_project`
- **Portal i18n**: `useLang()` hook iz `LanguageContext`; prijevodi u `lib/i18n/portal.ts`; `translatePackage(lang, type)` za nazive paketa
- **EditBenefitDialog/Modal** — primarni kontakt: fetchuje sve kontakte sponzora (bez type filtera) + primarni; matching ime (case-insensitive) → fallback email; ★ oznaka + pre-select
- **Inbox brisanje** vidljivo samo za `marcel@ecommerce.hr`; `deleteAllNotifications` koristi `.neq("id", "00000000-...")` jer Supabase zahtijeva WHERE uvjet za DELETE

---

## Migracije

Popis svih SQL migracija: vidi [`MIGRATIONS.md`](./MIGRATIONS.md)

Kako pokrenuti: Supabase Dashboard → SQL Editor → New query → kopiraj migraciju → Run (ponovi za oba projekta).
