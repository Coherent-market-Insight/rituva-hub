/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@prisma/adapter-libsql',
      '@libsql/client',
      '@libsql/hrana-client',
      '@libsql/isomorphic-fetch',
      '@libsql/isomorphic-ws',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

