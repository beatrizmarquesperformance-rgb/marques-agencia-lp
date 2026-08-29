import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel Blob + common video-thumbnail hosts. Add real hostnames as assets land.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  experimental: {
    // keep server actions payloads small; media goes through Blob not actions
  },
};

export default nextConfig;
