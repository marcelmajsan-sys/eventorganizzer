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

    // flowType implicit — admin-generated magic links use hash fragment tokens, not PKCE codes
    const supabase = createBrowserClient(url, anonKey, {
      auth: { flowType: "implicit" },
    });

    // PKCE flow: ?code= in query string (regular sign-in flows)
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? "/login?error=no_access" : next);
      });
      return;
    }

    // Implicit flow: tokens in URL hash (#access_token=...&refresh_token=...)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ data: { session }, error }) => {
            router.replace(!error && session ? next : "/login?error=no_access");
          });
        return;
      }
    }

    // Fallback: listen for SIGNED_IN (handles cases where client auto-processes the URL)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) router.replace(next);
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
