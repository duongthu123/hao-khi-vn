/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable TypeScript during builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization configuration for game assets
  images: {
    // Configure image formats (WebP with AVIF fallback)
    formats: ['image/avif', 'image/webp'],
    // Responsive image sizes for srcset generation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Image quality settings
    minimumCacheTTL: 31536000, // 1 year cache
    // Disable static imports for game sprites (we'll handle them manually)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Remote patterns for future CDN support
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Empty turbopack config to silence the webpack migration warning
  // This allows the build to proceed with Turbopack (Next 16 default)
  turbopack: {},

  // Build output optimization
  output: 'standalone',
  
  // Compression
  compress: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },

  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/hinh/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },

  // Redirects for legacy paths if needed
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
