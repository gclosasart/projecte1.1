import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // El service worker del reproductor (/musica) no s'ha de guardar mai a
        // la memòria cau del navegador: si no, un desplegament nou pot trigar
        // hores a arribar als dispositius que ja el tenen registrat.
        source: "/musica-sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/musica" },
        ],
      },
    ];
  },
};

export default nextConfig;
