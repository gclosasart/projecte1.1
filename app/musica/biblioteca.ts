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
  ordre: number; // posició a la llista, canviable arrossegant
  durada: number; // segons; 0 si no s'ha pogut llegir
  mida: number; // bytes
  tipus: string; // MIME
  teCaratula: boolean;
  afegit: number; // epoch ms
};

/** Una llista de reproducció: un nom i les cançons que hi ha, en ordre. */
export type Llista = {
  id: string;
  nom: string;
  cancons: string[]; // ids de cançons, en l'ordre en què sonen
  creada: number;
};

const DB_NOM = "musica";
const DB_VERSIO = 3;
const CANCONS = "cancons";
const LLISTES = "llistes";
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
      peticio.onupgradeneeded = (esdeveniment) => {
        const db = peticio.result;
        if (!db.objectStoreNames.contains(CANCONS)) {
          db.createObjectStore(CANCONS, { keyPath: "id" });
        }
        // Els blobs es guarden amb l'id de la cançó com a clau externa, sense
        // keyPath: així el valor desat és el Blob tal qual.
        if (!db.objectStoreNames.contains(AUDIOS)) db.createObjectStore(AUDIOS);
        if (!db.objectStoreNames.contains(CARATULES)) db.createObjectStore(CARATULES);
        // Versió 3: llistes de reproducció. No cal migrar res, qui no en
        // tingui cap simplement comença amb el magatzem buit.
        if (!db.objectStoreNames.contains(LLISTES)) db.createObjectStore(LLISTES, { keyPath: "id" });

        // Versió 2: l'ordre de la llista deixa de ser alfabètic i passa a ser
        // el que decideixi qui escolta, arrossegant. A les cançons que ja hi
        // havia se'ls dona el número que els tocava per ordre alfabètic, que
        // és com es veien fins ara.
        if (esdeveniment.oldVersion < 2 && peticio.transaction) {
          const magatzem = peticio.transaction.objectStore(CANCONS);
          const totes = magatzem.getAll();
          totes.onsuccess = () => {
            ordenaPerEtiquetes(totes.result as Canco[]).forEach((canco, posicio) => {
              magatzem.put({ ...canco, ordre: posicio });
            });
          };
        }
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

/** Ordre de la biblioteca: el que ha decidit qui escolta arrossegant. */
export function ordenaCancons(cancons: Canco[]): Canco[] {
  return [...cancons].sort((a, b) => a.ordre - b.ordre);
}

/** Ordre alfabètic, per col·locar les cançons noves d'una tacada. */
export function ordenaPerEtiquetes(cancons: Canco[]): Canco[] {
  return [...cancons].sort(
    (a, b) =>
      a.artista.localeCompare(b.artista, "ca", { sensitivity: "base" }) ||
      a.album.localeCompare(b.album, "ca", { sensitivity: "base" }) ||
      a.titol.localeCompare(b.titol, "ca", { sensitivity: "base" }),
  );
}

/** Desa el número d'ordre de les cançons que han canviat de lloc. */
export async function desaOrdre(posicions: { id: string; ordre: number }[]): Promise<void> {
  if (!posicions.length) return;
  const db = await obreDb();
  const tx = db.transaction(CANCONS, "readwrite");
  const magatzem = tx.objectStore(CANCONS);
  for (const { id, ordre } of posicions) {
    const peticio = magatzem.get(id);
    peticio.onsuccess = () => {
      const canco = peticio.result as Canco | undefined;
      if (canco) magatzem.put({ ...canco, ordre });
    };
  }
  await esperaTransaccio(tx);
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
  const tx = db.transaction([CANCONS, AUDIOS, CARATULES, LLISTES], "readwrite");
  tx.objectStore(CANCONS).clear();
  tx.objectStore(AUDIOS).clear();
  tx.objectStore(CARATULES).clear();
  // Sense cançons, les llistes quedarien totes buides i amb nom de fantasma.
  tx.objectStore(LLISTES).clear();
  await esperaTransaccio(tx);
}

export async function llistaLlistes(): Promise<Llista[]> {
  const db = await obreDb();
  const tx = db.transaction(LLISTES, "readonly");
  const llistes = await esperaPeticio<Llista[]>(tx.objectStore(LLISTES).getAll());
  return llistes.sort((a, b) => a.creada - b.creada);
}

export async function desaLlista(llista: Llista): Promise<void> {
  const db = await obreDb();
  const tx = db.transaction(LLISTES, "readwrite");
  tx.objectStore(LLISTES).put(llista);
  await esperaTransaccio(tx);
}

export async function esborraLlista(id: string): Promise<void> {
  const db = await obreDb();
  const tx = db.transaction(LLISTES, "readwrite");
  tx.objectStore(LLISTES).delete(id);
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
