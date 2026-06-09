"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Check, X, Loader2, Users, Ticket, User, QrCode, ExternalLink } from "lucide-react";
import { updatePrimaryContact } from "@/app/actions/partnerManagement";
import { createSponsorTicket, type TicketFormData } from "@/app/actions/ticketActions";
import { nameToSlug } from "@/lib/slugUtils";

const KATEGORIJE = ["Webshop", "Service Provider", "Speaker", "Ostalo"] as const;
const EMPTY_TICKET: TicketFormData = { name: "", email: "", company: "", role: "", ticket_type: "standard", notes: "" };

type ContactType = "contact" | "ticket";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  type: ContactType;
  ticket_type?: "vip" | "standard" | null;
  slug?: string | null;
}

const emptyForm = { name: "", email: "", phone: "", role: "" };
const TICKET_URL = "https://partners.ecommerce.hr";

function TicketBadge({ ticket_type }: { ticket_type?: "vip" | "standard" | null }) {
  if (!ticket_type) return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold border ${
      ticket_type === "vip"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-gray-100 text-gray-600 border-gray-300"
    }`}>
      {ticket_type === "vip" ? "VIP" : "STANDARD"}
    </span>
  );
}

function TicketQRLink({ slug, name }: { slug?: string | null; name: string }) {
  const displaySlug = slug ?? nameToSlug(name);
  const url = `${TICKET_URL}/${displaySlug}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors mt-1"
      title="Otvori ulaznicu"
    >
      <QrCode size={11} />
      Ulaznica
      <ExternalLink size={10} />
    </a>
  );
}

function ContactRow({
  contact,
  onDelete,
}: {
  contact: Contact;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: contact.name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    role: contact.role ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("sponsor_contacts")
      .update({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        role: form.role || null,
      })
      .eq("id", contact.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    await supabase.from("sponsor_contacts").delete().eq("id", contact.id);
    onDelete(contact.id);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ime i prezime *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm py-1.5" autoFocus />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Funkcija</label>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field text-sm py-1.5" placeholder="npr. Marketing manager" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm py-1.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mobitel</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm py-1.5" placeholder="+385 91 ..." />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1 px-2"><X size={12} /> Odustani</button>
          <button onClick={handleSave} disabled={!form.name.trim() || saving} className="btn-primary text-xs py-1 px-2">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Spremi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
          {contact.role && <span className="text-xs text-gray-400 truncate">{contact.role}</span>}
          {contact.type === "ticket" && <TicketBadge ticket_type={contact.ticket_type} />}
        </div>
        {contact.email && <p className="text-xs text-gray-500 truncate">{contact.email}</p>}
        {contact.phone && <p className="text-xs text-gray-500">{contact.phone}</p>}
        {contact.type === "ticket" && <TicketQRLink slug={contact.slug} name={contact.name} />}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-brand-600 transition-colors"><Pencil size={13} /></button>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button onClick={handleDelete} className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">Da</button>
            <button onClick={() => setConfirming(false)} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Ne</button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
        )}
      </div>
    </div>
  );
}

function AddTicketModal({ sponsorId, onClose }: { sponsorId: string; onClose: () => void }) {
  const [form, setForm] = useState<TicketFormData>(EMPTY_TICKET);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function set(key: keyof TicketFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Ime i prezime je obavezno."); return; }
    setSaving(true); setError(null);
    const res = await createSponsorTicket(sponsorId, form);
    setSaving(false);
    if (res.error) { setError(res.error); return; }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-enter">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Dodaj ulaznicu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ime i prezime *</label>
              <input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Marko Horvat" required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input-field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="marko@firma.hr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tvrtka</label>
              <input className="input-field" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Firma d.o.o." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorija tvrtke</label>
              <select className="input-field" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="">— odaberi —</option>
                {KATEGORIJE.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tip ulaznice</label>
              <div className="flex gap-2 mt-1">
                {(["standard", "vip"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => set("ticket_type", t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.ticket_type === t
                        ? t === "vip" ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-gray-100 border-gray-300 text-gray-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}>
                    {t === "vip" ? "VIP" : "Standard"}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
              <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Napomena..." />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Odustani</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : "Dodaj ulaznicu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddContactForm({
  sponsorId,
  type,
  onAdded,
}: {
  sponsorId: string;
  type: ContactType;
  onAdded: (c: Contact) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Generiraj slug za ticket kontakte (pokušaj base slug, pa s brojem ako zauzet)
    let slug: string | null = null;
    if (type === "ticket") {
      const baseSlug = nameToSlug(form.name.trim());
      slug = baseSlug;
      // Provjeri jedinstvenost
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
        const { data: existing } = await supabase
          .from("sponsor_contacts")
          .select("id")
          .eq("slug", candidate)
          .maybeSingle();
        if (!existing) { slug = candidate; break; }
      }
    }

    const { data, error: err } = await supabase
      .from("sponsor_contacts")
      .insert({
        sponsor_id: sponsorId,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        role: form.role || null,
        type,
        ...(slug ? { slug } : {}),
      })
      .select()
      .single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    if (data) onAdded(data as Contact);
    setForm(emptyForm);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium mt-1 px-3">
        <Plus size={13} />
        {type === "contact" ? "Dodaj kontakt osobu" : "Dodaj osobu za ulaznice"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-3 mt-2 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Ime i prezime *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm py-1.5" autoFocus required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Funkcija</label>
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field text-sm py-1.5" placeholder="npr. Marketing manager" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm py-1.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Mobitel</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm py-1.5" placeholder="+385 91 ..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => { setOpen(false); setForm(emptyForm); }} className="btn-secondary text-xs py-1 px-2"><X size={12} /> Odustani</button>
        <button type="submit" disabled={!form.name.trim() || saving} className="btn-primary text-xs py-1 px-2">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Dodaj
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

interface PrimaryContact { name: string | null; email: string | null; phone: string | null; }

function PrimaryContactSection({ sponsorId, initial }: { sponsorId: string; initial: PrimaryContact }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: initial.name ?? "", email: initial.email ?? "", phone: initial.phone ?? "" });
  const [displayed, setDisplayed] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setDisplayed(initial);
    setForm({ name: initial.name ?? "", email: initial.email ?? "", phone: initial.phone ?? "" });
  }, [initial.name, initial.email, initial.phone]);

  async function handleSave() {
    setSaving(true); setError(null);
    const { error: err } = await updatePrimaryContact(sponsorId, { contact_name: form.name || null, contact_email: form.email || null, contact_phone: form.phone || null });
    setSaving(false);
    if (err) { setError(err); return; }
    setDisplayed({ name: form.name || null, email: form.email || null, phone: form.phone || null });
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Ime i prezime</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm py-1.5" autoFocus />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm py-1.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mobitel</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm py-1.5" placeholder="+385 91 ..." />
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setEditing(false); setError(null); }} className="btn-secondary text-xs py-1 px-2"><X size={12} /> Odustani</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1 px-2">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Spremi
          </button>
        </div>
      </div>
    );
  }

  const hasData = displayed.name || displayed.email || displayed.phone;
  return (
    <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 group">
      <div className="flex-1 min-w-0">
        {hasData ? (
          <>
            {displayed.name && <p className="text-sm font-medium text-gray-900">{displayed.name}</p>}
            {displayed.email && <p className="text-xs text-gray-500">{displayed.email}</p>}
            {displayed.phone && <p className="text-xs text-gray-500">{displayed.phone}</p>}
          </>
        ) : (
          <p className="text-xs text-gray-400">Nije postavljeno</p>
        )}
      </div>
      <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-brand-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
        <Pencil size={13} />
      </button>
    </div>
  );
}

export default function PortalContactsSection({
  sponsorId, primaryContact, contacts: initial,
}: {
  sponsorId: string;
  primaryContact: PrimaryContact;
  contacts: Contact[];
}) {
  const [contacts, setContacts] = useState(initial);
  const [ticketModal, setTicketModal] = useState(false);
  useEffect(() => { setContacts(initial); }, [initial]);

  const mainContacts = contacts.filter((c) => c.type === "contact");
  const ticketContacts = contacts.filter((c) => c.type === "ticket");

  function handleDelete(id: string) { setContacts((prev) => prev.filter((c) => c.id !== id)); }
  function handleAdded(c: Contact) { setContacts((prev) => [...prev, c]); }

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><User size={15} className="text-gray-400" />Primarni kontakt</h3>
        <PrimaryContactSection sponsorId={sponsorId} initial={primaryContact} />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><Users size={15} className="text-gray-400" />Kontakt osobe</h3>
        <div className="divide-y divide-gray-100">
          {mainContacts.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">Nema dodanih kontakt osoba</p>}
          {mainContacts.map((c) => <ContactRow key={c.id} contact={c} onDelete={handleDelete} />)}
        </div>
        <AddContactForm sponsorId={sponsorId} type="contact" onAdded={handleAdded} />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm"><Ticket size={15} className="text-gray-400" />Osobe za ulaznice</h3>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          U svojim benefitima možete vidjeti koliko VIP ulaznica je uključeno u vaš paket. Možete dodavati i mijenjati osobe za ulaznice najkasnije do 10.10.2026. Ako dodate više osoba nego što imate u svom paketu benefita, poslat ćemo vam ponudu za dodatne ulaznice po želji uz 30% popusta.
        </p>
        <div className="divide-y divide-gray-100">
          {ticketContacts.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">Nema dodanih osoba za ulaznice</p>}
          {ticketContacts.map((c) => <ContactRow key={c.id} contact={c} onDelete={handleDelete} />)}
        </div>
        <button onClick={() => setTicketModal(true)} className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium mt-1 px-3">
          <Plus size={13} />
          Dodaj osobu za ulaznice
        </button>
        {ticketModal && <AddTicketModal sponsorId={sponsorId} onClose={() => setTicketModal(false)} />}
      </div>
    </div>
  );
}
