/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  assetPrefix: process.env.APP_URL || "",
};

export default nextConfig;
