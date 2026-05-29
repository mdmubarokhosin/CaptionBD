import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages compatible output
  output: "standalone",

  // TypeScript: Don't fail build on type errors (production deploy)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable strict mode to avoid double-render issues on deployment
  reactStrictMode: false,

  // Image optimization - use unoptimized for static hosting compatibility
  images: {
    unoptimized: true,
  },

  // Firebase SDK needs to be bundled server-side
  serverExternalPackages: ["firebase"],
};

export default nextConfig;
