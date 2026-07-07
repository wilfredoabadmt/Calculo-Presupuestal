/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Skip type checking during build (CI already handles this)
  // This saves ~2 minutes on each Docker build
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 4,
  },
  allowedDevOrigins: ['192.168.0.7', 'localhost:3000']
};

export default nextConfig;
