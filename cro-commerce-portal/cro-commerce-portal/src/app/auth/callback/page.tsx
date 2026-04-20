"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { PROJECTS, resolveProjectId, PROJECT_COOKIE } from "@/lib/supabase/projects";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/portal/benefits";

  useEffect(() => {
    const rawCookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith(PROJECT_COOKIE + "="))
      ?.split("=")[1]
      ?.trim();
    const projectId = resolveProjectId(rawCookie);
    const { url, anonKey } = PROJECTS[projectId];
    const supabase = createBrowserClient(url, anonKey);

    // PKCE flow: code in query param
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.push(error ? "/login?error=no_access" : next);
      });
      return;
    }

    // Implicit flow: tokens in URL hash — onAuthStateChange picks them up
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push(next);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Prebacivanje projekta...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
