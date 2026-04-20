/** @type {import('next').NextConfig} */
// build-bust: 2026-04-20
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
