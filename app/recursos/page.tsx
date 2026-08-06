import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RecursRowActions } from "./RecursRowActions";

type Recurs = {
  id: string;
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: string;
  actiu: boolean;
  bloquejat: boolean;
};

export default async function RecursosPage() {
  const supabase = await createClient();

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nom, capacitat, preu, unitat_preu, actiu, bloquejat")
    .order("nom")
    .returns<Recurs[]>();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Recursos</h1>
        </div>
        <Link
          href="/recursos/nou"
          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
        >
          Nou recurs
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {!recursos || recursos.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Encara no hi ha cap recurs donat d&apos;alta.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recursos.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {r.nom}
                    {!r.actiu && (
                      <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Baixa
                      </span>
                    )}
                    {r.bloquejat && (
                      <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-normal text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                        Bloquejat
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {r.capacitat != null ? `${r.capacitat} persones — ` : ""}
                    {r.preu} €/{r.unitat_preu === "hora" ? "h" : "dia"}
                  </p>
                </div>
                <RecursRowActions id={r.id} bloquejat={r.bloquejat} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
