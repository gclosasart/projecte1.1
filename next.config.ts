import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // El reproductor de música vivia aquí i ara té projecte propi. Qui
      // tingui l'adreça desada o l'app antiga instal·lada, cap allà.
      { source: "/musica", destination: "https://musica.trempt.es", permanent: false },
      { source: "/musica/:cami*", destination: "https://musica.trempt.es", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        // La làpida del service worker del reproductor no s'ha de guardar mai
        // a la memòria cau: és justament el fitxer que ha d'arribar als
        // dispositius que encara duen el reproductor antic instal·lat.
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
