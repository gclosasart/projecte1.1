import { processarSollicitud } from "./actions";
import type { Dict } from "@/lib/i18n";

type Sollicitud = {
  id: string;
  data: string;
  hora_inici: string;
  hora_fi: string;
  nom: string;
  email: string | null;
  telefon: string | null;
  missatge: string | null;
  recurs_nom: string;
};

export function SollicitudsPendents({
  sollicituds,
  textos: t,
}: {
  sollicituds: Sollicitud[];
  textos: Dict["reservaGestio"];
}) {
  if (sollicituds.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
        {t.sollicitudsPendents(sollicituds.length)}
      </h2>
      <ul className="flex flex-col gap-3">
        {sollicituds.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between dark:border-amber-900/40 dark:bg-amber-950/20"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {s.recurs_nom} — {t.sollicitudDataHora(s.data, s.hora_inici.slice(0, 5), s.hora_fi.slice(0, 5))}
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{s.nom}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {s.email || s.telefon ? [s.email, s.telefon].filter(Boolean).join(" · ") : t.senseContacte}
              </p>
              {s.missatge && (
                <p className="mt-1 text-xs italic text-zinc-500 dark:text-zinc-400">&ldquo;{s.missatge}&rdquo;</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <form action={processarSollicitud.bind(null, s.id, "acceptada")}>
                <button
                  type="submit"
                  className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
                >
                  {t.accepta}
                </button>
              </form>
              <form action={processarSollicitud.bind(null, s.id, "rebutjada")}>
                <button
                  type="submit"
                  className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  {t.rebutja}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
