import ca from "./ca";
import es from "./es";
import en from "./en";
import fr from "./fr";
import it from "./it";
import type { Idioma } from "./idioma";

const DICCIONARIS = { ca, es, en, fr, it };

export function dictDe(idioma: Idioma) {
  return DICCIONARIS[idioma];
}

export type { Idioma };
