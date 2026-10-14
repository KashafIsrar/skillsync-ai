/** @type {import('next').NextConfig} */
const nextConfig = { webpack: (c) => { c.resolve.alias.canvas = false; return c; } };
export default nextConfig;
