"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Check, X, Loader2, Users, Ticket, User } from "lucide-react";
import { updatePrimaryContact } from "@/app/actions/partnerManagement";
import { useLang } from "@/context/LanguageContext";

type ContactType = "contact" | "ticket";
type TicketType = "vip" | "standard";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  type: ContactType;
  ticket_type: TicketType | null;
}

const emptyContactForm = { name: "", email: "", phone: "", role: "", ticket_type: "standard" as TicketType };

function TicketTypeBadge({ ticketType }: { ticketType: TicketType | null }) {
  if (!ticketType) return null;
  if (ticketType === "vip") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        VIP
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      STANDARD
    </span>
  );
}

function ContactRow({
  contact,
  onDelete,
}: {
  contact: Contact;
  onDelete: (id: string) => void;
}) {
  const isTicket = contact.type === "ticket";
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: contact.name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    role: contact.role ?? "",
    ticket_type: (contact.ticket_type ?? "standard") as TicketType,
  });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLang();

  async function handleSave() {
    setSaving(true);
    const updateData: Record<string, unknown> = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      role: form.role || null,
    };
    if (isTicket) {
      updateData.ticket_type = form.ticket_type;
    }
    const { error } = await supabase
      .from("sponsor_contacts")
      .update(updateData)
      .eq("id", contact.id);

    if (error && isTicket && error.message.includes("ticket_type")) {
      const { name, email, phone, role } = form;
      await supabase
        .from("sponsor_contacts")
        .update({ name, email: email || null, phone: phone || null, role: role || null })
        .eq("id", contact.id);
    }

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
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.fullName")}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field text-sm py-1.5"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.role")}</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input-field text-sm py-1.5"
              placeholder={t("contacts.rolePlaceholder")}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.email")}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field text-sm py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.phone")}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field text-sm py-1.5"
              placeholder={t("contacts.phonePlaceholder")}
            />
          </div>
          {isTicket && (
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">{t("contacts.ticketType")}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, ticket_type: "standard" })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    form.ticket_type === "standard"
                      ? "bg-gray-200 border-gray-300 text-gray-800"
                      : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  STANDARD
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, ticket_type: "vip" })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    form.ticket_type === "vip"
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : "bg-white border-gray-200 text-gray-400 hover:bg-amber-50"
                  }`}
                >
                  VIP
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setEditing(false)}
            className="btn-secondary text-xs py-1 px-2"
          >
            <X size={12} /> {t("contacts.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            className="btn-primary text-xs py-1 px-2"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            {t("contacts.save")}
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
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-gray-500 truncate">{contact.email}</p>
            {isTicket && <TicketTypeBadge ticketType={contact.ticket_type} />}
          </div>
        )}
        {!contact.email && isTicket && (
          <div className="mt-0.5">
            <TicketTypeBadge ticketType={contact.ticket_type} />
          </div>
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
              {t("contacts.yes")}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              {t("contacts.no")}
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
  const isTicket = type === "ticket";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyContactForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLang();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const insertData: Record<string, unknown> = {
      sponsor_id: sponsorId,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      role: form.role || null,
      type,
    };
    if (isTicket) {
      insertData.ticket_type = form.ticket_type;
    }

    let { data, error: err } = await supabase
      .from("sponsor_contacts")
      .insert(insertData)
      .select()
      .single();

    if (err && isTicket && err.message.includes("ticket_type")) {
      const fallback = await supabase
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
      data = fallback.data;
      err = fallback.error;
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    if (data) {
      onAdded(data as Contact);
    }
    setForm(emptyContactForm);
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
        {isTicket ? t("contacts.addTicket") : t("contacts.addContact")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-3 mt-2 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("contacts.fullName")}</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field text-sm py-1.5"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("contacts.role")}</label>
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="input-field text-sm py-1.5"
            placeholder={t("contacts.rolePlaceholder")}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("contacts.email")}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field text-sm py-1.5"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("contacts.phone")}</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-field text-sm py-1.5"
            placeholder={t("contacts.phonePlaceholder")}
          />
        </div>
        {isTicket && (
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.ticketType")}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, ticket_type: "standard" })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  form.ticket_type === "standard"
                    ? "bg-gray-200 border-gray-300 text-gray-800"
                    : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                }`}
              >
                STANDARD
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, ticket_type: "vip" })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  form.ticket_type === "vip"
                    ? "bg-amber-100 border-amber-300 text-amber-800"
                    : "bg-white border-gray-200 text-gray-400 hover:bg-amber-50"
                }`}
              >
                VIP
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => { setOpen(false); setForm(emptyContactForm); }}
          className="btn-secondary text-xs py-1 px-2"
        >
          <X size={12} /> {t("contacts.cancel")}
        </button>
        <button
          type="submit"
          disabled={!form.name.trim() || saving}
          className="btn-primary text-xs py-1 px-2"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          {t("contacts.add")}
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
  const { t } = useLang();

  useEffect(() => {
    setDisplayed(initial);
    setForm({ name: initial.name ?? "", email: initial.email ?? "", phone: initial.phone ?? "" });
  }, [initial.name, initial.email, initial.phone]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const { error: err } = await updatePrimaryContact(sponsorId, {
      contact_name: form.name || null,
      contact_email: form.email || null,
      contact_phone: form.phone || null,
    });
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
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.fullName")}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field text-sm py-1.5"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.email")}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field text-sm py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.phone")}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field text-sm py-1.5"
              placeholder={t("contacts.phonePlaceholder")}
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setEditing(false); setError(null); }} className="btn-secondary text-xs py-1 px-2">
            <X size={12} /> {t("contacts.cancel")}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1 px-2">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            {t("contacts.save")}
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
          <p className="text-xs text-gray-400">{t("contacts.notSet")}</p>
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
  const { t } = useLang();

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
          {t("contacts.primary")}
        </h3>
        <PrimaryContactSection sponsorId={sponsorId} initial={primaryContact} />
      </div>

      {/* Kontakt osobe */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <Users size={15} className="text-gray-400" />
          {t("contacts.contacts")}
        </h3>
        <div className="divide-y divide-gray-100">
          {mainContacts.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">{t("contacts.noContacts")}</p>
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
          {t("contacts.tickets")}
        </h3>
        <div className="divide-y divide-gray-100">
          {ticketContacts.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">{t("contacts.noTickets")}</p>
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
