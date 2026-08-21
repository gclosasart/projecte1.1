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
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 bg-white px-6 py-5 dark:bg-zinc-950">
        <Link
          href="/clients"
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white transition-transform hover:scale-105 dark:bg-blue-800 dark:text-white"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden>
            <path
              d="M16 10H4m0 0 4.5-4.5M4 10l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-950 uppercase italic dark:text-zinc-50">
          {t.llistaNegra.titol}
        </h1>
      </header>
      <div className="h-1.5 w-full bg-blue-900 dark:bg-blue-800" aria-hidden />

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-8">
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t.llistaNegra.descripcio}</p>

        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <AfegeixLlistaNegraForm idioma={idioma} />
        </section>

        <ul className="mt-6 flex flex-col gap-3">
          {!entrades || entrades.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.llistaNegra.capEntrada}</p>
          ) : (
            entrades.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
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
