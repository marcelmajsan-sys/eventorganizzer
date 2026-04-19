import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";

const FALLBACK_ADMIN_EMAILS = [
  "marcel@ecommerce.hr",
  "udruga@ecommerce.hr",
  "laura@ecommerce.hr",
];

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

  // Service-role client for reading project_admins (bypasses RLS)
  const adminServiceClient = createClient(project.url, project.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Run auth check and admin list fetch in parallel; fall back if table doesn't exist yet
  const [{ data: { user } }, adminsRes] = await Promise.all([
    supabase.auth.getUser(),
    adminServiceClient.from("project_admins").select("email").then(
      (r) => r,
      () => ({ data: null, error: null })
    ),
  ]);

  const adminEmails =
    adminsRes.data && adminsRes.data.length > 0
      ? (adminsRes.data as { email: string }[]).map((a) => a.email)
      : FALLBACK_ADMIN_EMAILS;

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (!adminEmails.includes(user.email ?? ""))
      return NextResponse.redirect(new URL("/portal", request.url));
  }

  if (pathname.startsWith("/portal")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && user) {
    if (adminEmails.includes(user.email ?? ""))
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
