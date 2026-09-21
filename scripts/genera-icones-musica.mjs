// Genera les icones PNG del reproductor (`public/musica/`) sense cap
// dependència: dibuixa una nota musical blanca sobre el teal de l'app i
// escriu el PNG a mà (només capçalera + un bloc IDAT comprimit amb zlib de
// Node). Per regenerar-les: `node scripts/genera-icones-musica.mjs`.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DESTI = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "musica");

const TEAL_DALT = [20, 184, 166]; // teal-500
const TEAL_BAIX = [13, 148, 136]; // teal-600
const MOSTRES = 3; // submostreig per suavitzar les vores

/** Nota musical de dues cues, en coordenades 0..1 (y cap avall). */
function dinsDeLaNota(x, y) {
  const capes = [
    [0.33, 0.7],
    [0.66, 0.62],
  ];
  for (const [cx, cy] of capes) {
    // El·lipse girada -20°, com el cap inclinat d'una nota escrita a mà.
    const angle = (-20 * Math.PI) / 180;
    const dx = x - cx;
    const dy = y - cy;
    const rx = dx * Math.cos(angle) + dy * Math.sin(angle);
    const ry = -dx * Math.sin(angle) + dy * Math.cos(angle);
    if ((rx / 0.125) ** 2 + (ry / 0.092) ** 2 <= 1) return true;
  }

  // Pals verticals, enganxats a la dreta de cada cap.
  if (x >= 0.405 && x <= 0.447 && y >= 0.24 && y <= 0.7) return true;
  if (x >= 0.735 && x <= 0.777 && y >= 0.16 && y <= 0.62) return true;

  // Barra que uneix els dos pals per dalt.
  if (x >= 0.405 && x <= 0.777) {
    const dalt = 0.24 + ((x - 0.405) * (0.16 - 0.24)) / (0.777 - 0.405);
    if (y >= dalt && y <= dalt + 0.085) return true;
  }

  return false;
}

function dinsDelFons(x, y, radi) {
  if (radi <= 0) return x >= 0 && x <= 1 && y >= 0 && y <= 1;
  const cx = Math.min(Math.max(x, radi), 1 - radi);
  const cy = Math.min(Math.max(y, radi), 1 - radi);
  return (x - cx) ** 2 + (y - cy) ** 2 <= radi ** 2;
}

function pixels(mida, { radi, escala }) {
  const dades = Buffer.alloc(mida * mida * 4);
  for (let fila = 0; fila < mida; fila += 1) {
    for (let columna = 0; columna < mida; columna += 1) {
      let fons = 0;
      let nota = 0;
      for (let sy = 0; sy < MOSTRES; sy += 1) {
        for (let sx = 0; sx < MOSTRES; sx += 1) {
          const x = (columna + (sx + 0.5) / MOSTRES) / mida;
          const y = (fila + (sy + 0.5) / MOSTRES) / mida;
          if (dinsDelFons(x, y, radi)) fons += 1;
          // A les icones "maskable" el dibuix s'encongeix cap al centre
          // perquè cap retallada del sistema no en mossegui cap tros.
          if (dinsDeLaNota(0.5 + (x - 0.5) / escala, 0.5 + (y - 0.5) / escala)) nota += 1;
        }
      }

      const total = MOSTRES * MOSTRES;
      const alfa = fons / total;
      const blanc = (nota / total) * alfa;
      const barreja = fila / (mida - 1);
      const desti = (fila * mida + columna) * 4;
      for (let canal = 0; canal < 3; canal += 1) {
        const teal = TEAL_DALT[canal] + (TEAL_BAIX[canal] - TEAL_DALT[canal]) * barreja;
        dades[desti + canal] = Math.round(teal * (1 - blanc) + 255 * blanc);
      }
      dades[desti + 3] = Math.round(alfa * 255);
    }
  }
  return dades;
}

const TAULA_CRC = Array.from({ length: 256 }, (_, i) => {
  let valor = i;
  for (let bit = 0; bit < 8; bit += 1) {
    valor = valor & 1 ? 0xedb88320 ^ (valor >>> 1) : valor >>> 1;
  }
  return valor >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = TAULA_CRC[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function bloc(tipus, dades) {
  const mida = Buffer.alloc(4);
  mida.writeUInt32BE(dades.length);
  const cos = Buffer.concat([Buffer.from(tipus, "latin1"), dades]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cos));
  return Buffer.concat([mida, cos, crc]);
}

function png(mida, dades) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(mida, 0);
  ihdr.writeUInt32BE(mida, 4);
  ihdr[8] = 8; // bits per canal
  ihdr[9] = 6; // RGBA
  // Cada línia va precedida del byte de filtre (0 = cap filtre).
  const linies = [];
  for (let fila = 0; fila < mida; fila += 1) {
    linies.push(Buffer.from([0]), dades.subarray(fila * mida * 4, (fila + 1) * mida * 4));
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloc("IHDR", ihdr),
    bloc("IDAT", deflateSync(Buffer.concat(linies), { level: 9 })),
    bloc("IEND", Buffer.alloc(0)),
  ]);
}

const ICONES = [
  { fitxer: "icona-192.png", mida: 192, radi: 0.22, escala: 1 },
  { fitxer: "icona-512.png", mida: 512, radi: 0.22, escala: 1 },
  { fitxer: "icona-180.png", mida: 180, radi: 0.22, escala: 1 },
  { fitxer: "icona-maskable-512.png", mida: 512, radi: 0, escala: 0.7 },
];

mkdirSync(DESTI, { recursive: true });
for (const { fitxer, mida, radi, escala } of ICONES) {
  writeFileSync(join(DESTI, fitxer), png(mida, pixels(mida, { radi, escala })));
  console.log(`Escrita ${fitxer} (${mida}x${mida})`);
}
