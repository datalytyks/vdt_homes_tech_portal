/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', process.env.VERCEL_URL ?? ''] },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname:  'api.vdthomes.com',
        pathname:  '/storage/v1/object/public/**',
      },
    ],
  },
}

export default config
