import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";

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

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect admin routes — only require authentication here.
  // Admin authorization (project_admins check) is done in admin/layout.tsx
  // which runs server-side and can access service role keys.
  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/portal")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login page to admin dashboard.
  // Admin authorization will gate access from within layout.tsx.
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
