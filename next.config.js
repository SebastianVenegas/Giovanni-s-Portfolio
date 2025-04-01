/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com']
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript error checking during build
    ignoreBuildErrors: true,
    tsconfigPath: "tsconfig.json",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle pg and related packages on the client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        http: false,
        https: false,
        zlib: false,
        'pg-native': false,
        pg: false,
        'pg-pool': false,
        'pg-connection-string': false,
        pgpass: false,
        'pg-format': false,
        'pg-cursor': false,
      };
    }
    return config
  },
  // Mark pg and related packages as external for server components
  serverExternalPackages: ['pg', 'pg-pool', 'pg-connection-string', 'pgpass']
}

module.exports = nextConfig 