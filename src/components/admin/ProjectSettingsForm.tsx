"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Save, CalendarDays, Users } from "lucide-react";
import {
  updateConferenceDate,
  addProjectAdmin,
  removeProjectAdmin,
} from "@/app/actions/projectSettings";

interface Props {
  conferenceDate: string;
  admins: string[];
  projectLabel: string;
}

export default function ProjectSettingsForm({ conferenceDate, admins: initialAdmins, projectLabel }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(conferenceDate);
  const [dateSaving, setDateSaving] = useState(false);
  const [admins, setAdmins] = useState(initialAdmins);
  const [newEmail, setNewEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleDateSave() {
    setDateSaving(true);
    setError(null);
    try {
      await updateConferenceDate(date);
      flash("Datum konferencije je ažuriran.");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDateSaving(false);
    }
  }

  async function handleAddEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = newEmail.toLowerCase().trim();
    if (!email) return;
    setAddingEmail(true);
    setError(null);
    try {
      await addProjectAdmin(email);
      setAdmins((prev) => [...prev, email].sort());
      setNewEmail("");
      flash("Korisnik je dodan.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAddingEmail(false);
    }
  }

  async function handleRemoveEmail(email: string) {
    setRemovingEmail(email);
    setError(null);
    try {
      await removeProjectAdmin(email);
      setAdmins((prev) => prev.filter((a) => a !== email));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRemovingEmail(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Conference date */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={18} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900">Datum konferencije</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Datum koji se prikazuje u odbrojavanju u bočnom izborniku za{" "}
          <strong>{projectLabel}</strong>.
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-gray-500 mb-1">Datum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleDateSave}
            disabled={dateSaving}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {dateSaving ? "Sprema..." : "Spremi"}
          </button>
        </div>
      </div>

      {/* Admin access */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900">Pristup portalu</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Osobe s pristupom ovom projektu. Kada prelaze na ovaj projekt s drugog projekta,
          neće morati ponovo unositi lozinku.
        </p>

        <div className="space-y-2 mb-4">
          {admins.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Nema dodanih korisnika. Pokrenite migraciju migration_005.
            </p>
          ) : (
            admins.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-700">{email}</span>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  disabled={removingEmail === email}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddEmail} className="flex gap-2">
          <input
            type="email"
            placeholder="novi@email.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={addingEmail || !newEmail.trim()}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            Dodaj
          </button>
        </form>
      </div>
    </div>
  );
}
