import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PROJECTS } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";
import { IMP_COOKIE } from "@/lib/impersonation";

// GET /api/auth/signout?redirect=/login%3Ferror%3Dno_access
// Route Handler može pisati cookies (za razliku od Server Component layouta),
// pa signOut() ovdje stvarno briše session cookie i sprječava redirect petlje.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  // Dozvoli samo relativne putanje — sprječava open redirect na vanjske domene
  // ("//example.com" bi browser tretirao kao protocol-relative URL).
  let redirectTo = request.nextUrl.searchParams.get("redirect") ?? "/";
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    redirectTo = "/";
  }

  // Obična odjava mora ubiti i impersonaciju — inače bi cookie s adminovim
  // tokenima preživio i sljedeći partner na istom računalu bi gumbom "Izađi"
  // dobio adminovu sesiju.
  cookieStore.delete(IMP_COOKIE);

  // Odjavi iz oba projekta kako bi se cookies sigurno obrisali
  for (const pid of ["2026", "2025"] as ProjectId[]) {
    try {
      const supabase = createServerClient(
        PROJECTS[pid].url,
        PROJECTS[pid].anonKey,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cs) => {
              cs.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            },
          },
        }
      );
      await supabase.auth.signOut();
    } catch {
      // Ignoriraj grešku — nastavi s drugim projektom
    }
  }

  // Redirect na ciljanu stranicu (npr. /login?error=no_access)
  const baseUrl = new URL(request.url).origin;
  return NextResponse.redirect(new URL(redirectTo, baseUrl));
}
