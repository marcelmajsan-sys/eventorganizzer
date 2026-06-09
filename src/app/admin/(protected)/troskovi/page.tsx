import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import BudgetView from "@/components/admin/BudgetView";

export default async function TroskoviPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);

  let items: any[] = [];
  try {
    const { data } = await supabase
      .from("budget_items")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order")
      .order("created_at");
    items = data ?? [];
  } catch {
    // Table not yet created — show empty state
  }

  return (
    <div className="animate-enter">
      <div className="page-header">
        <h1 className="page-title">Troškovi</h1>
        <p className="page-subtitle">Praćenje budžeta i troškova eventa</p>
      </div>
      <BudgetView items={items} projectId={projectId} />
    </div>
  );
}
