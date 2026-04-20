"use client";

import { useState } from "react";
import { Users, Plus, Pencil, Trash2, X, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { createUserInAllProjects, updateUserInAllProjects, deleteUserFromAllProjects } from "@/app/actions/userManagement";
import { useRouter } from "next/navigation";

interface UserRow {
  email: string;
  name: string | null;
  id2026: string | null;
  id2025: string | null;
}

interface Props {
  users: UserRow[];
}

export default function UserManagementSection({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();

  const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUserInAllProjects(addForm.name, addForm.email, addForm.password);
      setUsers((prev) => [...prev, { email: addForm.email.toLowerCase(), name: addForm.name, id2026: null, id2025: null }].sort((a, b) => a.email.localeCompare(b.email)));
      setAddForm({ name: "", email: "", password: "" });
      setShowAdd(false);
      flash("Korisnik je kreiran u svim bazama.");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(user: UserRow) {
    setEditUser(user);
    setEditForm({ name: user.name ?? "", email: user.email, password: "" });
    setShowPwd(false);
    setError(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setLoading(true);
    setError(null);
    try {
      await updateUserInAllProjects(editUser.id2026, editUser.id2025, editForm.name, editForm.email, editForm.password || undefined);
      setUsers((prev) => prev.map((u) => u.email === editUser.email ? { ...u, name: editForm.name, email: editForm.email } : u));
      setEditUser(null);
      flash("Korisnik je ažuriran.");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(user: UserRow) {
    if (!confirm(`Obriši korisnika "${user.email}"? Izgubit će pristup portalu.`)) return;
    setLoading(true);
    setError(null);
    try {
      await deleteUserFromAllProjects(user.email);
      setUsers((prev) => prev.filter((u) => u.email !== user.email));
      flash("Korisnik je obrisan.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900">Pristup portalu</h2>
        </div>
        <button onClick={() => { setShowAdd(true); setError(null); }} className="btn-primary text-sm py-1.5">
          <Plus size={14} /> Novi korisnik
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Korisnici s pristupom portalu. Kreiraju se u svim bazama (2025 i 2026) s lozinkom za prijavu.
      </p>

      {error && <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">{success}</div>}

      <div className="space-y-2 mb-4">
        {users.length === 0 && <p className="text-sm text-gray-400 italic">Nema korisnika.</p>}
        {users.map((user) => (
          <div key={user.email} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
            <div>
              {user.name && <p className="text-sm font-medium text-gray-800">{user.name}</p>}
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(user)} className="text-gray-400 hover:text-brand-600 transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(user)} disabled={loading} className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add user modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display text-xl font-bold text-gray-900">Novi korisnik</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ime i prezime *</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="input-field" placeholder="Marko Horvat" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="input-field" placeholder="marko@ecommerce.hr" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lozinka *</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="input-field pr-10" placeholder="Min. 6 znakova" required minLength={6} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Odustani</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Kreira...</> : <><Plus size={14} /> Kreiraj</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display text-xl font-bold text-gray-900">Uredi korisnika</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ime i prezime</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" placeholder="Marko Horvat" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova lozinka <span className="text-gray-400 font-normal">(ostavi prazno za bez promjene)</span></label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="input-field pr-10" placeholder="Min. 6 znakova" minLength={editForm.password ? 6 : 0} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="btn-secondary flex-1 justify-center">Odustani</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : <><Save size={14} /> Spremi</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
