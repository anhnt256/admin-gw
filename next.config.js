/** @type {import('next').NextConfig} */

const Timestamp = new Date().getTime();

const nextConfig = {
  compress: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  swcMinify: true,
  headers: () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "force-no-store",
        },
      ],
    },
  ],
  webpack(config, { isServer }) {
    if (!isServer) {
      // Modifying the output filename for client-side bundles
      config.output.filename = `static/chunks/[name].${Timestamp}.js`;
      config.output.chunkFilename = `static/chunks/[name].${Timestamp}.js`;
    }
    return config;
  },
};

module.exports = nextConfig;
