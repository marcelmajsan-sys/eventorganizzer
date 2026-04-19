"use client";

import { useState, useCallback } from "react";
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Calendar, Tag, GripVertical, ExternalLink } from "lucide-react";
import { formatDate, packageBadgeColor } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "Za napraviti", color: "bg-gray-100 text-gray-700" },
  { id: "in_progress", label: "U tijeku", color: "bg-blue-100 text-blue-700" },
  { id: "done", label: "Završeno", color: "bg-emerald-100 text-emerald-700" },
];

interface TaskCardProps {
  task: Task & { sponsors?: { name: string; package_type: string } | null };
  isDragging?: boolean;
}

function TaskCard({ task, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-default ${isDragging ? "shadow-xl rotate-1" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 transition-colors mt-0.5 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <Link href={`/admin/tasks/${task.id}`} className="text-sm font-medium text-gray-900 leading-snug hover:text-brand-600 transition-colors line-clamp-2 block">
            {task.title}
          </Link>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {task.sponsors && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-white ${packageBadgeColor(task.sponsors.package_type as any)}`}>
                <Tag size={10} />
                {task.sponsors.name}
              </span>
            )}
            {task.due_date && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={10} />
                {formatDate(task.due_date)}
              </span>
            )}
            {task.assigned_to && (
              <span className="text-xs text-gray-400">
                → {task.assigned_to}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({ initialTasks }: { initialTasks: (Task & { sponsors?: any })[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<(Task & { sponsors?: any }) | null>(null);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column header
    const targetColumn = COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetColumn.id } : t))
      );
      await supabase.from("tasks").update({ status: targetColumn.id }).eq("id", taskId);
      return;
    }

    // Check if dropped on another task — figure out which column that task is in
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && overTask.status !== tasks.find((t) => t.id === taskId)?.status) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: overTask.status } : t))
      );
      await supabase.from("tasks").update({ status: overTask.status }).eq("id", taskId);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.id);
          return (
            <div
              key={col.id}
              className="bg-gray-50 rounded-xl border border-gray-200 p-4"
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.color}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Drop zone for column */}
              <div
                id={col.id}
                className="min-h-[200px] space-y-2.5"
              >
                <SortableContext
                  items={colTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </SortableContext>

                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-gray-400">Povucite zadatak ovdje</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 shadow-2xl">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
