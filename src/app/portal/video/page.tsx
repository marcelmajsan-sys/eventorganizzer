import { ExternalLink } from "lucide-react";

export default function PortalVideoPage() {
  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">CRO COMMERCE 2025 - Feel The Vibes</h1>
          <a
            href="https://www.youtube.com/playlist?list=PLh0dpf63k_OPVs640lFKl2T44wK-60ff8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-semibold text-lg mt-1 w-fit"
          >
            Watch program recordings
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <div className="card p-6">
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
