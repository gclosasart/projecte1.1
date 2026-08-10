import ca from "./ca";
import es from "./es";
import en from "./en";
import { getIdioma, type Idioma } from "./idioma";

export type { Dict } from "./ca";
export { getIdioma, IDIOMES, IDIOMA_COOKIE, type Idioma } from "./idioma";

const DICCIONARIS = { ca, es, en };

export async function getDict() {
  const idioma = await getIdioma();
  return DICCIONARIS[idioma];
}

export function dictDe(idioma: Idioma) {
  return DICCIONARIS[idioma];
}
