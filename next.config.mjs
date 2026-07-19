/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // PGlite (WASM Postgres) and its Prisma adapter must stay external
    // to the server bundle so Next does not try to bundle the WASM.
    serverComponentsExternalPackages: [
      "@electric-sql/pglite",
      "pglite-prisma-adapter",
      "@prisma/driver-adapter-utils",
    ],
  },
};

export default nextConfig;
