import type { Metadata, Viewport } from "next";
import { Reproductor } from "./Reproductor";

// El reproductor és una aplicació a part dins del mateix lloc: té el seu propi
// manifest, el seu propi àmbit ("/musica") i la seva pròpia icona, de manera
// que instal·lar-lo no arrossega ni toca res del SaaS de coworking.
export const metadata: Metadata = {
  title: "Música",
  description: "Reproductor de les cançons que ja tens descarregades al dispositiu.",
  manifest: "/musica/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Música", statusBarStyle: "default" },
  icons: { apple: "/musica/icona-180.png" },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

export default function MusicaPage() {
  return <Reproductor />;
}
