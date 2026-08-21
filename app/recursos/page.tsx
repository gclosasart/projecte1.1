import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { RecursRowActions } from "./RecursRowActions";

type Recurs = {
  id: string;
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: string;
  actiu: boolean;
  bloquejat: boolean;
  quantitat: number;
};

export default async function RecursosPage() {
  const supabase = await createClient();
  const t = await getDict();

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nom, capacitat, preu, unitat_preu, actiu, bloquejat, quantitat")
    .order("nom")
    .returns<Recurs[]>();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-7xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          ←
        </Link>
        <h1 className="text-2xl font-semibold text-sky-600 dark:text-indigo-400">{t.recursos.titol}</h1>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <Link
          href="/recursos/nou"
          className="mb-6 inline-block rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
        >
          {t.recursos.nouRecurs}
        </Link>

        {!recursos || recursos.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.recursos.capRecurs}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recursos.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {r.nom}
                    {!r.actiu && (
                      <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {t.recursos.baixa}
                      </span>
                    )}
                    {r.bloquejat && (
                      <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-normal text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                        {t.recursos.bloquejatBadge}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {r.capacitat != null ? `${t.recursos.persones(r.capacitat)} — ` : ""}
                    {r.preu} {r.unitat_preu === "hora" ? t.recursos.perHora : t.recursos.perDia}
                    {r.quantitat > 1 ? ` — ${t.recursos.unitatsDisponibles(r.quantitat)}` : ""}
                  </p>
                </div>
                <RecursRowActions
                  id={r.id}
                  bloquejat={r.bloquejat}
                  textos={{
                    edita: t.comu.edita,
                    bloqueja: t.recursos.bloqueja,
                    desbloqueja: t.recursos.desbloqueja,
                    elimina: t.comu.elimina,
                    confirma: t.comu.confirma,
                    cancela: t.comu.cancela,
                    escriuElimina: t.recursos.escriuElimina,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
