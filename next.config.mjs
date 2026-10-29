/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep dev output separate so a production build cannot corrupt a live dev server.
  distDir: process.env.NODE_ENV === "development" ? "next-dev" : ".next",
  webpack: (c) => { c.resolve.alias.canvas = false; return c; },
};
export default nextConfig;
