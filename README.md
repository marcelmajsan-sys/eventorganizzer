# CRO Commerce Sponzorski Portal 2025

Kompletni sponzorski portal za upravljanje sponzorima, benefitima i isporukom sadržaja za CRO Commerce konferenciju.

## 🏗 Tech Stack

- **Next.js 14** — App Router + TypeScript
- **Tailwind CSS** — UI styling
- **Supabase** — PostgreSQL baza + Auth + Storage
- **Resend** — Transakcijski emailovi
- **@dnd-kit** — Drag & drop Kanban board
- **Vercel** — Hosting + Cron poslovi

---

## 🚀 Deploy upute (korak po korak)

### 1. Priprema Supabase projekta

1. Idite na [supabase.com](https://supabase.com) i kreirajte novi projekt
2. U **SQL Editoru** (lijevi sidebar → SQL Editor), pokrenite cijeli sadržaj datoteke:
   ```
   supabase/migration_001_initial.sql
   ```
3. U **Storage** (lijevi sidebar → Storage):
   - Kliknite "New bucket"
   - Ime bucketa: `sponsor-files`
   - Označite "Public bucket" ✓
   - Kliknite "Create bucket"
4. U **Authentication → Providers**:
   - Email/Password mora biti uključen (je by default)
5. Kreirajte admin korisnike u **Authentication → Users → Add user**:
   - `marcel@cro-commerce.hr` (zamijeni s pravim emailom)
   - `dino@cro-commerce.hr`
   - `goran@cro-commerce.hr`
6. Za svaki seed sponzor koji treba pristup portalu, dodajte korisnika s njihovim `contact_email`-om
7. Zapišite si iz **Settings → API**:
   - Project URL
   - anon/public key
   - service_role key (čuvajte tajnim!)

### 2. Postavljanje Resend-a

1. Registrirajte se na [resend.com](https://resend.com)
2. Dodajte i verificirajte vašu domenu (npr. `cro-commerce.hr`)
3. Kreirajte API key u **API Keys** sekciji
4. Zapišite API key

### 3. Lokalni razvoj

```bash
# Klonirajte repo
git clone <vaš-repo>
cd cro-commerce-portal

# Instalirajte dependencies
npm install

# Kopirajte env file
cp .env.example .env.local

# Ispunite .env.local s vašim vrijednostima
# (Supabase URL, keys, Resend key, itd.)

# Pokrenite development server
npm run dev
```

Otvorite [http://localhost:3000](http://localhost:3000)

### 4. Deploy na Vercel

#### Opcija A: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Opcija B: GitHub integracija (preporučeno)
1. Pushajte kod na GitHub
2. Idite na [vercel.com](https://vercel.com) → "Add New Project"
3. Importirajte vaš GitHub repozitorij
4. U **Environment Variables** dodajte sve varijable iz `.env.example`:

| Varijabla | Vrijednost |
|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Resend API key |
| `NEXT_PUBLIC_APP_URL` | https://vaša-domena.vercel.app |
| `ADMIN_EMAIL` | tim@cro-commerce.hr |
| `CRON_SECRET` | Generirani random string |

5. Kliknite **Deploy**

### 5. Konfiguracija Vercel Cron-a

Vercel automatski detektira `vercel.json` i pokreće cron posao svaki dan u 8:00 UTC.

U Vercel dashboardu dodajte environment varijablu:
```
CRON_SECRET=your-very-secret-key
```

Cron endpoint: `GET /api/cron/reminders`
- Authorization: `Bearer {CRON_SECRET}`
- Šalje podsjetnik 30 dana prije roka
- Šalje urgentni email 7 dana prije roka
- Obavještava admin tim kada rok prođe

### 6. Postavljanje custom domene (opcionalno)

1. U Vercel projektu: **Settings → Domains**
2. Dodajte `portal.cro-commerce.hr`
3. Konfigurirajte DNS prema uputama
4. Ažurirajte `NEXT_PUBLIC_APP_URL` env varijablu

---

## 👥 Korisnici i role

### Admin (Marcel, Dino, Goran)
- Pristup: `/admin/*`
- Email: Definirani u `middleware.ts` i Supabase Auth
- Mogu: vidjeti sve sponzore, upravljati zadacima, pratiti rokove

### Sponzori
- Pristup: `/portal`
- Email: Mora biti jednak `contact_email` u tablici `sponsors`
- Mogu: vidjeti svoje benefite, uploadati materijale, čitati obavijesti

---

## 📁 Struktura projekta

```
src/
├── app/
│   ├── admin/
│   │   ├── dashboard/     # Metrike i pregled
│   │   ├── sponsors/      # Lista + detalji sponzora
│   │   │   └── [id]/
│   │   ├── tasks/         # Kanban board
│   │   └── calendar/      # Godišnji plan
│   ├── portal/            # Sponzorski portal
│   ├── login/             # Auth stranica
│   └── api/
│       ├── sponsors/      # REST API
│       └── cron/
│           └── reminders/ # Email podsjetnici
├── components/
│   ├── admin/
│   │   ├── AdminSidebar
│   │   ├── KanbanBoard    # dnd-kit
│   │   ├── AddSponsorModal
│   │   ├── AddTaskModal
│   │   ├── BenefitStatusSelect
│   │   ├── EditSponsorForm
│   │   └── FileUploadSection
│   └── portal/
│       ├── PortalHeader
│       └── PortalFileUpload
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser client
│   │   └── server.ts      # Server client + admin
│   ├── email.ts           # Resend templates
│   └── utils.ts           # Helper funkcije
└── types/
    └── index.ts           # TypeScript tipovi
```

---

## 📧 Email podsjetnici

Automatski se šalju:

| Kada | Kome | Sadržaj |
|------|------|---------|
| 30 dana prije roka | Sponzoru | Prijateljski podsjetnik |
| 7 dana prije roka | Sponzoru | Urgentni email |
| Dan nakon roka | Admin timu | Alert s detaljima kašnjenja |

---

## 🗄 Baza podataka

### Tablice

- **sponsors** — Profili sponzora s paketom i statusom plaćanja
- **packages** — Definicije paketa s benefitima (JSONB)
- **sponsor_benefits** — Individualni benefiti s rokovima i statusima
- **tasks** — Interni zadaci za Kanban board
- **files** — Upload metadati (datoteke su u Supabase Storage)
- **notifications** — Inbox obavijesti za sponzore

### RLS politike

- Admini imaju puni pristup svim tablicama
- Sponzori vide samo vlastite podatke (filtriranje po `contact_email`)
- Storage: sponzori mogu uploadati samo u vlastiti folder (`{sponsor_id}/`)

---

## 🎨 Sponzorski paketi

| Paket | Benefiti |
|-------|----------|
| **Glavni** | Govor na gl. pozornici + Podcast + VIP štand + Naslovnica magazina + 3 str. oglasi + 10 kotizacija |
| **Zlatni** | Govor/panel + Veliki štand + Oglas u magazinu + 8 kotizacija |
| **Srebrni** | Workshop + Veliki štand + Goodie bag + Oglas + 5 kotizacija |
| **Brončani** | Mali štand + Goodie bag + 3 kotizacije |

---

## 🛠 Razvoj

```bash
# Development
npm run dev

# Build provjera
npm run build

# Lint
npm run lint
```

### Dodavanje novog sponzora (programski)

```typescript
// Putem API-a
POST /api/sponsors
{
  "name": "Nova Tvrtka d.o.o.",
  "package_type": "Zlatni",
  "contact_email": "kontakt@novatvrtka.hr",
  "contact_name": "Ime Prezime",
  "payment_status": "pending"
}
```

Benefiti se automatski kreiraju prema paketu.

---

## ⚠️ Važne napomene

1. **Service Role Key** nikad ne smije biti na frontendu (samo server-side)
2. **CRON_SECRET** mora biti isti u `vercel.json` i environment varijablama
3. Za Resend, domena pošiljatelja mora biti verificirana
4. Supabase Storage bucket mora biti kreiran PRIJE uploada datoteka
5. Admin emailovi moraju biti dodani i u `middleware.ts` i u Supabase Auth

---

© 2025 CRO Commerce | Sva prava pridržana
