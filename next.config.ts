import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper routing for custom domains
  trailingSlash: false,

  // Enable experimental features that might help with custom domains
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Ensure static optimization works properly
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
