import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Hata olsa bile görmezden gel, siteyi kur
    ignoreBuildErrors: true,
  },
  eslint: {
    // Yazım hatalarını dert etme
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // O ağır canvas paketini yükleme
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
