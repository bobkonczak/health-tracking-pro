import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper routing for custom domains
  trailingSlash: false,

  // Enable experimental features that might help with custom domains
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Add headers for better custom domain support
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Ensure static optimization works properly
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
