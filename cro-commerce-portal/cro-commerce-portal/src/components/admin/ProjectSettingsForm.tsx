"use client";

import { useState } from "react";
import { Save, CalendarDays } from "lucide-react";
import { updateConferenceDate } from "@/app/actions/projectSettings";

interface Props {
  conferenceDate: string;
  projectLabel: string;
}

export default function ProjectSettingsForm({ conferenceDate, projectLabel }: Props) {
  const [date, setDate] = useState(conferenceDate);
  const [dateSaving, setDateSaving] = useState(false);
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDateSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={18} className="text-brand-600" />
        <h2 className="font-semibold text-gray-900">Datum konferencije</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Datum koji se prikazuje u odbrojavanju u bočnom izborniku za <strong>{projectLabel}</strong>.
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
  );
}
