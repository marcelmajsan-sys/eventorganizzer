"use client";

import { useState } from "react";
import { Download } from "lucide-react";

// Klijentski gumb za jedan-klik preuzimanje ulaznice kao PDF.
// Hvata DOM element kartice (targetId) preko html2canvas i pakira ga u PDF (jsPDF).
// Biblioteke se lazy-loadaju tek na klik da ne opterete javnu stranicu ulaznice.
export default function TicketDownloadButton({
  targetId,
  fileName,
}: {
  targetId: string;
  fileName: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    const el = document.getElementById(targetId);
    if (!el) return;
    setLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";
      const pdf = new jsPDF({
        orientation,
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(fileName);
    } catch (err) {
      console.error("Preuzimanje PDF-a nije uspjelo:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="mt-6 inline-flex items-center gap-2 px-8 py-3 rounded-md text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:opacity-90 disabled:opacity-60 disabled:cursor-wait"
      style={{ background: "#111827" }}
    >
      <Download size={16} />
      {loading ? "Priprema…" : "Preuzmi PDF"}
    </button>
  );
}
