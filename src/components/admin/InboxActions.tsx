"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, CheckCheck, Check, RotateCcw } from "lucide-react";
import { markNotificationRead, markNotificationUnread, markAllNotificationsRead } from "@/app/actions/notifications";

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
