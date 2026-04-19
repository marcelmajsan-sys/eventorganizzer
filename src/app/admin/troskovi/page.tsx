import { createClient } from "@/lib/supabase/server";
import BudgetView from "@/components/admin/BudgetView";

export default async function TroskoviPage() {
  const supabase = await createClient();

  let items: any[] = [];
  try {
    const { data } = await supabase
      .from("budget_items")
      .select("*")
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
      <BudgetView items={items} />
    </div>
  );
}
