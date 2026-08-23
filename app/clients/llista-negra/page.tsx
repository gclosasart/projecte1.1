import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { AfegeixLlistaNegraForm } from "./AfegeixLlistaNegraForm";
import { eliminarDeLlistaNegra } from "./actions";

type Entrada = {
  id: string;
  nif: string;
  nom: string | null;
  motiu: string | null;
};

export default async function LlistaNegraPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const { data: entrades } = await supabase
    .from("llista_negra")
    .select("id, nif, nom, motiu")
    .order("nif")
    .returns<Entrada[]>();

  return (
    <div className="flex flex-1 flex-col bg-rose-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5">
        <Link
          href="/clients"
          className="text-5xl leading-none font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
          {t.llistaNegra.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t.llistaNegra.descripcio}</p>

        <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
          <AfegeixLlistaNegraForm idioma={idioma} />
        </section>

        <ul className="mt-6 flex flex-col gap-3">
          {!entrades || entrades.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.llistaNegra.capEntrada}</p>
          ) : (
            entrades.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white shadow-sm p-4 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {e.nif} {e.nom ? t.llistaNegra.afegitPer(e.nom) : ""}
                  </p>
                  {e.motiu && <p className="text-sm text-zinc-500 dark:text-zinc-400">{e.motiu}</p>}
                </div>
                <form action={eliminarDeLlistaNegra.bind(null, e.id)}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    {t.llistaNegra.elimina}
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
