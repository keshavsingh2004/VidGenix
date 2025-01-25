/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
  async headers() {
    return [
      {
        source: '/generated/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://vidgenix-fspzp.kinsta.app'
          }
        ]
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/**',
      },
    ],
  },
};

module.exports = nextConfig;
