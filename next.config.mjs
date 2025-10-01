/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/parent',
  assetPrefix: '/parent/',   // ensures static assets load correctly
  trailingSlash: true        // helps when deploying in subdirectories
};

export default nextConfig;
