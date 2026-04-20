import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal/benefits";

  if (code) {
    const projectId = resolveProjectId(request.cookies.get(PROJECT_COOKIE)?.value);
    const project = PROJECTS[projectId];

    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(project.url, project.anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => {
          cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }

  return NextResponse.redirect(`${origin}/login?error=no_access`);
}
