"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, CheckCheck, Check, RotateCcw, Trash2 } from "lucide-react";
import { markNotificationRead, markNotificationUnread, markAllNotificationsRead, deleteNotification } from "@/app/actions/notifications";

export function MarkAllReadButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    await markAllNotificationsRead();
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handle}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors disabled:opacity-40"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
      Označi sve kao pročitano
    </button>
  );
}

export function MarkReadButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    await markNotificationRead(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      title="Označi kao pročitano"
      className="p-1 text-gray-300 hover:text-brand-600 transition-colors flex-shrink-0"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
    </button>
  );
}

export function MarkUnreadButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    await markNotificationUnread(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      title="Označi kao nepročitano"
      className="p-1 text-gray-300 hover:text-brand-600 transition-colors flex-shrink-0"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
    </button>
  );
}

export function DeleteNotificationButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    await deleteNotification(id);
    setLoading(false);
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handle}
          disabled={loading}
          className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : "Da"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Ne
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title="Obriši obavijest"
      className="p-1 text-gray-200 hover:text-red-500 transition-colors flex-shrink-0"
    >
      <Trash2 size={13} />
    </button>
  );
}
