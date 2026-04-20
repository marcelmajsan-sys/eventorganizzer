"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { PROJECTS, PROJECT_COOKIE } from "@/lib/supabase/projects";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noAccess = searchParams.get("error") === "no_access";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(noAccess ? "Nemate pristup ovom portalu. Kontaktirajte CRO Commerce tim." : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Try both projects — user may exist in either 2026 or 2025
    for (const projectId of ["2026", "2025"] as const) {
      const client = createBrowserClient(PROJECTS[projectId].url, PROJECTS[projectId].anonKey);
      const { data, error: authError } = await client.auth.signInWithPassword({ email, password });
      if (!authError && data.user) {
        document.cookie = `${PROJECT_COOKIE}=${projectId}; path=/; max-age=31536000`;
        router.push("/admin/dashboard");
        router.refresh();
        return;
      }
    }

    setError("Neispravni podaci za prijavu. Provjerite email i lozinku.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-orange-50 to-transparent opacity-30 rounded-full" />
      </div>

      <div className="relative w-full max-w-md animate-enter">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl shadow-lg mb-4 shadow-orange-200">
            <span className="text-white font-display font-bold text-xl">CC</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">CRO Commerce</h1>
          <p className="text-gray-500 mt-1">Admin portal</p>
        </div>

        {/* Login card */}
        <div className="card p-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-6">Prijava u portal</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email adresa
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.com"
                required
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lozinka
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Prijava u tijeku...</>
              ) : (
                <><LogIn size={16} /> Prijavi se</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Pristupni podaci su vam dostavljeni emailom.
              Za tehničku podršku kontaktirajte tim CRO Commerce.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 CRO Commerce · Sva prava pridržana
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
