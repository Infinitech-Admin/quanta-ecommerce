const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "https",
        hostname: "infinitech-api17.site",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Service worker only makes sense in production.
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
