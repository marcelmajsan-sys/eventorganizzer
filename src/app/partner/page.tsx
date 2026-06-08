"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { PROJECT_COOKIE, PROJECTS } from "@/lib/supabase/projects";
import { findPartnerProject } from "@/app/actions/findPartnerProject";
import { Eye, EyeOff, LogIn, Loader2, Building2, Languages } from "lucide-react";

type Lang = "hr" | "en";

const TEXT = {
  hr: {
    subtitle: "Partnerski portal",
    cardTitle: "Prijava za partnere",
    emailLabel: "Email adresa",
    emailPlaceholder: "vas@email.com",
    passwordLabel: "Lozinka",
    submit: "Prijavi se",
    submitting: "Prijava u tijeku...",
    noAccess: "Nemate pristup ovom portalu. Kontaktirajte CRO Commerce tim.",
    invalid: "Neispravni podaci za prijavu. Provjerite email i lozinku.",
    help: "Ako imate pitanja ili želite promijeniti lozinku, javite se na mail: marcel@ecommerce.hr",
    copyright: "Powered by Ecommerce d.o.o. © 2026",
    langToggle: "Translate to english",
  },
  en: {
    subtitle: "Partner portal",
    cardTitle: "Partner sign in",
    emailLabel: "Email address",
    emailPlaceholder: "you@email.com",
    passwordLabel: "Password",
    submit: "Sign in",
    submitting: "Signing in...",
    noAccess: "You do not have access to this portal. Please contact the CRO Commerce team.",
    invalid: "Invalid login details. Please check your email and password.",
    help: "If you have any questions or wish to change your password, contact us at: marcel@ecommerce.hr",
    copyright: "Powered by Ecommerce d.o.o. © 2026",
    langToggle: "Prevedi na hrvatski",
  },
} as const;

function PartnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noAccess = searchParams.get("error") === "no_access";
  const [lang, setLang] = useState<Lang>("hr");
  const t = TEXT[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // null = no error; "noAccess" | "invalid" = error key (so message follows the selected language)
  const [errorKey, setErrorKey] = useState<"noAccess" | "invalid" | null>(noAccess ? "noAccess" : null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorKey(null);

    // Find which project this email belongs to (server-side, avoids createBrowserClient singleton issue)
    const projectId = await findPartnerProject(email);
    if (!projectId) {
      setErrorKey("invalid");
      setLoading(false);
      return;
    }

    // Create ONE client for the correct project
    const { url, anonKey } = PROJECTS[projectId];
    const client = createBrowserClient(url, anonKey);
    const { data, error: authError } = await client.auth.signInWithPassword({ email, password });

    if (!authError && data.user) {
      document.cookie = `${PROJECT_COOKIE}=${projectId}; path=/; max-age=31536000`;
      router.push("/portal/benefits");
      router.refresh();
      return;
    }

    setErrorKey("invalid");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative w-full max-w-md animate-enter">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl shadow-lg mb-4 shadow-orange-200">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">CRO Commerce 2026</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        <div className="card p-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="font-semibold text-lg text-gray-900">{t.cardTitle}</h2>
            <button
              type="button"
              onClick={() => setLang(lang === "hr" ? "en" : "hr")}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-600 transition-colors whitespace-nowrap"
            >
              <Languages size={14} />
              {t.langToggle}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.passwordLabel}</label>
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

            {errorKey && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {t[errorKey]}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> {t.submitting}</>
              ) : (
                <><LogIn size={16} /> {t.submit}</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              {t.help}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t.copyright}
        </p>
      </div>
    </div>
  );
}

export default function PartnerLoginPage() {
  return (
    <Suspense>
      <PartnerLoginForm />
    </Suspense>
  );
}
