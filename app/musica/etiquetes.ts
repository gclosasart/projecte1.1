// Lectura de metadades dels fitxers d'àudio, tot al navegador i sense cap
// dependència externa: títol, artista, àlbum i caràtula des de les etiquetes
// ID3 (les que porten pràcticament tots els MP3), amb el nom del fitxer com a
// pla B per a la resta de formats.

export type Etiquetes = {
  titol?: string;
  artista?: string;
  album?: string;
  caratula?: Blob;
};

// Un tag ID3 pot ser enorme si porta caràtules grosses; llegim-ne un tros
// generós però acotat per no carregar mig fitxer a memòria.
const MAX_TAG = 2 * 1024 * 1024;

export async function llegeixEtiquetes(fitxer: Blob): Promise<Etiquetes> {
  try {
    const capcalera = new Uint8Array(await fitxer.slice(0, 10).arrayBuffer());
    if (capcalera.length < 10) return {};
    if (latin(capcalera.subarray(0, 3)) !== "ID3") return {};

    const versio = capcalera[3];
    const mida = Math.min(sincSegur(capcalera.subarray(6, 10)), MAX_TAG);
    if (mida <= 0) return {};

    const cos = new Uint8Array(await fitxer.slice(10, 10 + mida).arrayBuffer());
    // ID3v2.2 fa servir identificadors de 3 lletres i capçaleres de 6 bytes;
    // v2.3 i v2.4, de 4 lletres i 10 bytes. Només v2.4 codifica la mida del
    // frame com a enter "synchsafe".
    return versio <= 2
      ? llegeixFrames(cos, 3, 6, false)
      : llegeixFrames(cos, 4, 10, versio >= 4);
  } catch {
    return {};
  }
}

function llegeixFrames(
  cos: Uint8Array,
  llargId: number,
  llargCapcalera: number,
  midaSincSegura: boolean,
): Etiquetes {
  const etiquetes: Etiquetes = {};
  let i = 0;

  while (i + llargCapcalera <= cos.length) {
    const id = latin(cos.subarray(i, i + llargId));
    // El tag s'omple amb zeros fins al final: quan l'identificador ja no és
    // alfanumèric, hem arribat al farciment.
    if (!/^[A-Z0-9]+$/.test(id)) break;

    const bytesMida = cos.subarray(i + llargId, i + llargCapcalera - (llargId === 3 ? 0 : 2));
    const mida = midaSincSegura ? sincSegur(bytesMida) : enterBE(bytesMida);
    const inici = i + llargCapcalera;
    const fi = inici + mida;
    if (mida <= 0 || fi > cos.length) break;

    const dades = cos.subarray(inici, fi);
    switch (id) {
      case "TIT2":
      case "TT2":
        etiquetes.titol ||= text(dades);
        break;
      case "TPE1":
      case "TP1":
        etiquetes.artista ||= text(dades);
        break;
      case "TALB":
      case "TAL":
        etiquetes.album ||= text(dades);
        break;
      case "APIC":
      case "PIC":
        etiquetes.caratula ||= imatge(dades, llargId);
        break;
    }

    i = fi;
  }

  return etiquetes;
}

function text(dades: Uint8Array): string {
  if (dades.length < 2) return "";
  return descodifica(dades.subarray(1), dades[0]).replace(/\0[\s\S]*$/, "").trim();
}

function descodifica(bytes: Uint8Array, codificacio: number): string {
  let etiqueta = "iso-8859-1";
  if (codificacio === 1) {
    // UTF-16 amb marca d'ordre de bytes al davant.
    etiqueta = bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf-16le";
  } else if (codificacio === 2) {
    etiqueta = "utf-16be";
  } else if (codificacio === 3) {
    etiqueta = "utf-8";
  }
  try {
    return new TextDecoder(etiqueta).decode(bytes);
  } catch {
    return new TextDecoder().decode(bytes);
  }
}

function imatge(dades: Uint8Array, llargId: number): Blob | undefined {
  if (dades.length < 4) return undefined;
  const codificacio = dades[0];
  let tipus = "image/jpeg";
  let i: number;

  if (llargId === 3) {
    // PIC (v2.2): 3 lletres de format ("JPG", "PNG") en lloc d'un MIME.
    tipus = latin(dades.subarray(1, 4)).toUpperCase() === "PNG" ? "image/png" : "image/jpeg";
    i = 4;
  } else {
    const fiMime = dades.indexOf(0, 1);
    if (fiMime < 0) return undefined;
    const mime = latin(dades.subarray(1, fiMime));
    if (mime.startsWith("image/")) tipus = mime;
    i = fiMime + 1;
  }

  i += 1; // byte del tipus d'imatge (portada, contraportada...)

  // Descripció, acabada en zero (doble zero si va en UTF-16).
  if (codificacio === 1 || codificacio === 2) {
    while (i + 1 < dades.length && !(dades[i] === 0 && dades[i + 1] === 0)) i += 2;
    i += 2;
  } else {
    while (i < dades.length && dades[i] !== 0) i += 1;
    i += 1;
  }

  if (i >= dades.length) return undefined;
  return new Blob([dades.slice(i)], { type: tipus });
}

function latin(bytes: Uint8Array): string {
  let resultat = "";
  for (const byte of bytes) resultat += String.fromCharCode(byte);
  return resultat;
}

function enterBE(bytes: Uint8Array): number {
  return bytes.reduce((total, byte) => total * 256 + byte, 0);
}

/** Enter "synchsafe": 7 bits útils per byte, per no imitar mai una capçalera MPEG. */
function sincSegur(bytes: Uint8Array): number {
  return bytes.reduce((total, byte) => total * 128 + (byte & 0x7f), 0);
}

// Brossa que els descarregadors de YouTube enganxen al nom del fitxer i que
// no forma part del títol de la cançó.
const SOROLL =
  /\b(?:official\s+(?:music\s+)?video|official\s+audio|video\s+oficial|audio\s+oficial|videoclip(?:\s+oficial)?|lyrics?\s+video|video\s+lyrics?|con\s+letra|letra\s+oficial|visualizer|youtube|hd|hq|4k|1080p|720p|320\s*kbps)\b/gi;

// Paraules que, si són les úniques dins d'un parèntesi o claudàtor, el fan
// tot ell prescindible: "(LETRA)", "[Official Video]", "(Audio Oficial)".
// Fora de parèntesis no es toquen, que "letra" pot ser part d'un títol.
const PARAULES_BROSSA = new Set([
  "letra", "letras", "lyric", "lyrics", "video", "vídeo", "videoclip", "audio", "àudio",
  "oficial", "official", "music", "musica", "música", "visualizer", "hd", "hq", "4k",
  "1080p", "720p", "youtube", "con", "subtitulada", "subtitulado", "full", "completa",
]);

function nomesBrossa(tros: string): boolean {
  const paraules = tros
    .replace(/^[([{]|[)\]}]$/g, "")
    .split(/[\s.·|_-]+/)
    .filter(Boolean);
  return paraules.length > 0 && paraules.every((paraula) => PARAULES_BROSSA.has(paraula.toLowerCase()));
}

/**
 * Treu del text la brossa típica dels noms de YouTube i els claudàtors o
 * parèntesis que només la contenien. No toca coses com "feat. X" o el "(s)"
 * de "Me Encanta(s)", que sí que formen part del títol.
 */
export function netejaSoroll(text: string): string {
  return text
    .replace(/[([{][^)\]}]*[)\]}]/g, (tros) => (SOROLL.test(tros) || nomesBrossa(tros) ? " " : tros))
    .replace(SOROLL, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-–—_.·|]+|[\s\-–—_.·|]+$/g, "")
    .trim();
}

/**
 * Si un tros del nom és, de fet, el canal de qui ha penjat el vídeo: repeteix
 * l'artista, sencer o en part ("Eminem" dins de "EminemVEVO").
 */
function esElCanalDeLArtista(tros: string, artista: string): boolean {
  const net = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").trim();
  const candidat = net(tros);
  const referencia = net(artista);
  if (!candidat || !referencia) return false;
  if (candidat.includes(referencia) || referencia.includes(candidat)) return true;
  const sensEspais = candidat.replace(/\s+/g, "");
  return referencia
    .split(/\s+/)
    .filter((paraula) => paraula.length >= 4)
    .some((paraula) => sensEspais.includes(paraula));
}

/**
 * Neteja un títol i un artista que ja estaven desats. No torna a mirar el nom
 * del fitxer a posta: les cançons que portessin etiquetes bones hi perdrien.
 */
export function netejaEtiquetes(
  titol: string,
  artista: string,
): { titol: string; artista: string } {
  const artistaNet = netejaSoroll(artista) || artista;
  const parts = netejaSoroll(titol)
    .split(/\s+[-–—]\s+/)
    .map((tros) => netejaSoroll(tros))
    .filter(Boolean);

  if (parts.length >= 2 && esElCanalDeLArtista(parts[parts.length - 1], artistaNet)) parts.pop();

  return { titol: parts.join(" - ") || titol, artista: artistaNet };
}

/** Pla B quan el fitxer no porta etiquetes: "01 - Artista - Títol.mp3". */
export function etiquetesDelNom(nomFitxer: string): { titol: string; artista?: string } {
  const net = netejaSoroll(
    nomFitxer
      .replace(/\.[^.]+$/, "")
      .replace(/_/g, " ")
      .replace(/^\s*\d{1,3}\s*[-.]?\s+/, "") // número de pista del davant
      .trim(),
  );

  const parts = net
    .split(/\s+[-–—]\s+/)
    .map((tros) => netejaSoroll(tros))
    .filter(Boolean);

  // "WOS - MELON VINO - WOS DS3": l'últim tros repeteix l'artista perquè és
  // el nom del canal de YouTube, no part del títol.
  if (parts.length >= 3 && esElCanalDeLArtista(parts[parts.length - 1], parts[0])) parts.pop();

  if (parts.length >= 2) {
    const artista = parts[0];
    const titol = parts.slice(1).join(" - ");
    if (artista && titol) return { titol, artista };
  }
  return { titol: parts[0] || net || nomFitxer };
}

/** La cerca que obre el botó "Busca la lletra": artista, títol i "lyrics". */
export function consultaDeLletra(titol: string, artista: string): string {
  const net = [artista, titol]
    .map((tros) => netejaSoroll(tros || ""))
    .filter((tros) => tros && tros.toLowerCase() !== "artista desconegut")
    .join(" ");
  return `${net} lyrics`.trim();
}

/**
 * Durada en segons, demanant-la al propi navegador. Cap format d'àudio no la
 * diu de manera fiable a la capçalera (un MP3 de bitrate variable, per
 * exemple), així que la via segura és carregar-ne les metadades.
 */
export function llegeixDurada(fitxer: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(fitxer);
    const audio = new Audio();
    let acabat = false;

    const acaba = (durada: number) => {
      if (acabat) return;
      acabat = true;
      clearTimeout(temporitzador);
      audio.removeAttribute("src");
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(durada) && durada > 0 ? durada : 0);
    };

    const temporitzador = setTimeout(() => acaba(0), 15000);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => acaba(audio.duration);
    audio.onerror = () => acaba(0);
    audio.src = url;
  });
}
