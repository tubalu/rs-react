/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@biomejs/biome'],
  },
  images: {
    unoptimized: true,
  },
  // Remove static export for Vercel deployment
  // output: 'export',
  trailingSlash: true,
  basePath: '',
};

export default nextConfig;