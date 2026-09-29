// Làpida del reproductor de música.
//
// El reproductor vivia a /musica i ara viu al seu propi projecte
// (musica.trempt.es). Els dispositius que se'l van instal·lar des d'aquí
// encara duen registrat aquest service worker, i mentre existeixi seguiran
// veient la còpia desada d'una app que ja no hi és.
//
// Aquest fitxer el substitueix: buida la memòria cau, es dona de baixa i
// envia les pestanyes obertes a la casa nova. Es pot esborrar del projecte
// quan faci temps que no li arribi cap petició.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const claus = await caches.keys();
      await Promise.all(claus.filter((clau) => clau.startsWith("musica")).map((clau) => caches.delete(clau)));
      await self.registration.unregister();
      const finestres = await self.clients.matchAll({ type: "window" });
      for (const finestra of finestres) finestra.navigate("https://musica.trempt.es");
    })(),
  );
});
