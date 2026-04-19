import { createClient } from "@/lib/supabase/server";
import ProgramView from "@/components/admin/ProgramView";

export default async function ProgramPage() {
  const supabase = await createClient();

  let sessions: any[] = [];
  try {
    const { data } = await supabase
      .from("program_sessions")
      .select("*")
      .order("time_start")
      .order("sort_order");
    sessions = data ?? [];
  } catch {
    // Table not yet created — show empty state with instructions
  }

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Program</h1>
          <p className="page-subtitle">Raspored sesija i predavača po pozornicama</p>
        </div>
      </div>
      <ProgramView sessions={sessions} />
    </div>
  );
}
