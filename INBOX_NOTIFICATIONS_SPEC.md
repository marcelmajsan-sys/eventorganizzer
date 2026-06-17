# Inbox / Obavijesti — prenosiva specifikacija

Samostalan opis sustava obavijesti (Inbox) iz CRO Commerce admin portala.
Cilj: učitati ovaj file u drugi projekt i iz njega rekonstruirati identičan inbox.

Stack na kojem je izvorno napravljeno: **Next.js 14 App Router + Supabase + Tailwind + lucide-react**.
Sve je portabilno — bilo koji backend može popunjavati iste tablice, a frontend je čisti React.

---

## 1. Pregled

Inbox je centralno mjesto gdje admin vidi sve sustavske obavijesti, filtrirane po tipu kroz tabove.
Postoji 5 tipova obavijesti + 2 agregatna taba (komentari, sve).

| Tip (`notifType`) | Label (tab) | Boja | Ikona (lucide) | Izvor |
|---|---|---|---|---|
| `task` | Novi zadatak | plava | `SquareCheckBig` | trigger/insert pri kreiranju zadatka s dodijeljenom osobom |
| `contact` | Novi kontakt | zelena | `UserPlus` | insert pri dodavanju kontakt osobe |
| `ticket` | Nova osoba za ulaznice | ljubičasta | `Ticket` | insert pri dodavanju osobe za ulaznice |
| `comment` | Novi komentar | tirkizna | `MessageSquare` | insert pri dodavanju komentara na sponzora |
| `followup` | Follow up podsjetnik | jantarna | `CalendarClock` | cron job na dospjeli podsjetnik komentara |

Agregatni tabovi:
- **Svi komentari** (`comments`) — prikazuje SVE komentare sponzora (iz zasebne tablice `sponsor_comments`), ne samo notifikacije.
- **Sve obavijesti** (`all`) — sve notifikacije zajedno.

Svaki tab pokazuje badge s brojem **nepročitanih** stavki tog tipa (osim "Svi komentari" koji pokazuje ukupan broj komentara).

---

## 2. Model podataka

### Tablica `notifications`
Jedna stavka inboxa. Tip se **izvodi iz `title` + `task_id`** (vidi `getNotifType` niže), ne sprema se zasebna kolona tipa.

```sql
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  sponsor_id  uuid references sponsors(id) on delete cascade,   -- nullable
  task_id     uuid references tasks(id)    on delete cascade,   -- nullable
  title       text not null,   -- vidi mapiranje tipova
  message     text not null,
  created_at  timestamptz not null default now()
);
```

> Tip se određuje po `title`. Točni stringovi `title` su važni:
> - `"Nova osoba za ulaznice"` → `ticket`
> - `"Novi komentar"` → `comment`
> - `"Follow up podsjetnik"` → `followup`
> - bilo koji s `task_id != null` → `task`
> - sve ostalo (npr. `"Nova kontakt osoba"`, `"Dodan novi kontakt"`) → `contact`

### Tablica `notification_reads` (per-user "pročitano")
Pročitanost se prati **po korisniku**, ne globalno — notifikacija nema `read` kolonu.

```sql
create table notification_reads (
  notification_id uuid not null references notifications(id) on delete cascade,
  user_id         uuid not null,
  created_at      timestamptz not null default now(),
  primary key (notification_id, user_id)
);
```

Notifikacija je "pročitana" za usera ako postoji red u `notification_reads`. Frontend računa `read = readSet.has(n.id)`.

### Tablica `sponsor_comments` (za tab "Svi komentari" + izvor `comment` notifikacija)
```sql
create table sponsor_comments (
  id          uuid primary key default gen_random_uuid(),
  sponsor_id  uuid not null references sponsors(id) on delete cascade,
  comment     text not null,
  admin_email text not null,
  created_at  timestamptz not null default now()
);
```

### Tablica `sponsor_comment_reminders` (izvor `followup` notifikacija)
```sql
create table sponsor_comment_reminders (
  id           uuid primary key default gen_random_uuid(),
  comment_id   uuid references sponsor_comments(id) on delete cascade,
  sponsor_id   uuid not null,
  comment_text text not null,
  admin_email  text not null,
  remind_at    date not null,
  sent         boolean not null default false,
  created_at   timestamptz not null default now()
);
```

---

## 3. Kako nastaje svaka obavijest

### `contact` / `ticket` — dodavanje kontakta
Pri dodavanju kontakt osobe ili osobe za ulaznice:
```ts
await db.from("notifications").insert({
  sponsor_id: sponsorId,
  title: contactType === "contact" ? "Nova kontakt osoba" : "Nova osoba za ulaznice",
  message: `${sponsorName}: dodana ${contactType === "contact" ? "kontakt osoba" : "osoba za ulaznice"} — ${contactName}`,
});
```
> Napomena: u izvornom projektu INSERT u `notifications` zna biti nepouzdan pod RLS-om, pa se koristi
> ili service-role klijent ili **Postgres trigger sa `SECURITY DEFINER`**. Ako tvoj projekt nema RLS, običan insert je dovoljan.

### `task` — novi zadatak
Kad se kreira zadatak s dodijeljenom osobom (`assigned_to`), upiše se notifikacija s `task_id`:
```ts
await db.from("notifications").insert({
  sponsor_id: null,
  task_id: taskId,
  title: `Zadatak dodijeljen ${assignedEmail}`,
  message: `Zadatak dodijeljen ${assignedEmail}: ${taskTitle}`,
});
```
> U izvornom projektu ovo radi Postgres trigger na `tasks` (SECURITY DEFINER). Bitno je samo da `task_id` bude popunjen — to čini tip `task`.

### `comment` — novi komentar na sponzora
```ts
// 1) spremi komentar
await db.from("sponsor_comments").insert({ sponsor_id, comment, admin_email: userEmail });
// 2) generiraj notifikaciju
await db.from("notifications").insert({
  sponsor_id,
  title: "Novi komentar",
  message: `${userEmail.split("@")[0]}: ${comment}`,
});
```

### `followup` — podsjetnik na komentar (cron)
Admin na komentar postavi `remind_at` (red u `sponsor_comment_reminders`).
Dnevni cron pokupi dospjele i pretvori ih u notifikacije:
```ts
// GET /api/cron/comment-reminders  (auth: Bearer CRON_SECRET)
const today = new Date().toISOString().slice(0, 10);
const reminders = await db.from("sponsor_comment_reminders")
  .select("id, sponsor_id, comment_text, admin_email, remind_at")
  .eq("sent", false)
  .lte("remind_at", today);

for (const r of reminders) {
  await db.from("notifications").insert({
    sponsor_id: r.sponsor_id,
    title: "Follow up podsjetnik",
    message: `${r.comment_text} — ${r.admin_email.split("@")[0]} (${formatDate(r.remind_at)})`,
  });
  await db.from("sponsor_comment_reminders").update({ sent: true }).eq("id", r.id);
}
```

---

## 4. Server akcije (mutacije iz UI-a)

```ts
markNotificationRead(id)      // upsert {notification_id, user_id} u notification_reads
markNotificationUnread(id)    // delete iz notification_reads za (id, user)
markAllNotificationsRead()    // insert reds za sve notifikacije kojih user još nema u reads
deleteNotification(id)        // delete iz notifications (samo ovlašteni admin)
deleteAllNotifications()      // delete .neq("id","000…000") — Supabase traži WHERE za DELETE
```

Brisanje je u UI-u dopušteno samo jednom adminu (`ADMIN_DELETE_EMAIL`); ostali vide samo mark read/unread.

---

## 5. Dohvat podataka (server, prije rendera)

```ts
// 1) sve notifikacije (najnovije prvo) + povezani sponzor
const raw = await db.from("notifications")
  .select("id, title, message, created_at, sponsor_id, task_id, sponsors(id, name)")
  .order("created_at", { ascending: false });

// 2) što je trenutni user pročitao
const reads = await db.from("notification_reads")
  .select("notification_id").eq("user_id", userId);
const readSet = new Set(reads.map(r => r.notification_id));

// 3) svi komentari (za tab "Svi komentari")
const rawComments = await db.from("sponsor_comments")
  .select("id, sponsor_id, comment, admin_email, created_at, sponsors(id, name)")
  .order("created_at", { ascending: false });

// mapiranje
const notifications = raw.map(n => ({
  id: n.id, title: n.title, message: n.message,
  read: readSet.has(n.id),
  created_at: n.created_at,
  task_id: n.task_id ?? null,
  sponsor: Array.isArray(n.sponsors) ? (n.sponsors[0] ?? null) : (n.sponsors ?? null),
  notifType: getNotifType(n),
}));
```

```ts
type NotifType = "task" | "contact" | "ticket" | "followup" | "comment";

function getNotifType(n: { task_id?: string | null; title: string }): NotifType {
  if (n.task_id) return "task";
  if (n.title === "Follow up podsjetnik") return "followup";
  if (n.title === "Novi komentar") return "comment";
  if (n.title === "Nova osoba za ulaznice") return "ticket";
  return "contact";
}
```

> Supabase join (`sponsors(id, name)`) u TS tipu je array, u runtimeu objekt → uvijek `Array.isArray(raw) ? raw[0] : raw`.

---

## 6. Frontend komponenta (`InboxView`)

Čisti React klijent. Props: `{ notifications, comments, userEmail }`.

### Tipovi
```ts
type NotifType = "task" | "contact" | "ticket" | "followup" | "comment";
type Tab = NotifType | "comments" | "all";

interface Notification {
  id: string; title: string; message: string;
  read: boolean; created_at: string;
  task_id: string | null;
  sponsor: { id: string; name: string } | null;
  notifType: NotifType;
}
interface SponsorComment {
  id: string; sponsor_id: string; comment: string;
  admin_email: string; created_at: string;
  sponsor: { id: string; name: string } | null;
}
```

### Metapodaci po tipu (boje + ikone)
```ts
const TYPE_META = {
  task:     { label: "Novi zadatak",          Icon: SquareCheckBig, iconColor: "text-blue-600",   iconBg: "bg-blue-100",   border: "border-l-blue-500",   badge: "bg-blue-100 text-blue-700" },
  contact:  { label: "Novi kontakt",           Icon: UserPlus,       iconColor: "text-green-600",  iconBg: "bg-green-100",  border: "border-l-green-500",  badge: "bg-green-100 text-green-700" },
  ticket:   { label: "Nova osoba za ulaznice", Icon: Ticket,         iconColor: "text-purple-600", iconBg: "bg-purple-100", border: "border-l-purple-500", badge: "bg-purple-100 text-purple-700" },
  followup: { label: "Follow up podsjetnik",   Icon: CalendarClock,  iconColor: "text-amber-600",  iconBg: "bg-amber-100",  border: "border-l-amber-500",  badge: "bg-amber-100 text-amber-700" },
  comment:  { label: "Novi komentar",          Icon: MessageSquare,  iconColor: "text-teal-600",   iconBg: "bg-teal-100",   border: "border-l-teal-500",   badge: "bg-teal-100 text-teal-700" },
};
```

### Tabovi (redoslijed)
```ts
const TABS = [
  { id: "task",     label: "Novi zadatak",          Icon: SquareCheckBig },
  { id: "contact",  label: "Novi kontakt",           Icon: UserPlus },
  { id: "ticket",   label: "Nova osoba za ulaznice", Icon: Ticket },
  { id: "comment",  label: "Novi komentar",          Icon: MessageSquare },
  { id: "followup", label: "Follow up podsjetnici",  Icon: CalendarClock },
  { id: "comments", label: "Svi komentari",          Icon: MessageSquare },
  { id: "all",      label: "Sve obavijesti",         Icon: LayoutList },
];
```

### Ponašanje
- Default aktivni tab: `all`.
- **Sortiranje**: unutar svakog taba nepročitane prvo, zatim pročitane (`[...unread, ...read]`).
- **Filtriranje**: `all` → sve; `comments` → renderira `comments` (CommentCard); ostali → `notifications.filter(n => n.notifType === tab)`.
- **Badge brojevi**:
  - `comments` → `comments.length`
  - `all` → broj svih nepročitanih
  - ostali → broj nepročitanih tog tipa
- **Card izgled**: lijevi rub `border-l-4` u boji tipa kad je nepročitana; pročitana → `opacity-60` (hover vrati na 100), siva ikona.
- Card prikazuje: ikonu (krug u boji), `title` (bold ako nepročitano), `timeAgo(created_at)` desno gore, `message`, te ispod link na sponzora (`/admin/sponsors/{id}`) i/ili "Otvori zadatak" (`/admin/tasks/{task_id}`).
- Desno na cardu: dugme mark read/unread; dugme delete samo ako `userEmail === ADMIN_DELETE_EMAIL`.
- Prazno stanje: `Bell` ikona + "Nema obavijesti u ovoj kategoriji" (ili "Nema komentara" za comments tab).

### Helper `timeAgo`
```ts
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "upravo";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "jučer";
  if (days < 7) return `${days} d`;
  return new Date(dateStr).toLocaleDateString("hr-HR", { day: "numeric", month: "numeric" });
}
```

### Header
- Naslov "Inbox" + podnaslov: `${unread} nepročitan(a/e/ih) obavijest(i)` (HR pluralizacija) ili "Sve obavijesti su pročitane".
- Desno: "Označi sve kao pročitano" (disabled kad nema nepročitanih) + "Obriši sve" (samo ovlašteni admin).
- Sidebar badge: broj nepročitanih = `notifications.filter(n => !n.read).length`.

---

## 7. Tailwind klase korištene (referenca boja)

| Element | Klase |
|---|---|
| Tab traka | `flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto` |
| Aktivni tab | `bg-white text-gray-900 shadow-sm` |
| Neaktivni tab | `text-gray-500 hover:text-gray-700` |
| Tab badge | `px-1.5 py-0.5 rounded-full text-[10px] font-bold` |
| Card | `card p-4 flex items-start gap-4` + `border-l-4 {border}` kad nepročitano |
| Ikona krug | `w-8 h-8 rounded-full flex items-center justify-center` + `{iconBg}` |

`card` klasa ≈ `bg-white rounded-xl border border-gray-200` (prilagodi svom design systemu).

---

## 8. Checklist za implementaciju u novom projektu

1. Kreiraj tablice: `notifications`, `notification_reads`, `sponsor_comments`, `sponsor_comment_reminders`.
2. Na svim mjestima koja generiraju događaje (kontakt, zadatak, komentar) dodaj insert u `notifications` s **točnim `title` stringom** (vidi §3).
3. Dodaj cron rutu za follow-up podsjetnike (`/api/cron/comment-reminders`, Bearer `CRON_SECRET`).
4. Server-side dohvat (§5) + `getNotifType`.
5. Renderiraj `InboxView` (§6) s `TYPE_META`, `TABS`, `timeAgo`, card layout.
6. Server akcije mark read/unread/all + delete (§4).
7. Sidebar badge = broj nepročitanih.

> Ako novi projekt **nema RLS**, svi insert/select rade običnim klijentom.
> Ako **ima RLS** kao izvorni projekt: insert u `notifications` radi preko service-role klijenta ili Postgres triggera (`SECURITY DEFINER`), a `notification_reads` je per-user.
