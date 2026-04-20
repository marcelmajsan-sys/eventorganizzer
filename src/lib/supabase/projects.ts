export const PROJECT_COOKIE = "cro_active_project";

export type ProjectId = "2026" | "2025";

export const PROJECTS: Record<ProjectId, {
  label: string;
  url: string;
  anonKey: string;
  serviceKey: string;
  conferenceDate: string;
}> = {
  "2026": {
    label: "CRO Commerce 2026",
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_2026 ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_2026 ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY_2026 ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    conferenceDate: "2026-10-13",
  },
  "2025": {
    label: "CRO Commerce 2025",
    url: "https://bpybtjwdrnuufxmgczus.supabase.co",
    anonKey: "sb_publishable_ys-Q9yxUQ7Z53CoK68Y4sg_OeJ8OZEs",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY_2025 ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    conferenceDate: "2025-06-10",
  },
};

export function resolveProjectId(value: string | undefined): ProjectId {
  return value === "2025" ? "2025" : "2026";
}
