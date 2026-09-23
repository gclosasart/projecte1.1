// Sincronització entre dispositius.
//
// Al núvol no hi va ni una cançó: només la feina que costa de refer —llistes,
// lletres, els temps de cada línia, l'ordre i els títols corregits. Els
// fitxers d'àudio es queden a cada dispositiu, on els has posat tu.
//
// Les cançons es casen entre dispositius per "empremta" (nom del fitxer i
// mida), el mateix criteri que ja fa servir l'app per no importar dos cops el
// mateix fitxer.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  desaLletra,
  desaLlista,
  desaMetadades,
  esborraLlista,
  llistaCancons,
  llistaLlistes,
  obtenLletra,
  type Canco,
  type Llista,
} from "./biblioteca";

const URL_NUVOL = process.env.NEXT_PUBLIC_MUSICA_SUPABASE_URL;
const CLAU_NUVOL = process.env.NEXT_PUBLIC_MUSICA_SUPABASE_ANON_KEY;

/** Sense les dues variables d'entorn, l'app funciona igual però sense núvol. */
export const nuvolConfigurat = Boolean(URL_NUVOL && CLAU_NUVOL);

let client: SupabaseClient | null = null;

export function nuvol(): SupabaseClient {
  if (!URL_NUVOL || !CLAU_NUVOL) {
    throw new Error("La sincronització no està configurada en aquest desplegament.");
  }
  client ??= createClient(URL_NUVOL, CLAU_NUVOL, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Clau pròpia: la sessió del reproductor no té res a veure amb la del
      // SaaS de coworking, encara que visquin al mateix domini.
      storageKey: "musica:sessio",
    },
  });
  return client;
}

export function empremtaDe(canco: Canco): string {
  return `${canco.nomFitxer}:${canco.mida}`;
}

/** Una etiqueta curta per saber des d'on es va pujar l'última vegada. */
export function nomDelDispositiu(): string {
  if (typeof navigator === "undefined") return "un dispositiu";
  const agent = navigator.userAgent;
  if (/Android/.test(agent)) return "Android";
  if (/iPhone|iPad|iPod/.test(agent)) return "iPhone o iPad";
  if (/CrOS/.test(agent)) return "Chromebook";
  if (/Macintosh/.test(agent)) return "Mac";
  if (/Windows/.test(agent)) return "Windows";
  return "un ordinador";
}

type FilaCanco = {
  usuari: string;
  empremta: string;
  titol: string;
  artista: string;
  album: string;
  durada: number;
  ordre: number;
  lletra: string | null;
  temps: (number | null)[] | null;
};

type FilaLlista = {
  id: string;
  usuari: string;
  nom: string;
  cancons: string[];
  creada: string;
  posicio: number;
};

export type EstatNuvol = {
  dispositiu: string;
  cancons: number;
  quan: string;
} | null;

async function usuariActual(): Promise<string> {
  const { data, error } = await nuvol().auth.getUser();
  if (error || !data.user) throw new Error("Has d'entrar al teu compte per sincronitzar.");
  return data.user.id;
}

export async function estatDelNuvol(): Promise<EstatNuvol> {
  const { data, error } = await nuvol()
    .from("sincronitzacions")
    .select("dispositiu, cancons, quan")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

/** Puja el que hi ha en aquest dispositiu i deixa el núvol igual que ell. */
export async function puja(): Promise<{ cancons: number; llistes: number }> {
  const usuari = await usuariActual();
  const [cancons, llistes] = await Promise.all([llistaCancons(), llistaLlistes()]);

  const files: FilaCanco[] = [];
  for (const canco of cancons) {
    const lletra = await obtenLletra(canco.id);
    files.push({
      usuari,
      empremta: empremtaDe(canco),
      titol: canco.titol,
      artista: canco.artista,
      album: canco.album,
      durada: canco.durada,
      ordre: canco.ordre,
      lletra: lletra.text.trim() ? lletra.text : null,
      temps: lletra.temps,
    });
  }

  const { error: errorCancons } = await nuvol()
    .from("cancons")
    .upsert(files, { onConflict: "usuari,empremta" });
  if (errorCancons) throw new Error(errorCancons.message);

  // El que ja no hi és en aquest dispositiu tampoc ha de quedar al núvol.
  const empremtes = new Set(files.map((fila) => fila.empremta));
  const { data: alNuvol, error: errorLlegir } = await nuvol().from("cancons").select("empremta");
  if (errorLlegir) throw new Error(errorLlegir.message);
  const sobrants = (alNuvol ?? [])
    .map((fila) => fila.empremta as string)
    .filter((empremta) => !empremtes.has(empremta));
  if (sobrants.length) {
    const { error } = await nuvol().from("cancons").delete().in("empremta", sobrants);
    if (error) throw new Error(error.message);
  }

  // Les llistes es reescriuen senceres: són poques i així no cal endevinar
  // quina s'ha esborrat.
  const { error: errorNeteja } = await nuvol().from("llistes").delete().eq("usuari", usuari);
  if (errorNeteja) throw new Error(errorNeteja.message);

  const idsPerEmpremta = new Map(cancons.map((canco) => [canco.id, empremtaDe(canco)]));
  const filesLlistes = llistes.map((llista, posicio) => ({
    id: llista.id,
    usuari,
    nom: llista.nom,
    cancons: llista.cancons
      .map((id) => idsPerEmpremta.get(id))
      .filter((empremta): empremta is string => Boolean(empremta)),
    creada: new Date(llista.creada).toISOString(),
    posicio,
  }));
  if (filesLlistes.length) {
    const { error } = await nuvol().from("llistes").insert(filesLlistes);
    if (error) throw new Error(error.message);
  }

  const { error: errorEstat } = await nuvol().from("sincronitzacions").upsert({
    usuari,
    dispositiu: nomDelDispositiu(),
    cancons: files.length,
    quan: new Date().toISOString(),
  });
  if (errorEstat) throw new Error(errorEstat.message);

  return { cancons: files.length, llistes: filesLlistes.length };
}

/**
 * Porta l'últim que es va pujar. No esborra cap cançó ni cap fitxer d'àudio:
 * només actualitza les que tens i refà les llistes amb les que hi hagi.
 */
export async function baixa(): Promise<{ actualitzades: number; llistes: number; sense: number }> {
  const [{ data: filesCancons, error }, { data: filesLlistes, error: errorLlistes }] =
    await Promise.all([
      nuvol().from("cancons").select("empremta, titol, artista, album, ordre, lletra, temps"),
      nuvol().from("llistes").select("id, nom, cancons, creada, posicio").order("posicio"),
    ]);
  if (error) throw new Error(error.message);
  if (errorLlistes) throw new Error(errorLlistes.message);

  const locals = await llistaCancons();
  const perEmpremta = new Map(locals.map((canco) => [empremtaDe(canco), canco]));

  const canviades: Canco[] = [];
  let sense = 0;
  for (const fila of filesCancons ?? []) {
    const local = perEmpremta.get(fila.empremta as string);
    if (!local) {
      sense += 1; // és al núvol però el fitxer no és en aquest dispositiu
      continue;
    }
    const actualitzada: Canco = {
      ...local,
      titol: (fila.titol as string) || local.titol,
      artista: (fila.artista as string) || local.artista,
      album: (fila.album as string) ?? local.album,
      ordre: typeof fila.ordre === "number" ? fila.ordre : local.ordre,
    };
    if (
      actualitzada.titol !== local.titol ||
      actualitzada.artista !== local.artista ||
      actualitzada.album !== local.album ||
      actualitzada.ordre !== local.ordre
    ) {
      canviades.push(actualitzada);
    }
    await desaLletra(local.id, {
      text: (fila.lletra as string | null) ?? "",
      temps: (fila.temps as (number | null)[] | null) ?? null,
    });
  }
  if (canviades.length) await desaMetadades(canviades);

  // Les llistes locals es refan amb les del núvol, amb el mateix id, i es
  // queden només les cançons que hi ha en aquest dispositiu.
  const llistesLocals = await llistaLlistes();
  const idsNuvol = new Set((filesLlistes ?? []).map((fila) => fila.id as string));
  for (const llista of llistesLocals) {
    if (!idsNuvol.has(llista.id)) await esborraLlista(llista.id);
  }
  for (const fila of (filesLlistes ?? []) as unknown as FilaLlista[]) {
    const nova: Llista = {
      id: fila.id,
      nom: fila.nom,
      cancons: (fila.cancons ?? [])
        .map((empremta) => perEmpremta.get(empremta)?.id)
        .filter((id): id is string => Boolean(id)),
      creada: new Date(fila.creada).getTime() || Date.now(),
    };
    await desaLlista(nova);
  }

  return {
    actualitzades: (filesCancons ?? []).length - sense,
    llistes: (filesLlistes ?? []).length,
    sense,
  };
}
