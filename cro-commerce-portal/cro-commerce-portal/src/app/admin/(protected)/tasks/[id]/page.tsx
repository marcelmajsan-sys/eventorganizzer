import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag, FileText, CheckCircle2, Clock, Circle } from "lucide-react";
import TaskDetailActions from "@/components/admin/TaskDetailActions";

const STATUS_LABEL: Record<string, string> = {
  todo: "Za napraviti",
  in_progress: "U tijeku",
  done: "Završeno",
};

const STATUS_STYLE: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  todo: <Circle size={14} />,
  in_progress: <Clock size={14} />,
  done: <CheckCircle2 size={14} />,
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("*, sponsors(id, name, package_type)")
    .eq("id", id)
    .single();

  if (!task) notFound();

  return (
    <div className="animate-enter max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Natrag na zadatke
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">{task.title}</h1>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLE[task.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {STATUS_ICON[task.status]}
                {STATUS_LABEL[task.status] ?? task.status}
              </span>
            </div>
          </div>
          <TaskDetailActions task={task} />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        {task.description && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Opis</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          </div>
        )}

        {task.due_date && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Rok</p>
              <p className="font-medium text-gray-900">
                {new Date(task.due_date).toLocaleDateString("hr-HR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        )}

        {task.assigned_to && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Dodijeljeno</p>
              <p className="font-medium text-gray-900">{task.assigned_to}</p>
            </div>
          </div>
        )}

        {task.sponsors && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Tag size={16} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Sponzor</p>
              <Link
                href={`/admin/sponsors/${task.sponsors.id}`}
                className="font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
              >
                {task.sponsors.name}
              </Link>
              <span className="ml-2 text-xs text-gray-400">{task.sponsors.package_type}</span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 text-xs text-gray-400">
          Kreirano: {new Date(task.created_at).toLocaleDateString("hr-HR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}
