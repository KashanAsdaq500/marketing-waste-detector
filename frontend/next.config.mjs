/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://marketing-waste-detector.vercel.app/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;