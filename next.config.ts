import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },

  images: {
    domains: ['avatar.vercel.sh'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {

    ignoreBuildErrors: true,
  }
};

export default nextConfig;
