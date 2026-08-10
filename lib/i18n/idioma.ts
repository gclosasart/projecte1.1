import { cookies } from "next/headers";

export type Idioma = "ca" | "es" | "en";

export const IDIOMES: Idioma[] = ["ca", "es", "en"];
export const IDIOMA_COOKIE = "idioma";

export async function getIdioma(): Promise<Idioma> {
  const cookieStore = await cookies();
  const valor = cookieStore.get(IDIOMA_COOKIE)?.value;
  return (IDIOMES as string[]).includes(valor ?? "") ? (valor as Idioma) : "ca";
}
