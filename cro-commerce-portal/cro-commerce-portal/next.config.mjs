/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // /generator (bez .html) poslužuje public/generator.html — javni alat, vidi middleware.ts
  async rewrites() {
    return [
      { source: "/generator", destination: "/generator.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/generator.html",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
