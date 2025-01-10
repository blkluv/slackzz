/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "youthful-dodo-681.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "steady-swordfish-279.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/a/od86u4rt7r/*",
      },
    ],
  },
};

export default nextConfig;
