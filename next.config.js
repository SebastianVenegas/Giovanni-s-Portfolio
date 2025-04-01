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
  webpack: (config, { isServer }) => {
    // Fix for PostgreSQL client in serverless environment
    if (!isServer) {
      // Don't resolve Node.js modules on the client
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        stream: false,
        os: false,
        util: false,
        buffer: false,
        querystring: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false,
        dns: false,
        dgram: false,
        url: false,
      }
      
      // Mock pg module
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /pg/,
          'noop-loader'
        )
      );
    }
    return config
  }
}

module.exports = nextConfig 