/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        allowedDevOrigins: ["*.ngrok-free.app"]
    },
    output: 'standalone'
};

module.exports = nextConfig;
