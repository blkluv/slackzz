/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "youthful-dodo-681.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
