# CRO Commerce Admin Portal — Dokumentacija

## Što aplikacija radi

Admin portal za upravljanje CRO Commerce konferencijom:
- Sponzori, paketi, plaćanja, benefiti s rokovima i statusima
- Email obavijesti za benefite (Resend), upload datoteka (Supabase Storage `sponsor-files`)
- Program konferencije, troškovi, Kanban zadaci, rokovnik, inbox obavijesti
- **Multi-projekt**: CRO Commerce 2026 i 2025 (prebacivanje bez ponovnog logina)
- **Sponzorski portal** na `/portal` i `/partner` (HR/EN i18n, editable kontakti)

Deployano na: https://partners.ecommerce.hr

---

## Pokretanje lokalno

```bash
cd cro-commerce-portal/cro-commerce-portal
npm install
# Kreiraj .env.local (vidi sekciju Environment varijable)
npm run dev   # → http://localhost:3000
```

---

## Struktura repozitorija

```
eventorganizzer/
├── src/                                   ← Vercel deploya odavde (root kopija)
│   ├── app/
│   │   ├── page.tsx                       ← Partner login (`/`) — HR/EN toggle, findPartnerProject
│   │   ├── [slug]/                        ← Javna stranica ulaznice (QR), server component
│   │   ├── admin/
│   │   │   ├── page.tsx                   ← Admin login (`/admin`)
│   │   │   └── (protected)/               ← Sve admin stranice iza auth guarda
│   │   │       ├── layout.tsx             ← Provjera `project_admins`; scroll container `<main overflow-y-auto>`
│   │   │       ├── dashboard/ sponsors/[id]/ benefits/ contacts/[id]/
│   │   │       ├── ulaznice/ program/ troskovi/ tasks/[id]/ calendar/
│   │   │       └── email-predlosci/ automatizacija/ inbox/ settings/
│   │   ├── portal/                        ← Sponzorski portal
│   │   │   ├── layout.tsx                 ← admin → /admin/dashboard; bez pristupa → /api/auth/signout
│   │   │   └── sponsor/ benefits/ program/ video/
│   │   ├── actions/                       ← Server actioni (svi s guardom iz authGuards.ts)
│   │   │   ├── switchProject.ts  impersonate.ts  findPartnerProject.ts
│   │   │   ├── userManagement.ts  partnerManagement.ts  projectSettings.ts
│   │   │   ├── benefitActions.ts  contactActions.ts  ticketActions.ts
│   │   │   ├── sponsorBulkUpdate.ts  sponsorComments.ts  contractActions.ts
│   │   │   └── tasks.ts  notifications.ts  getAdminEmails.ts
│   │   ├── api/
│   │   │   ├── auth/signout/              ← Odjava iz OBA projekta (Route Handler smije pisati cookies)
│   │   │   ├── benefits/[id]/notify/ + remind/
│   │   │   ├── cron/reminders/ + comment-reminders/
│   │   │   └── portal/invite/
│   │   └── auth/callback/                 ← PKCE/implicit fallback pri zamjeni projekta
│   ├── components/
│   │   ├── admin/                         ← AdminSidebar, SponsorsTableWithSelect, BenefitsView,
│   │   │                                     ExportContactsButton, UlazniceActions, ImpersonateButton, …
│   │   └── portal/                        ← PortalSidebar, PortalContactsSection, PortalContractView,
│   │                                         PortalHelpModal, ImpersonationBanner, …
│   ├── context/LanguageContext.tsx        ← useLang() za portal i18n
│   ├── lib/
│   │   ├── supabase/                      ← client.ts, server.ts, projects.ts, adminProjectClient.ts
│   │   ├── authGuards.ts                  ← requireAdmin / requireSponsor / requireAdminOrSponsor
│   │   ├── impersonation.ts  ticketQuota.ts  slugUtils.ts
│   │   ├── i18n/portal.ts  email.ts  utils.ts
│   ├── middleware.ts                      ← Samo "je li prijavljen" (getSession, 1200ms) + PUBLIC_PATHS
│   └── types/index.ts
├── supabase/                              ← SQL migracije + seed/utility skripte (popis: MIGRATIONS.md)
├── public/generator.html                  ← Javni alat za vizuale, servira se na `/generator`
├── cro-commerce-portal/cro-commerce-portal/
│   └── src/                               ← Lokalni dev dir — kopija root `src/`
├── CLAUDE.md  MIGRATIONS.md  vercel.json  next.config.mjs  .npmrc
```

> **Dvije kopije koda**: `src/` (root, Vercel deploya odavde) i `cro-commerce-portal/cro-commerce-portal/src/` (lokalni dev). Nakon promjene u dev direktoriju **obavezno kopiraj u root `src/` prije commita** — inače promjena ne ode na produkciju. Dokumentacija (`CLAUDE.md`) se NE duplicira: postoji samo ova, root verzija.

---

## Ključne rute i komponente

| Ruta | Opis |
|------|------|
| `/admin/dashboard` | Nadzorna ploča |
| `/admin/sponsors` | Lista partnera (naslov "Partneri") — multi-select bulk edit; filteri Kategorija / Plaćanje / Status / Tip kontakta + tražilica; "Preuzmi kontakte" XLSX export u zaglavlju |
| `/admin/sponsors/[id]` | Detaljna stranica sponzora |
| `/admin/benefits` | Svi benefiti (filter `?status=`) |
| `/admin/contacts` | Svi kontakti (koristi `createAdminClient`) |
| `/admin/contacts/[id]` | Detaljna stranica kontakta |
| `/admin/ulaznice` | Sve ulaznice — sekcije "Ulaznice partnera" (`source='portal'`) i "Ručno dodane" (`source='admin'`, mogu imati partnera); "Preuzmi .xlsx" export u zaglavlju |
| `/admin/program` | Program konferencije |
| `/admin/email-predlosci` | Email predlošci (`email_templates`) |
| `/admin/automatizacija` | Automatizacije podsjetnika (`email_automations`) |
| `/admin/troskovi` | Troškovi eventa |
| `/admin/tasks` / `/admin/tasks/[id]` | Kanban + detaljna stranica |
| `/admin/calendar` | Rokovnik (zadaci po rokovima) |
| `/admin/inbox` | Inbox obavijesti |
| `/admin/settings` | Datum, korisnici, partneri |
| `/admin` | Admin login (`/login` je samo redirect u middlewareu — stranica ne postoji) |
| `/` | Partner login (`/partner` je samo redirect u middlewareu — stranica ne postoji) |
| `/portal/*` | Sponzorski portal — `sponsor` (Partner), `benefits`, `program`, `video` |
| `/[slug]` | Javna stranica ulaznice (QR link, server component, `sponsor_contacts.slug`) |
| `/generator` | Javni alat za generiranje vizuala govornika (statični `public/generator.html`, rewrite u `next.config.mjs`, `PUBLIC_PATHS` u middlewareu — bez prijave) |

**Ključne server actions** (`src/app/actions/`):
- **AUTORIZACIJA (obavezno)**: server actioni su javno pozivljivi POST endpointi, a admin klijenti bypassiraju RLS. Svaki admin action MORA početi s `requireAdmin()` iz `@/lib/authGuards` (vraća `{ok:false, error}` za ne-admine), portal actioni s `requireSponsor(sponsorId)` (provjera `sponsor_users`), a mješoviti s `requireAdminOrSponsor(sponsorId)`. `FALLBACK_ADMIN_EMAILS` i `SUPER_ADMIN_EMAIL` žive SAMO u `authGuards.ts` — ne duplicirati. Iznimka bez guarda: `findPartnerProject` (treba ga login stranica).
- `switchProject.ts` — token exchange za admin i partner projekt switch; `NEXT_PUBLIC_APP_URL` fallback je `https://partners.ecommerce.hr`
- `userManagement.ts` — CRUD admin korisnika u svim bazama
- `partnerManagement.ts` — CRUD partner korisnika + `updatePrimaryContact`; `createPartnerUser` šalje welcome email i logira u `email_logs`
- `notifications.ts` — markRead/Unread/All, delete, `recordPartnerLogin`
- `benefitActions.ts` — `updateBenefitStatus(benefitId, newStatus)`: update statusa benefita, revalidira `/admin/sponsors/[id]` i `/admin/benefits`
- `contactActions.ts` — `deleteContact(id)`: nullificira `contact_person_id` FK na benefitima prije brisanja; FK error za kontakte vezane uz portal korisnika. `deleteDuplicateContacts()`: briše duplikate po emailu (partner > ticket > contact prioritet), batch 50
- `sponsorBulkUpdate.ts` — bulk update paketa/plaćanja/statusa
- `findPartnerProject.ts` — pronađi u kojoj bazi postoji email
- `ticketActions.ts` — `createTicket(data)` (admin, `sponsor_id: null`, BEZ limita), `createSponsorTicket(sponsorId, data)` (partner portal, veže uz sponzora, **provjerava limit ulaznica iz benefita** — vidi `lib/ticketQuota.ts`), `bulkCreateTickets` (postoji, ali bulk upload UI je uklonjen), `deleteTicket`, `generateMissingSlugs`; svi generiraju jedinstveni QR slug via `makeUniqueSlug`

**Ključne API rute** (`src/app/api/`):
- `api/auth/signout` — GET `/api/auth/signout?redirect=...`: odjavljuje iz **oba projekta** (2025 i 2026) i redirecta; Route Handler može pisati cookies za razliku od Server Component layouta — koristiti ovdje umjesto `supabase.auth.signOut()` u layoutima **i sidebarima** (AdminSidebar/PortalSidebar zovu ovu rutu). `redirect` prima samo relativne putanje (open redirect zaštita)
- `api/benefits/[id]/notify` i `api/benefits/[id]/remind` — **requireAdmin**; notify čita podatke benefita iz baze po `params.id` (ne iz bodyja) i escapa HTML; remind uzima projekt iz cookieja; Resend `{error}` se provjerava prije upisa `sent` u `email_logs`
- `api/portal/invite` — **requireAdmin** (zove se samo iz admin UI-ja)
- `api/cron/reminders` — obrađuje **OBA** projekta; `CRON_SECRET` obavezan (500 ako fali); overdue admin alert šalje se samo za benefite koji su TEK SADA prešli u overdue (UPDATE ... .neq("status","overdue").select())

**Ključne portal komponente** (`src/components/portal/`):
- `PortalSidebar.tsx` — nav + projekt switcher + jezik toggle + `<PortalHelpModal />`
- `PortalHelpModal.tsx` — step-by-step wizard modal s uputama; `steps?` prop za buduću Supabase integraciju; svaki korak ima `preview` ReactNode koji prikazuje relevantan UI element; prijevodi u `lib/i18n/portal.ts` pod `help.*` ključevima
- `PortalBenefitsView.tsx`, `PortalPartnerTabs.tsx`, `PortalProgramView.tsx`, `PortalPageHeader.tsx`, `PortalLangProvider.tsx`
- `PortalContactsSection.tsx` — uređivanje primarnog kontakta, kontakt osoba i osoba za ulaznice; `AddTicketModal` otvara puni form (Ime, Email, Tvrtka, Kategorija, Tip ulaznice, Komentar) i poziva `createSponsorTicket`
- `PortalCollaborationOptions.tsx` — hardkodirani `PACKAGES` i `CATEGORIES` array za usporedbu paketa; broj ulaznica: Brončani 2, Srebrni 3, Zlatni 5, Glavni 10; dodavanje novog broja zahtijeva i18n entry (`cell.vipN` u HR i EN) + update `CATEGORIES`. To je MARKETINŠKA tablica — stvarni limit svakog partnera dolazi iz njegovih benefita (vidi Limit ulaznica dolje)
- **Limit ulaznica partnera** (`lib/ticketQuota.ts`): limit NIJE globalan po paketu nego se parsira iz naziva partnerovih `sponsor_benefits` — benefit čiji naziv sadrži `ulaznic|kotizacij|ticket` je ulaznički; broj = prva znamenka u nazivu (bez broja = 1); `VIP` u nazivu → VIP kvota, inače standard (npr. "2 VIP ulaznice", "5 kotizacija"). Enforcement je server-side u `createSponsorTicket` (vraća `{error}` kad je limit pun ili tip nije u benefitima); UI (`PortalContactsSection`) prikazuje "Iskorišteno: X/Y" badge i gasi gumb/tip kad je kvota puna. Admin unos (`createTicket`, `/admin/ulaznice`) NEMA limit. Ugovor (`PortalContractView`) prikazuje stvarne benefite partnera kad postoje; hardkodirani popis po paketu je samo fallback (VIP brojke usklađene s tablicom: 2/3/5/10)

---

## Baza podataka (Supabase)

### Tablice

| Tablica | Opis |
|---------|------|
| `sponsors` | Naziv, paket, `contact_name/email/phone`, `lead_status`, `iznos`, `partial_amount`, payment_status |
| `sponsor_benefits` | Benefiti — rokovi, statusi, `reminder_email`, `assigned_to`, `description`, `contact_person_id` |
| `sponsor_contacts` | Kontakt osobe i osobe za ulaznice po sponzoru; `source` kolona (`'admin'`\|`'portal'`, migration_039) bilježi tko je unio red |
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

**Status plaćanja**: `'paid' | 'pending' | 'overdue' | 'partial' | 'compensation'`
- `partial` = Djelomično plaćeno; `partial_amount` kolona sadrži plaćeni iznos
- `compensation` = Kompenzacija (nije naplativa — ne ulazi u dashboard "Neplaćeno")

**Status troškova**: `'pending' | 'paid' | 'cancelled' | 'unconfirmed'`

**Lead status**: `'cold_lead'(plava) | 'hot_lead'(crvena) | 'confirmed_new'(zelena) | 'confirmed_returning'(ljubičasta)`

**Tipovi kontakata**: `'contact' | 'ticket' | 'partner' | 'visitor' | 'speaker' | 'service_provider' | 'brand_ambassador'`
- Koristiti `TYPE_LABELS` mapu (ne ternary) — pokriva sve tipove

### Izolacija po projektu
`program_sessions` i `budget_items` koriste `project_id TEXT` (`'2025'` | `'2026'`).
Ostale tablice su na zasebnim Supabase instancama.

### Prije popravka bilo kojeg DB problema — VAŽNO
Prije ispravljanja bilo kojeg problema vezanog uz bazu: provjeri da je migracija STVARNO pokrenuta protiv live baze i potvrdi da je u pitanju ISPRAVAN Supabase projekt (paziti na zabunu **2025 vs 2026** — to su zasebne instance). Nikad ne pretpostavljaj da je migracija pokrenuta. Migracije se pokreću ručno u Supabase Dashboard → SQL Editor, i to u **obje** baze (vidi [`MIGRATIONS.md`](./MIGRATIONS.md)).

---

## Autentikacija i arhitektura

### Tko ima pristup čemu
- **`middleware.ts`** — samo provjera je li korisnik prijavljen (`getSession()`, bez DB calla, timeout 1200ms)
- **`admin/layout.tsx`** — provjerava `project_admins` tablicu → nije admin → redirect `/portal`
- **`portal/layout.tsx`** — ako admin → `/admin/dashboard`; ako nema u `sponsor_users` → redirect na `/api/auth/signout?redirect=/partner?error=no_access` (Route Handler briše cookies)
- **`login/page.tsx`** — admin login → `/admin/dashboard`
- **`partner/page.tsx`** — partner login s HR/EN jezičnim togglem; poziva `findPartnerProject(email)` za točan projekt; nakon prijave redirect na `/portal/benefits`; **ne bilježi `recordPartnerLogin`**

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
Iznimke koje insertaju direktno preko `createAdminClientForProject` (pouzdano bypassira RLS): `recordPartnerLogin`, `addSponsorComment` (notifikacija uz komentar), `api/cron/comment-reminders`.

### Security lintovi (Supabase) — `migration_038`
`migration_038_security_lints.sql` rješava Supabase database linter upozorenja (pokrenuti u **obje** baze):
- **`search_path`** pinnan na svim SECURITY DEFINER rutinama (`SET search_path = public, pg_temp`) — dinamički preko `pg_proc` (radi za bilo koju signaturu/tip).
- **EXECUTE grantovi**: REVOKE od `anon`/`PUBLIC` na SECURITY DEFINER funkcijama; trigger funkcije i RPC-jevi koje zove samo backend revoke-ani i od `authenticated` (+GRANT `service_role`).
- **RLS helperi** (`is_admin`, `is_project_admin`, `get_my_sponsor_id`, `is_sponsor`) **ZADRŽAVAJU** `authenticated` EXECUTE jer ih pozivaju RLS policyji — njihovo `authenticated_security_definer` (lint 0029) upozorenje **ostaje namjerno** (vraćaju samo info o pozivatelju, nema curenja podataka). Ne revoke-ati.
- **Storage**: široki `"authenticated read"` SELECT policy na `storage.objects` **obrisan** (lint 0025); `sponsor-files` je public bucket → download radi preko public URL-a, app ne koristi `.list()`. Ne vraćati policy natrag.
- **Leaked Password Protection** se NE rješava SQL-om — uključiti u Dashboardu (Authentication → Policies) u oba projekta.

### Impersonacija partnera (kolovoz 2026.)
Admin gumb **"Logiraj se kao partner"** na profilu partnera (`ImpersonateButton` → `actions/impersonate.ts`, guard `requireAdmin`). Za razliku od members portala (JWT u sessionStorageu, izolirano po tabu), ovdje sesija živi u **cookiejima** a portal je server-rendered — zato se adminova sesija privremeno **zamjenjuje** partnerovom u ISTOM tabu (i ostali tabovi vide portal kao partner):
1. `impersonatePartner(sponsorId)` nađe portal korisnika preko `sponsor_users` (kad ih je više, bira onog koji je primarni kontakt), spremi adminove tokene u httpOnly cookie **`cro_imp`** (base64 JSON, 2h) i napravi isti token exchange kao `switchProject` (`generateLink` → `fetch` s `redirect:"manual"` → `setSession`).
2. Portal prikazuje žutu traku `ImpersonationBanner` ("Admin testni način") s gumbom **Izađi** → `stopImpersonation()` vraća adminovu sesiju iz cookieja, resetira `PROJECT_COOKIE` na adminov projekt i redirecta na profil partnera.
- **Cookie SADRŽI adminov refresh token** — posjedovanje cookieja JE kredencijal. Ne zamjenjivati ga običnom `adminEmail` oznakom: cookieje kontrolira browser, pa bi je bilo tko mogao podmetnuti i gumbom "Izađi" dobiti admin sesiju.
- Dvije obrane od zaostalog cookieja: `/api/auth/signout` briše `cro_imp`, a traka i `stopImpersonation` rade samo ako se email prijavljenog korisnika poklapa s `partnerEmail` iz cookieja.
- Sve što admin napravi u testnom načinu bilježi se kao radnja partnera (npr. ulaznica dobiva `sponsor_contacts.source='portal'`) — nema posebnog `imp` označavanja zapisa.

### Partner login flow
Partner login je na `/` (`src/app/page.tsx`); `/partner` i `/login` su SAMO middleware redirecti — te su stranice obrisane (bile su mrtvi duplikati). Admin login je `src/app/admin/page.tsx`.
Login ne poziva `recordPartnerLogin` — prijava ide direktno na `/portal/benefits`.
Stranica ima HR/EN language toggle (lokalno, bez i18n konteksta); error poruke prate odabrani jezik (`errorKey` state).
`recordPartnerLogin` i dalje postoji u `notifications.ts` i može se pozvati iz drugog mjesta ako zatreba.
**`createBrowserClient` na login stranicama MORA dobiti `{ isSingleton: false }`** kao treći argument — inače drugi poziv s URL-om drugog projekta vrati cached klijent prvog i login u 2025 tiho ne radi.

---

### Kreiranje korisnika — operativno
- **Admin**: Admin panel → Postavke → Pristup portalu. Novi admin se kreira u **obje** baze (2025 i 2026) i dodaje u `project_admins`. Svi u `project_admins` imaju puni pristup.
- **Partner**: Admin panel → Postavke → Partneri → Novi partner (kreira se u **aktivnom** projektu). Alternativno: profil partnera → Kontakt osobe → mail ikona → `/api/portal/invite`. Partner **ne smije** biti u `project_admins` — inače ga portal redirecta u admin panel.
- **Promjena lozinke partnera**: Postavke → Partneri → ikona ključa na retku.
- Za projekt switch partner mora imati account **i** `sponsor_users` unos u oba projekta.

Ručno, ako zatreba:

```sql
INSERT INTO sponsor_users (user_id, sponsor_id) VALUES ('uuid-korisnika', 'uuid-partnera');
UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'uuid-korisnika';
```

> **Ne raditi DB upite sa service role klijentom u `middleware.ts`** — Edge runtime ne može pristupiti `SUPABASE_SERVICE_ROLE_KEY`.

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
NEXT_PUBLIC_APP_URL=https://partners.ecommerce.hr
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

**Grananje**: `main` je produkcija i Vercel deploya odatle; direktni commit na `main` je OK za ovaj projekt.

**Ručni redeploy bez promjena**: `git commit --allow-empty -m "Force redeploy" && git push`

**Vercel config**: Root directory `/`, Build command `next build`, Node 18+, `.npmrc`: `legacy-peer-deps=true`

**Supabase config** (u oba projekta): Authentication → URL Configuration → Redirect URLs dodati `https://partners.ecommerce.hr/auth/callback`

> **VAŽNO — promjene nisu odmah na produkciji**: Nakon BILO KOJE izmjene koda koja utječe na live stranicu, podsjeti korisnika da se promjena NEĆE vidjeti dok nije commitana I deployana na Vercel. Navedi točne korake: (1) `git commit`, (2) `git push origin main`, (3) pričekaj da Vercel deploy završi (~1–2 min). Editiranje koda samo po sebi ne mijenja ništa live.

---

## Ključne implementacijske napomene

- **Scroll container** u admin layoutu: `<main className="overflow-y-auto">` → koristiti `document.querySelector("main")?.scrollTo(...)`, ne `window`
- **Supabase join** vraća array u TS tipu ali objekt u runtime → koristiti `Array.isArray(raw) ? raw[0] : raw`
- **`useSearchParams()`** mora biti unutar `<Suspense>` wrappera (Next.js 14 App Router)
- **Resend SDK** vraća `{ data, error }`, ne baca exception — uvijek provjeriti `error`
- **Server action error pattern**: ne bacati exception → koristiti `return { error: message }`
- **`iznos` i `partial_amount`**: graceful degradation — retry bez kolone ako ne postoji
- **UUID-ovi korisnika su različiti** između 2025 i 2026 projekata (zasebne Supabase instance)
- **`NEXT_PUBLIC_APP_URL`** mora biti `https://partners.ecommerce.hr` — za `redirectTo` u magic link generaciji; fallback u `switchProject.ts` je također `https://partners.ecommerce.hr`
- **Spread na `Set`** (`[...new Set(...)]`) zahtijeva `downlevelIteration` → koristiti `forEach` + ručni array
- **`getProjectAdminClient()` helper** u `actions/notifications.ts`: čita `PROJECT_COOKIE`, vraća `createAdminClientForProject(projectId)`
- **Dashboard**: Naplaćeno = `sum(iznos za paid) + sum(partial_amount za partial)`; Neplaćeno = ostalo + `sum(iznos − partial_amount za partial)`; Profitabilnost = prihodi − budgetAll
- **Email**: FROM adresa `konferencija@ecommerce.hr`; subject uključuje godinu iz cookieja `cro_active_project`
- **Welcome email**: `sendWelcomeEmail(to, sponsorName, contactName, password, year)` — poziva se iz `createPartnerUser` nakon upserта u `sponsor_users`; logira u `email_logs`; `PartnerManagementSection` prikazuje toast "welcome email poslan" ili "(slanje emaila nije uspjelo)" ovisno o `{ emailSent }` returnu
- **Portal i18n**: `useLang()` hook iz `LanguageContext`; prijevodi u `lib/i18n/portal.ts`; `translatePackage(lang, type)` za nazive paketa. **Ne koristiti tipografske navodnike** („ ") unutar TS string literala — parser baca syntax error; koristiti `'` ili `\"`
- **EditBenefitDialog/Modal** — primarni kontakt: fetchuje sve kontakte sponzora (bez type filtera) + primarni; matching ime (case-insensitive) → fallback email; ★ oznaka + pre-select
- **Inbox brisanje** vidljivo samo za `marcel@ecommerce.hr`; `deleteAllNotifications` koristi `.neq("id", "00000000-...")` jer Supabase zahtijeva WHERE uvjet za DELETE
- **CSS animacije** u `globals.css`: `animate-enter` (slideUp 0.35s), `animate-fade-in` (fadeIn 0.2s), `animate-slide-up` (slideUp 0.25s) — koristiti za modalne prozore i page transitions
- **Ulaznica (`/[slug]`)**: mobile-responzivan layout (`flex-col sm:flex-row`), lokacija: Mozaik Event Centar, Slavonska Avenija 6/2, Zagreb; QR sekcija na mobilnom je horizontalni red (QR lijevo, vlasnik desno). **NE prikazuje email** (PII na javnoj stranici); nepostojeći slug → `notFound()`; nema fallback pogađanja po imenu
- **Dijeljeni util helperi u `lib/utils.ts`** (koristiti umjesto lokalnih kopija): `CONTACT_TYPE_LABELS`/`contactTypeLabel` (HR labeli svih 7 tipova kontakata), `PAYMENT_STATUS_OPTIONS` (opcije za selecte), `sortPackageNames` (standardni sort paketa), `formatEur` (hr-HR EUR), `isBenefitOverdue(status, deadline)` (JEDINA definicija "kasni": rok striktno prije danas + nije completed, uključuje not_started), `escapeHtml` (za email HTML)
- **Jezik portala** se pamti u `localStorage("cro_lang")` + cookie `cro_lang` (čita se u useEffect nakon mounta — bez hydration mismatcha)
- **Brisanje datoteka**: prije `storage.remove` provjeriti postoje li drugi `files` redovi s istim `storage_url` ili path počinje sa `shared/` — tada obrisati SAMO DB red (dijeljeni dokumenti pattern)
- **Brisanje kontakata u admin UI** ide ISKLJUČIVO preko server actiona `deleteContact`/`deleteContactsBulk` (nullificiraju FK na benefitima), nikad direktnim `supabase.delete()` iz browsera
- **`AddSponsorModal`** više **NE** auto-kreira benefite po paketu pri dodavanju sponzora — inserta samo `sponsors` red; benefiti se dodaju zasebno (`AddBenefitModal` / grupni edit)
- **`/admin/sponsors` filteri** su svi URL-driven i kombiniraju se: `?package=` (multi, zarez), `?payment=` (multi, zarez), `?lead=` (**multi, zarez** — chipovi se togglaju preko `toggleLead`), `?type=leads|clients` i `?q=`. **Status (`lead`) i Tip kontakta (`type`) se međusobno isključuju** — `toggleLead` namjerno ne prenosi `type`, a `type` linkovi ne prenose `lead`. Filtriranje je server-side u `page.tsx`, pa `SponsorsTableWithSelect` i export uvijek dobiju istu, već filtriranu listu. Poznato ograničenje: `PackageTypeManager` gradi URL samo iz `package`+`payment`, pa klik na kategoriju resetira `lead`/`type`/`q`
- **Export kontakata partnera** (`ExportContactsButton.tsx`, zaglavlje `/admin/sponsors`): client-side XLSX, **jedan redak po kontaktu** (ne po partneru) za trenutno filtrirane partnere; kolone Partner, Paket, Status, Plaćanje, Tip kontakta, Ime i prezime, Email, Telefon, Funkcija, Tvrtka kontakta, Tip ulaznice, Napomena. Primarni kontakt (`sponsors.contact_*`) ide kao zaseban redak i **deduplicira se** protiv svog zrcala u `sponsor_contacts` (migration_033) po emailu ILI imenu — kod poklapanja se zrcalni telefon/funkcija/tvrtka/napomena **mergaju** u primarni redak umjesto da se odbace. Partneri bez ijednog kontakta dobiju redak `(bez kontakta)` i ne broje se u brojaču na gumbu. `page.tsx` zato selecta puni set polja kontakata uz fallback na uži set ako novije kolone ne postoje
- **`/admin/ulaznice`** (`UlazniceActions.tsx`): `ExportXlsxButton` radi client-side XLSX export (`xlsx` paket, `json_to_sheet` + `writeFile`); export kolone (Ime i prezime, Email, Telefon, Tvrtka, Kategorija tvrtke, Tip ulaznice, Komentar, Partner, QR link) — bulk upload UI i `BulkModal` su **uklonjeni**; sekcije se dijele po `sponsor_contacts.source` (`'portal'` = partner unio kroz portal, `'admin'` = ručno u adminu, neovisno o `sponsor_id`); svi insert pointi postavljaju `source` (`ticketActions.ts`, `AddContactModal`, `ContactsSection` → `'admin'`; `createSponsorTicket`, `PortalContactsSection` → `'portal'`) uz graceful retry bez kolone dok migration_039 nije pokrenut (tada fallback podjela po `sponsor_id`)
- **Graceful degradation pattern** za nove kolone: uvijek probaj upit s novim kolonama; ako Supabase vrati error koji sadrži naziv kolone, ponovi upit bez njih. `as any` cast na fallback varijablu da se izbjegnu TS greške. Kritično kod `iznos` (migration_024) — bez fallbacka cijeli update tiho faila i ostale promjene (npr. `lead_status`) se ne spreme
- **`useState` + `useEffect([initial])` sync**: klijentske komponente koje primaju server props moraju sinkronizirati state u `useEffect` — komponenta često ostaje mountirana s novim propsom (npr. `RenameBenefitDialog` ostaje mountiran s `currentName=null` kad je zatvoren, pa bi bez `useEffect` zadržao prazan string)
- **Inline edit pattern** (`AdminPrimaryContactEdit`, `PrimaryContactSection` u `PortalContactsSection`): `useState displayed` za optimistički prikaz + `useEffect` za sync s propsima + zaseban error state
- **Bulk select pattern** (`SponsorsTableWithSelect`): `useState<Set<string>>` za odabrane ID-eve; klik na redak togglea selekciju (osim klika na `<a>`); `useTransition` za non-blocking server action; bulk bar je `sticky top-0 z-10`. Vrijednost `""` u dropdownu znači "bez promjene" i ne šalje se u update; `"__clear__"` je sentinel koji šalje `null` (brisanje lead statusa)
- **Dashboard "Sponzori po paketu" i "Status plaćanja"** prikazuju SAMO potvrđene partnere (`confirmed_new` ili `confirmed_returning`) — subtitle "samo potvrđeni (N)" objašnjava filter, a postoci se računaju prema tom broju
- **`notifications` tablica** (migration_020): `sponsor_id` je nullable, `task_id` je nullable FK na `tasks`. Inbox query uključuje `task_id` u SELECT — ako kolona ne postoji, **cijeli query faila i inbox je prazan**
- **`sponsor_contacts.type` CHECK constraint**: migration_006 dozvoljava samo `contact` i `ticket`; migration_023 proširuje na svih 7 tipova. Bez te migracije spremanje kontakta tipa partner/visitor/speaker/… **tiho faila**
- **`contact_phone` kolona** na `sponsors` dodana je tek migration_016 — nije bila u inicijalnoj shemi i uzrokovala je grešku pri uređivanju primarnog kontakta
- **`updatePrimaryContact`** koristi admin klijent za update `contact_name/email/phone` jer partneri nemaju direktan UPDATE RLS na `sponsors`; vraća `{ error: string | null }` da se pravi Supabase error vidi u UI
- **Orphaned `sponsor_users` unosi** (bez matching auth usera) preskaču se u prikazu na settings stranici; prikaz partnera se dodatno deduplicira po emailu
- **Dijeljeni dokumenti za više partnera**: jedan storage objekt (npr. `sponsor-files/shared/...`) + po jedan `files` red po sponzoru (`benefit_id: null`, isti `storage_url`) — tako su dimenzije standa podijeljene svim partnerima po paketu (veliki stand → Srebrni/Zlatni/Glavni; regular stand → Brončani); brisanje `files` reda ne briše storage objekt

---

## Implementirane funkcionalnosti

### Partneri (`/admin/sponsors`)
- Lista partnera s tražilicom (`?q=`) — naziv tvrtke je klikabilan link na profil
- **Multi-select filter paketa** (`PackageTypeManager`) — `?package=Zlatni,Srebrni`; × ikonica se prikazuje samo na aktivnom filteru i uklanja ga (ne briše kategoriju iz baze); olovka gumb ulazi u **edit mode** gdje se kategorija preimenuje (inline input + ✓) ili briše (trash + potvrda Da/Ne)
- **Multi-select filter plaćanja** — `?payment=pending,partial`
- **Multi-select filter statusa (lead)** — `?lead=cold_lead,hot_lead`, chipovi se togglaju; `Tip kontakta` (`?type=leads|clients`) je prečac za iste statuse i **isključuje se** s `lead` filterom
- **Export kontakata** (`ExportContactsButton`) — gumb "Preuzmi kontakte (N)" u zaglavlju; XLSX s jednim retkom po kontaktu za trenutno filtrirane partnere
- **Multi-select bulk edit** (`SponsorsTableWithSelect`) — checkbox stupac; klik na redak ili checkbox odabire partnera; checkbox u zaglavlju odabire/poništava sve; sticky bulk action bar s dropdownima Paket/Plaćanje/Status; `bulkUpdateSponsors` radi `.update().in("id", ids)` + `revalidatePath`
- **Iznos stupac** — `iznos` formatiran kao EUR (0 € sivom bojom za null)
- **Primarni kontakt — inline edit** (`AdminPrimaryContactEdit`) u sekciji Informacije na profilu partnera
- **Brisanje partnera** s potvrdom (`DeleteSponsorButton`) → redirect na `/admin/sponsors`
- **Komentari** (`SponsorCommentsSection`, migration_037) — uz komentar ide notifikacija; podsjetnici preko `api/cron/comment-reminders`
- **Impersonacija** (`ImpersonateButton`) — "Logiraj se kao partner", vidi sekciju Autentikacija
- **AddSponsorModal** inserta samo `sponsors` red — **ne** auto-kreira benefite po paketu

### Benefiti (`/admin/benefits`)
- Kliktabilne stat kartice — filtriranje po statusu via `?status=`
- **Dodavanje** (`AddBenefitModal`) — dropdown postojećih naziva + "Dodaj novi benefit" za slobodan unos; može odabrati i partnera
- **Edit** (`EditBenefitDialog` / `EditBenefitModal`) — opis, kontakt osoba, upload dokumenata, podsjetnik
- **Grupni edit** (`RenameBenefitDialog`) — olovka pored naziva grupe mijenja naziv i rok za SVE partnere te grupe odjednom; rok se pre-popunjava najčešćim datumom u grupi
- **Brisanje po partneru** — Trash2 na hover u svakom redu; briše samo taj `benefit.id`
- **Dodavanje partnera benefitu** — "+" na dnu razvijenog AccordionGroup, dropdown neraspoređenih partnera
- **"Zadnji podsjetnik"** — datum zadnjeg poslanog maila u accordion headeru
- **Auto-scroll na vrh** pri otvaranju svakog modala
- **Dokumenti benefita** (`BenefitFileUpload`, migration_018) — putanja `{sponsor_id}/benefits/{benefit_id}/{timestamp}_{filename}`; `files.benefit_id IS NULL` = datoteke partnera, `NOT NULL` = dokumenti benefita; portal ih prikazuje u `PortalBenefitCard`

### Email (`/admin/email-predlosci`, `/admin/automatizacija`)
- **Email predlošci** (`EmailTemplatesView` nad `email_templates`) — subject/body/button, `is_active` zastavica
- **Automatizacija** (`AutomatizacijaView` nad `email_automations`) — trigger tip + `days_before` + vezani predložak
- **Ručna obavijest** — gumb "Pošalji obavijest" u `EditBenefitDialog` → `/api/benefits/[id]/notify`; subject `CRO Commerce [GODINA] - Podsjetnik za [naziv]` (godina iz cookieja); nakon slanja upis u `email_logs` + `router.refresh()`
- **Cron** — `api/cron/reminders` obrađuje OBA projekta; overdue alert samo za benefite koji su TEK SADA prešli u overdue

### Kontakti (`/admin/contacts`)
- Standalone lista svih kontakata s filterom po tipu i partneru + tražilica; bulk delete; link na detaljnu stranicu
- **Dodavanje** (`AddContactModal`) i **uređivanje** (`ContactDetailActions`) — tip, partner (dropdown), ime, firma, email, telefon, funkcija, napomena
- Brisanje ide ISKLJUČIVO preko `deleteContact`/`deleteContactsBulk` (nullificiraju FK na benefitima)
- Na profilu partnera: sekcije **Kontakt osobe** i **Osobe za ulaznice** s inline CRUD-om; mail ikona na hover šalje portal pozivnicu (`/api/portal/invite`)

### Ulaznice (`/admin/ulaznice`)
- Dvije sekcije po `sponsor_contacts.source` (migration_039): **Ulaznice partnera** (`source='portal'`) i **Ručno dodane** (`source='admin'`, mogu imati partnera)
- **Preuzmi .xlsx** (`ExportXlsxButton`) — kolone Ime i prezime, Email, Telefon, Tvrtka, Kategorija tvrtke, Tip ulaznice, Komentar, Partner, QR link
- Stat kartice Ukupno / Od partnera / VIP / Standard; QR gumb po retku otvara `QRModal` (javna stranica `/[slug]`)
- Bulk upload UI (`BulkModal`) je **uklonjen**; `bulkCreateTickets` i dalje postoji u `ticketActions.ts`
- **Limit ulaznica** vrijedi samo za partnerski unos (`createSponsorTicket`, vidi `lib/ticketQuota.ts`) — admin unos nema limit

### Program (`/admin/program`, `/portal/program`)
- Tabovi po pozornici: **Blackwall Stage** (`future`), **Manago AI Stage** (`action`), **Wonderland Stage** (`wonderland`), plus zajedničke stavke (`all`)
- Admin: CRUD sesija + tražilica. Portal: isti prikaz, read-only
- Timeline grupiran po vremenskim slotovima; paralelne sesije side-by-side; badge za tip sesije (Predavanje, Panel, Fireside, Keynote, Pauza, Networking)

### Troškovi (`/admin/troskovi`)
- 4 summary kartice: Ukupni budžet, Plaćeno (progress bar), Na čekanju, Preostalo
- Tablica s filterom po statusu + tražilica; CRUD; izolacija po `project_id`
- Status: `paid`, `pending`, `overdue`, `partial`, `unconfirmed` (migration_031)

### Zadaci i Rokovnik
- Kanban board (`/admin/tasks`) — kliktabilni naslovi vode na `/admin/tasks/[id]` (prikaz + edit + delete)
- **Rokovnik** (`/admin/calendar`) — godišnji pregled zadataka po rokovima i mjesecima, filtar po odgovornoj osobi, klik otvara modal s inline editom i brisanjem
- Zadatak s emailom u `assigned_to` → Postgres trigger (migration_021/028) upisuje notifikaciju u inbox

### Inbox (`/admin/inbox`)
- Sve notifikacije (nepročitane + pročitane), badge s brojem nepročitanih u sidebaru
- Per-user read tracking (`notification_reads`, migration_029)
- Izvori: novi kontakt (migration_019/022), novi zadatak (migration_021/028), prijava partnera (`recordPartnerLogin`), prihvaćen ugovor (migration_036), komentar uz partnera (migration_037)
- Akcije: označi kao pročitano/nepročitano, označi sve; brisanje vidljivo samo za `marcel@ecommerce.hr`

### Postavke (`/admin/settings`)
- Datum konferencije (`project_settings`)
- **Admin korisnici** (`UserManagementSection`) — kreiranje ide u **sve** baze (2025 i 2026) + `project_admins`
- **Partneri** (`PartnerManagementSection`) — novi partner (ime, email, lozinka, partner) u aktivnom projektu; promjena lozinke (ikona ključa); welcome email preko `createPartnerUser`; prikaz deduplikacira po emailu i preskače orphaned `sponsor_users` unose

### Sponzorski portal (`/portal`)
- Login na **`/`** (`/partner` je samo middleware redirect — stranica ne postoji); nakon prijave → `/portal/benefits`
- Nav: **Partner → Benefiti → Program → CRO Commerce 2025 (Video)** + projekt switcher + HR/EN toggle + `PortalHelpModal`
- **`/portal/sponsor`** — tab Informacije (primarni kontakt, kontakt osobe, osobe za ulaznice — sve editable, RLS migration_015) i tab Dokumenti (read-only lista datoteka partnera)
- **`/portal/benefits`** — read-only lista s progress barom i kliktabilnim status karticama; svaki benefit prikazuje opis, kontakt osobu i dokumente
- **`/portal/program`** — read-only program, tabovi po pozornici
- **`/portal/video`** — embed snimke CRO Commerce 2025
- **Ugovor** (`PortalContractView`, migration_035/036) — prikazuje stvarne benefite partnera kad postoje; hardkodirani popis po paketu je samo fallback
- **Usporedba paketa** (`PortalCollaborationOptions`) — MARKETINŠKA tablica s hardkodiranim `PACKAGES`/`CATEGORIES`; stvarni limit ulaznica dolazi iz benefita partnera
- Pristup samo korisnicima u `sponsor_users`; admini se redirectaju na `/admin/dashboard`

### Upload datoteka
- `FileUploadSection` (po partneru) i `BenefitFileUpload` (po benefitu) → bucket `sponsor-files`
- Vidljivi error u UI ako upload ne uspije; datoteke vidljive i na portalu
- **Dijeljeni dokumenti**: jedan storage objekt + po jedan `files` red po partneru (isti `storage_url`); brisanje `files` reda ne briše storage objekt

### Javni alat `/generator`
- Statični `public/generator.html` (rewrite u `next.config.mjs`, `PUBLIC_PATHS` u middlewareu) — generira vizuale govornika, bez prijave

### UI konvencije
- Modali se otvaraju pri **vrhu viewporta** (`items-start pt-8`) + `<main>` se scrolla na vrh (`behavior: "smooth"`)
- Fixed overlay s Tailwind klasama, ne `<dialog>` element
- Naslov aplikacije: `EventOrganizzer - CRO Commerce Conference`

---

## Migracije

Popis svih SQL migracija: vidi [`MIGRATIONS.md`](./MIGRATIONS.md)

Kako pokrenuti: Supabase Dashboard → SQL Editor → New query → kopiraj migraciju → Run (ponovi za oba projekta).

### Utility SQL skripte (nisu migracije)

- **`supabase/fix_2026_program.sql`** — **aktualan** unos programa CRO Commerce 2026 (izvor: conference.ecommerce.hr). Briše sve `project_id='2026'` retke i ponovno ih unosi u transakciji (30 sesija: 4 `all`, 13 `future`, 9 `action`, 4 `wonderland`). Pokrenuto i potvrđeno u bazi (rujan 2026.). Mapiranje pozornica: `future`=Blackwall (Main), `action`=Manago AI (expert), `wonderland`=Wonderland (talks), `all`=zajedničko.
- **`supabase/seed_2026_program.sql`** — **ZASTARJELO, NE POKRETATI.** Raniji seed istog programa s krivim podacima (cijeli expert track na `wonderland` umjesto `action`, dvije Blackwall sesije na `action`, Wonderland Stage potpuno izostavljen, placeholder naslov za Darija Begonju). Počinje s `DELETE ... project_id='2026'`, pa bi ponovno pokretanje vratilo sve greške. Zamijenjen s `fix_2026_program.sql`; datoteka ima upozorenje u zaglavlju.
- **`supabase/cleanup_duplicate_contacts.sql`** — ručno čišćenje duplih kontakata (isti email). Dvostupanjski: KORAK 1 samo prikaže što će se zadržati/obrisati (`ROW_NUMBER()` preview); KORAK 2 je zakomentiran — odkomentirati tek nakon provjere. Prioritet zadržavanja: ima `sponsor_id` → dulje ime → više popunjenih polja → stariji `created_at`.

---

## Git / Commit Conventions

- Koristi **Bash-kompatibilnu** sintaksu za commit poruke. NE koristi PowerShell here-string sintaksu (`@'...'@`) unutar Bash tool poziva — ona iskrivljuje commit poruke (ubacuje stray `@` znakove). Za commit poruke koristi obični `git commit -m "..."`.

---

## Architecture / Conventions

- **Sekundarni kontakti su zasebni `sponsor_contacts` zapisi** (i, gdje treba, zasebni portal korisnici), kako već postoji u modelu. NE uvoditi novi `SecondaryContact` model i NE over-engineerirati — prati postojeći obrazac (`sponsor_contacts` + `sponsor_users`).

---

## Working Style

- Drži izmjene usko ograničene na točno ono što je traženo. Za promjene teksta/UI-a, promijeni SAMO konkretan navedeni string — ne širi opseg i ne zamjenjuj sve pojave (npr. "promijeni samo riječ Korisnici" znači samo tu jednu riječ).
