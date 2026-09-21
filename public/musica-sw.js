// Service worker del reproductor de música (/musica).
//
// Viu a l'arrel del lloc, i no dins de /musica/, perquè l'àmbit d'un service
// worker només pot ser el seu propi directori o un de més avall: des d'aquí
// es pot registrar amb àmbit "/musica" (sense barra final), que és la ruta
// exacta de la pàgina. La resta de l'app (el SaaS de coworking) queda fora de
// l'àmbit i no la toca mai.
//
// Només guarda a la memòria cau l'"esquelet" de l'aplicació. Les cançons no hi
// passen: viuen a IndexedDB perquè és qui les hi ha posat des del seu
// dispositiu, no s'han descarregat mai d'aquest servidor.

const CAU = "musica-v1";
const ESQUELET = [
  "/musica",
  "/musica/icona-192.png",
  "/musica/icona-512.png",
  "/musica/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CAU)
      // addAll és tot-o-res: si una sola peça falla (posem, sense xarxa a
      // mig registre), no volem que el service worker no s'instal·li mai.
      .then((cau) => Promise.allSettled(ESQUELET.map((ruta) => cau.add(ruta))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claus) => Promise.all(claus.filter((clau) => clau !== CAU).map((clau) => caches.delete(clau))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const peticio = event.request;
  if (peticio.method !== "GET") return;

  const url = new URL(peticio.url);
  if (url.origin !== self.location.origin) return;

  // Navegació cap al reproductor: primer la xarxa (per estrenar desplegaments
  // nous de seguida), i si no n'hi ha, la còpia desada.
  if (peticio.mode === "navigate" && url.pathname.startsWith("/musica")) {
    event.respondWith(
      fetch(peticio)
        .then((resposta) => {
          desa(peticio, resposta.clone());
          return resposta;
        })
        .catch(async () => (await caches.match("/musica")) ?? Response.error()),
    );
    return;
  }

  // Estàtics de Next.js i icones: tenen un hash al nom o no canvien mai, així
  // que la còpia desada sempre és bona i estalvia xarxa.
  const esEstatic =
    url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/musica/");
  if (!esEstatic) return;

  event.respondWith(
    caches.match(peticio).then(
      (desada) =>
        desada ??
        fetch(peticio).then((resposta) => {
          desa(peticio, resposta.clone());
          return resposta;
        }),
    ),
  );
});

function desa(peticio, resposta) {
  if (!resposta || !resposta.ok || resposta.type === "opaque") return;
  caches.open(CAU).then((cau) => cau.put(peticio, resposta));
}
