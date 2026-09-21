// Biblioteca de música local (IndexedDB).
//
// Tot viu al dispositiu de qui escolta: cap cançó no puja mai al servidor, i
// per això el reproductor funciona sense connexió. Les metadades, els fitxers
// d'àudio i les caràtules van a magatzems separats perquè llistar la
// biblioteca no hagi de carregar a memòria tots els blobs d'àudio (una
// biblioteca de 500 cançons són diversos GB).

export type Canco = {
  id: string;
  nomFitxer: string;
  titol: string;
  artista: string;
  album: string;
  durada: number; // segons; 0 si no s'ha pogut llegir
  mida: number; // bytes
  tipus: string; // MIME
  teCaratula: boolean;
  afegit: number; // epoch ms
};

const DB_NOM = "musica";
const DB_VERSIO = 1;
const CANCONS = "cancons";
const AUDIOS = "audios";
const CARATULES = "caratules";

let dbPromesa: Promise<IDBDatabase> | null = null;

function obreDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Aquest navegador no pot desar música al dispositiu."));
  }
  if (!dbPromesa) {
    dbPromesa = new Promise((resolve, reject) => {
      const peticio = indexedDB.open(DB_NOM, DB_VERSIO);
      peticio.onupgradeneeded = () => {
        const db = peticio.result;
        if (!db.objectStoreNames.contains(CANCONS)) {
          db.createObjectStore(CANCONS, { keyPath: "id" });
        }
        // Els blobs es guarden amb l'id de la cançó com a clau externa, sense
        // keyPath: així el valor desat és el Blob tal qual.
        if (!db.objectStoreNames.contains(AUDIOS)) db.createObjectStore(AUDIOS);
        if (!db.objectStoreNames.contains(CARATULES)) db.createObjectStore(CARATULES);
      };
      peticio.onsuccess = () => resolve(peticio.result);
      peticio.onerror = () => reject(peticio.error);
    });
  }
  return dbPromesa;
}

function esperaPeticio<T>(peticio: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    peticio.onsuccess = () => resolve(peticio.result);
    peticio.onerror = () => reject(peticio.error);
  });
}

function esperaTransaccio(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function llistaCancons(): Promise<Canco[]> {
  const db = await obreDb();
  const tx = db.transaction(CANCONS, "readonly");
  const cancons = await esperaPeticio<Canco[]>(tx.objectStore(CANCONS).getAll());
  return ordenaCancons(cancons);
}

/** Ordre de la biblioteca: artista, després àlbum, després títol. */
export function ordenaCancons(cancons: Canco[]): Canco[] {
  return [...cancons].sort(
    (a, b) =>
      a.artista.localeCompare(b.artista, "ca", { sensitivity: "base" }) ||
      a.album.localeCompare(b.album, "ca", { sensitivity: "base" }) ||
      a.titol.localeCompare(b.titol, "ca", { sensitivity: "base" }),
  );
}

export async function desaCanco(canco: Canco, audio: Blob, caratula?: Blob): Promise<void> {
  const db = await obreDb();
  const tx = db.transaction([CANCONS, AUDIOS, CARATULES], "readwrite");
  tx.objectStore(CANCONS).put(canco);
  tx.objectStore(AUDIOS).put(audio, canco.id);
  if (caratula) tx.objectStore(CARATULES).put(caratula, canco.id);
  await esperaTransaccio(tx);
}

export async function obtenAudio(id: string): Promise<Blob | undefined> {
  const db = await obreDb();
  const tx = db.transaction(AUDIOS, "readonly");
  return esperaPeticio<Blob | undefined>(tx.objectStore(AUDIOS).get(id));
}

export async function obtenCaratula(id: string): Promise<Blob | undefined> {
  const db = await obreDb();
  const tx = db.transaction(CARATULES, "readonly");
  return esperaPeticio<Blob | undefined>(tx.objectStore(CARATULES).get(id));
}

export async function esborraCanco(id: string): Promise<void> {
  const db = await obreDb();
  const tx = db.transaction([CANCONS, AUDIOS, CARATULES], "readwrite");
  tx.objectStore(CANCONS).delete(id);
  tx.objectStore(AUDIOS).delete(id);
  tx.objectStore(CARATULES).delete(id);
  await esperaTransaccio(tx);
}

export async function buidaBiblioteca(): Promise<void> {
  const db = await obreDb();
  const tx = db.transaction([CANCONS, AUDIOS, CARATULES], "readwrite");
  tx.objectStore(CANCONS).clear();
  tx.objectStore(AUDIOS).clear();
  tx.objectStore(CARATULES).clear();
  await esperaTransaccio(tx);
}

/**
 * Demana al navegador que no esborri la biblioteca quan li falti espai. Sense
 * això, l'emmagatzematge d'un lloc web es considera "best effort" i el sistema
 * el pot buidar; amb música importada a mà, perdre-la seria molt empipador.
 */
export async function demanaEmmagatzematgePersistent(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function espaiUsat(): Promise<{ usat: number; disponible: number } | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    return { usat: usage ?? 0, disponible: quota ?? 0 };
  } catch {
    return null;
  }
}
