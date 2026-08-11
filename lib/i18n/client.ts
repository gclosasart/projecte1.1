import ca from "./ca";
import es from "./es";
import en from "./en";
import type { Idioma } from "./idioma";

const DICCIONARIS = { ca, es, en };

export function dictDe(idioma: Idioma) {
  return DICCIONARIS[idioma];
}

export type { Idioma };
