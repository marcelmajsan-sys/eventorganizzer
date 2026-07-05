import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";

const SESSION_TIMEOUT = Symbol("session-timeout");

async function getSessionWithTimeout(supabase: ReturnType<typeof createServerClient>, ms: number) {
  const timeout = new Promise<typeof SESSION_TIMEOUT>((resolve) =>
    setTimeout(() => resolve(SESSION_TIMEOUT), ms)
  );
  async function fetchSession() {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  }
  return Promise.race([fetchSession(), timeout]);
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

  // 1200ms timeout — if Supabase is slow (cold start after pause), pass the
  // request through instead of redirecting a possibly logged-in user to login.
  // Real auth enforcement happens in (protected)/layout.tsx and portal/layout.tsx.
  const session = await getSessionWithTimeout(supabase, 1200);
  if (session === SESSION_TIMEOUT) return supabaseResponse;
  const user = session?.user ?? null;

  const pathname = request.nextUrl.pathname;

  // /admin (exact) = admin login page — always accessible
  // /admin/* = protected area — redirect to /admin login if not authenticated
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    if (!user) return NextResponse.redirect(new URL("/admin", request.url));
  }

  // /portal/* — redirect to partner login (/) if not authenticated
  if (pathname.startsWith("/portal")) {
    if (!user) return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users away from login pages
  if (pathname === "/admin" && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  if (pathname === "/" && user) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // Legacy redirects for old URLs
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname === "/partner") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
