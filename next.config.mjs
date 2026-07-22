/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  experimental: {
    // PGlite (WASM Postgres) and its Prisma adapter must stay external
    // to the server bundle so Next does not try to bundle the WASM.
    serverComponentsExternalPackages: [
      "@electric-sql/pglite",
      "pglite-prisma-adapter",
      "@prisma/driver-adapter-utils",
    ],
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Workaround for "Missing ActionQueueContext" error with React DevTools + Next.js 14 App Router
      // See: https://github.com/vercel/next.js/issues/57642
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-reconciler': 'react-reconciler/cjs/react-reconciler.production.min.js',
      };
    }
    return config;
  },
};

export default nextConfig;
