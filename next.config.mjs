/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Sortie autonome pour une image Docker légère (node server.js).
  output: "standalone",
};

export default nextConfig;
