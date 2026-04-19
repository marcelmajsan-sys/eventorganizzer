"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  benefitId: string;
  benefitName: string;
}

export default function DeleteBenefitButton({ benefitId, benefitName }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRemove() {
    setLoading(true);
    await supabase
      .from("sponsor_benefits")
      .delete()
      .eq("id", benefitId);
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-red-600 font-medium">Makni?</span>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : "Da"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
        >
          Ne
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
      title={`Makni benefit: ${benefitName}`}
    >
      <Trash2 size={14} />
    </button>
  );
}
