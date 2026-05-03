import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";

async function getSessionWithTimeout(supabase: ReturnType<typeof createServerClient>, ms: number) {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
  const session = supabase.auth.getSession().then((r) => r.data.session).catch(() => null);
  return Promise.race([session, timeout]);
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const projectId = resolveProjectId(request.cookies.get(PROJECT_COOKIE)?.value);
  const project = PROJECTS[projectId];

  const supabase = createServerClient(project.url, project.anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // 1200ms timeout — if Supabase is slow (cold start after pause), pass through.
  // Real auth enforcement happens in admin/layout.tsx and portal/layout.tsx.
  const session = await getSessionWithTimeout(supabase, 1200);
  const user = session?.user ?? null;

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/portal")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
