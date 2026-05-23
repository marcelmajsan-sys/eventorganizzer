import { Youtube } from "lucide-react";

export default function PortalVideoPage() {
  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">CRO Commerce 2025</h1>
          <p className="page-subtitle">Snimka konferencije</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Youtube size={20} className="text-red-600" />
          <h2 className="font-semibold text-gray-900">CRO Commerce 2025 — video snimka</h2>
        </div>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src="https://www.youtube.com/embed/N_3Uyjn_jqc"
            title="CRO Commerce 2025"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
