/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['arbxtwjsdxjypgjeoxqr.supabase.co'],
  },
}
module.exports = nextConfig
