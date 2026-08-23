import ca from "./ca";
import es from "./es";
import en from "./en";
import fr from "./fr";
import it from "./it";
import { getIdioma, type Idioma } from "./idioma";

export type { Dict } from "./ca";
export { getIdioma, IDIOMES, IDIOMA_COOKIE, type Idioma } from "./idioma";

const DICCIONARIS = { ca, es, en, fr, it };

export async function getDict() {
  const idioma = await getIdioma();
  return DICCIONARIS[idioma];
}

export function dictDe(idioma: Idioma) {
  return DICCIONARIS[idioma];
}
