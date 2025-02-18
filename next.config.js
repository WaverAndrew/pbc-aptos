/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove or set to false:
    // ppr: true
  },
  images: {
    domains: ['avatar.vercel.sh']
  }
}

module.exports = nextConfig 