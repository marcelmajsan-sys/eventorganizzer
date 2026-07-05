"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Check, X, Loader2, Users, Ticket, User, QrCode, ExternalLink } from "lucide-react";
import { updatePrimaryContact } from "@/app/actions/partnerManagement";
import { createSponsorTicket, type TicketFormData } from "@/app/actions/ticketActions";
import { useLang } from "@/context/LanguageContext";

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
const TICKET_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://partners.ecommerce.hr";

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

function TicketQRLink({ slug }: { slug?: string | null }) {
  const { t } = useLang();
  if (!slug) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400 mt-1">
        <QrCode size={11} />
        {t("contacts.noQrLink")}
      </span>
    );
  }
  const url = `${TICKET_URL}/${slug}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors mt-1"
      title={t("contacts.openTicket")}
    >
      <QrCode size={11} />
      {t("contacts.ticketLink")}
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
  const { t } = useLang();
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
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.fullName")}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm py-1.5" autoFocus />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.role")}</label>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field text-sm py-1.5" placeholder={t("contacts.rolePlaceholder")} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.email")}</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm py-1.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.phone")}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm py-1.5" placeholder={t("contacts.phonePlaceholder")} />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1 px-2"><X size={12} /> {t("contacts.cancel")}</button>
          <button onClick={handleSave} disabled={!form.name.trim() || saving} className="btn-primary text-xs py-1 px-2">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {t("contacts.save")}
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
        {contact.type === "ticket" && <TicketQRLink slug={contact.slug} />}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-brand-600 transition-colors"><Pencil size={13} /></button>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button onClick={handleDelete} className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">{t("contacts.yes")}</button>
            <button onClick={() => setConfirming(false)} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">{t("contacts.no")}</button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
        )}
      </div>
    </div>
  );
}

function AddTicketModal({
  sponsorId, onClose, availableTypes,
}: {
  sponsorId: string;
  onClose: () => void;
  availableTypes: { standard: boolean; vip: boolean };
}) {
  const { t } = useLang();
  const [form, setForm] = useState<TicketFormData>({
    ...EMPTY_TICKET,
    // Pre-selektiraj tip koji partneru još stoji na raspolaganju
    ticket_type: availableTypes.standard ? "standard" : "vip",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function set(key: keyof TicketFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError(t("contacts.nameRequired")); return; }
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
          <h2 className="font-semibold text-gray-900">{t("contacts.addTicketTitle")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contacts.fullName")}</label>
              <input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Marko Horvat" required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contacts.email")}</label>
              <input className="input-field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="marko@firma.hr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contacts.company")}</label>
              <input className="input-field" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Firma d.o.o." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contacts.companyCategory")}</label>
              <select className="input-field" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="">{t("contacts.selectOption")}</option>
                {KATEGORIJE.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contacts.ticketType")}</label>
              <div className="flex gap-2 mt-1">
                {(["standard", "vip"] as const).map((opt) => (
                  <button key={opt} type="button" onClick={() => set("ticket_type", opt)}
                    disabled={!availableTypes[opt]}
                    title={!availableTypes[opt] ? t("contacts.quotaFull") : undefined}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      !availableTypes[opt]
                        ? "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                        : form.ticket_type === opt
                        ? opt === "vip" ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-gray-100 border-gray-300 text-gray-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}>
                    {opt === "vip" ? "VIP" : "Standard"}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contacts.comment")}</label>
              <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder={t("contacts.commentPlaceholder")} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">{t("contacts.cancel")}</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <><Loader2 size={14} className="animate-spin" /> {t("contacts.saving")}</> : t("contacts.addTicketTitle")}
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
  const { t } = useLang();
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

    // Ticket kontakti idu kroz server action (server-side makeUniqueSlug + source)
    if (type === "ticket") {
      const res = await createSponsorTicket(sponsorId, {
        name: form.name,
        email: form.email,
        company: "",
        role: form.role,
        ticket_type: "standard",
        notes: "",
      });
      setSaving(false);
      if (res.error) { setError(res.error); return; }
      setForm(emptyForm);
      setOpen(false);
      router.refresh();
      return;
    }

    // Obične kontakt osobe — slug nije potreban
    const record = {
      sponsor_id: sponsorId,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      role: form.role || null,
      type,
    };
    let { data, error: err } = await supabase
      .from("sponsor_contacts")
      .insert({ ...record, source: "portal" })
      .select()
      .single();
    // Graceful degradation: retry bez source ako kolona ne postoji (migration_039)
    if (err?.message?.includes("source")) {
      ({ data, error: err } = await supabase.from("sponsor_contacts").insert(record).select().single());
    }
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
        {type === "contact" ? t("contacts.addContact") : t("contacts.addTicket")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-3 mt-2 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("contacts.fullName")}</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm py-1.5" autoFocus required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("contacts.role")}</label>
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field text-sm py-1.5" placeholder={t("contacts.rolePlaceholder")} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("contacts.email")}</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm py-1.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("contacts.phone")}</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm py-1.5" placeholder={t("contacts.phonePlaceholder")} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => { setOpen(false); setForm(emptyForm); }} className="btn-secondary text-xs py-1 px-2"><X size={12} /> {t("contacts.cancel")}</button>
        <button type="submit" disabled={!form.name.trim() || saving} className="btn-primary text-xs py-1 px-2">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} {t("contacts.add")}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

interface PrimaryContact { name: string | null; email: string | null; phone: string | null; }

function PrimaryContactSection({ sponsorId, initial }: { sponsorId: string; initial: PrimaryContact }) {
  const { t } = useLang();
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
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.name")}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm py-1.5" autoFocus />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.email")}</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm py-1.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t("contacts.phone")}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm py-1.5" placeholder={t("contacts.phonePlaceholder")} />
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setEditing(false); setError(null); }} className="btn-secondary text-xs py-1 px-2"><X size={12} /> {t("contacts.cancel")}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1 px-2">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {t("contacts.save")}
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
      <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-brand-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
        <Pencil size={13} />
      </button>
    </div>
  );
}

export default function PortalContactsSection({
  sponsorId, primaryContact, contacts: initial, ticketQuota,
}: {
  sponsorId: string;
  primaryContact: PrimaryContact;
  contacts: Contact[];
  ticketQuota: { vip: number | null; standard: number | null };
}) {
  const { t } = useLang();
  const [contacts, setContacts] = useState(initial);
  const [ticketModal, setTicketModal] = useState(false);
  useEffect(() => { setContacts(initial); }, [initial]);

  const mainContacts = contacts.filter((c) => c.type === "contact");
  const ticketContacts = contacts.filter((c) => c.type === "ticket");

  // Iskorištenost limita ulaznica (limit dolazi iz benefita partnera)
  const usedVip = ticketContacts.filter((c) => c.ticket_type === "vip").length;
  const usedStandard = ticketContacts.length - usedVip;
  const vipAvailable = ticketQuota.vip !== null && usedVip < ticketQuota.vip;
  const standardAvailable = ticketQuota.standard !== null && usedStandard < ticketQuota.standard;
  const hasQuota = ticketQuota.vip !== null || ticketQuota.standard !== null;
  const canAddTicket = vipAvailable || standardAvailable;

  const quotaParts: string[] = [];
  if (ticketQuota.standard !== null) quotaParts.push(`${usedStandard}/${ticketQuota.standard} Standard`);
  if (ticketQuota.vip !== null) quotaParts.push(`${usedVip}/${ticketQuota.vip} VIP`);

  function handleDelete(id: string) { setContacts((prev) => prev.filter((c) => c.id !== id)); }
  function handleAdded(c: Contact) { setContacts((prev) => [...prev, c]); }

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><User size={15} className="text-gray-400" />{t("contacts.primary")}</h3>
        <PrimaryContactSection sponsorId={sponsorId} initial={primaryContact} />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><Users size={15} className="text-gray-400" />{t("contacts.contacts")}</h3>
        <div className="divide-y divide-gray-100">
          {mainContacts.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">{t("contacts.noContacts")}</p>}
          {mainContacts.map((c) => <ContactRow key={c.id} contact={c} onDelete={handleDelete} />)}
        </div>
        <AddContactForm sponsorId={sponsorId} type="contact" onAdded={handleAdded} />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm"><Ticket size={15} className="text-gray-400" />{t("contacts.tickets")}</h3>
          {quotaParts.length > 0 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${canAddTicket ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {t("contacts.used")}: {quotaParts.join(" · ")}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          {t("contacts.vipInfo")}
        </p>
        <div className="divide-y divide-gray-100">
          {ticketContacts.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">{t("contacts.noTickets")}</p>}
          {ticketContacts.map((c) => <ContactRow key={c.id} contact={c} onDelete={handleDelete} />)}
        </div>
        {!hasQuota ? (
          <p className="text-xs text-gray-400 mt-1 px-3">{t("contacts.noTicketQuota")}</p>
        ) : canAddTicket ? (
          <button onClick={() => setTicketModal(true)} className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium mt-1 px-3">
            <Plus size={13} />
            {t("contacts.addTicket")}
          </button>
        ) : (
          <p className="text-xs text-gray-400 mt-1 px-3">{t("contacts.quotaFull")}</p>
        )}
        {ticketModal && (
          <AddTicketModal
            sponsorId={sponsorId}
            onClose={() => setTicketModal(false)}
            availableTypes={{ standard: standardAvailable, vip: vipAvailable }}
          />
        )}
      </div>
    </div>
  );
}
