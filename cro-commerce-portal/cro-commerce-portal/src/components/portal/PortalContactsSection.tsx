"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Check, X, Loader2, Users, Ticket, User } from "lucide-react";
import { updatePrimaryContact } from "@/app/actions/partnerManagement";

type ContactType = "contact" | "ticket";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  type: ContactType;
}

const emptyForm = { name: "", email: "", phone: "", role: "" };

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
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field text-sm py-1.5"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Funkcija</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input-field text-sm py-1.5"
              placeholder="npr. Marketing manager"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field text-sm py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mobitel</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field text-sm py-1.5"
              placeholder="+385 91 ..."
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setEditing(false)}
            className="btn-secondary text-xs py-1 px-2"
          >
            <X size={12} /> Odustani
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            className="btn-primary text-xs py-1 px-2"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Spremi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
          {contact.role && (
            <span className="text-xs text-gray-400 truncate">{contact.role}</span>
          )}
        </div>
        {contact.email && (
          <p className="text-xs text-gray-500 truncate">{contact.email}</p>
        )}
        {contact.phone && (
          <p className="text-xs text-gray-500">{contact.phone}</p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-1 text-gray-400 hover:text-brand-600 transition-colors"
        >
          <Pencil size={13} />
        </button>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Da
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Ne
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
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
    const { data, error: err } = await supabase
      .from("sponsor_contacts")
      .insert({
        sponsor_id: sponsorId,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        role: form.role || null,
        type,
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
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium mt-1 px-3"
      >
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
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field text-sm py-1.5"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Funkcija</label>
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="input-field text-sm py-1.5"
            placeholder="npr. Marketing manager"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field text-sm py-1.5"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Mobitel</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-field text-sm py-1.5"
            placeholder="+385 91 ..."
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => { setOpen(false); setForm(emptyForm); }}
          className="btn-secondary text-xs py-1 px-2"
        >
          <X size={12} /> Odustani
        </button>
        <button
          type="submit"
          disabled={!form.name.trim() || saving}
          className="btn-primary text-xs py-1 px-2"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          Dodaj
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

interface PrimaryContact {
  name: string | null;
  email: string | null;
  phone: string | null;
}

function PrimaryContactSection({
  sponsorId,
  initial,
}: {
  sponsorId: string;
  initial: PrimaryContact;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
  });
  const [displayed, setDisplayed] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setDisplayed(initial);
    setForm({ name: initial.name ?? "", email: initial.email ?? "", phone: initial.phone ?? "" });
  }, [initial.name, initial.email, initial.phone]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updatePrimaryContact(sponsorId, {
        contact_name: form.name || null,
        contact_email: form.email || null,
        contact_phone: form.phone || null,
      });
      setDisplayed({ name: form.name || null, email: form.email || null, phone: form.phone || null });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri spremanju");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Ime i prezime</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field text-sm py-1.5"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field text-sm py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mobitel</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field text-sm py-1.5"
              placeholder="+385 91 ..."
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setEditing(false); setError(null); }} className="btn-secondary text-xs py-1 px-2">
            <X size={12} /> Odustani
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1 px-2">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Spremi
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
      <button
        onClick={() => setEditing(true)}
        className="p-1 text-gray-400 hover:text-brand-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        <Pencil size={13} />
      </button>
    </div>
  );
}

export default function PortalContactsSection({
  sponsorId,
  primaryContact,
  contacts: initial,
}: {
  sponsorId: string;
  primaryContact: PrimaryContact;
  contacts: Contact[];
}) {
  const [contacts, setContacts] = useState(initial);

  useEffect(() => {
    setContacts(initial);
  }, [initial]);

  const mainContacts = contacts.filter((c) => c.type === "contact");
  const ticketContacts = contacts.filter((c) => c.type === "ticket");

  function handleDelete(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  function handleAdded(c: Contact) {
    setContacts((prev) => [...prev, c]);
  }

  return (
    <div className="card p-5 space-y-5">
      {/* Primarni kontakt */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <User size={15} className="text-gray-400" />
          Primarni kontakt
        </h3>
        <PrimaryContactSection sponsorId={sponsorId} initial={primaryContact} />
      </div>

      {/* Kontakt osobe */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <Users size={15} className="text-gray-400" />
          Kontakt osobe
        </h3>
        <div className="divide-y divide-gray-100">
          {mainContacts.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">Nema dodanih kontakt osoba</p>
          )}
          {mainContacts.map((c) => (
            <ContactRow key={c.id} contact={c} onDelete={handleDelete} />
          ))}
        </div>
        <AddContactForm sponsorId={sponsorId} type="contact" onAdded={handleAdded} />
      </div>

      {/* Osobe za ulaznice */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <Ticket size={15} className="text-gray-400" />
          Osobe za ulaznice
        </h3>
        <div className="divide-y divide-gray-100">
          {ticketContacts.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">Nema dodanih osoba za ulaznice</p>
          )}
          {ticketContacts.map((c) => (
            <ContactRow key={c.id} contact={c} onDelete={handleDelete} />
          ))}
        </div>
        <AddContactForm sponsorId={sponsorId} type="ticket" onAdded={handleAdded} />
      </div>
    </div>
  );
}
