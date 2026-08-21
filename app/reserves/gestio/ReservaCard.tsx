import Link from "next/link";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { ArxivaButton } from "./ArxivaButton";
import { ESTAT_RESERVA_ESTIL, nomsRecursos, type Reserva } from "./tipus";

export function ReservaCard({ r, idioma }: { r: Reserva; idioma: Idioma }) {
  const dict = dictDe(idioma);
  const t = dict.reservaGestio;

  return (
    <li className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/reserves/gestio/${r.id}`} className="min-w-0 flex-1 hover:underline">
          <p className="truncate font-mono text-sm text-zinc-400 dark:text-zinc-500">{r.codi}</p>
          <p className="truncate text-base font-medium text-zinc-950 dark:text-zinc-50">
            {nomsRecursos(r, t.recursDesconegut)} — {r.clients?.nom ?? t.clientDesconegut}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-sm font-normal ${ESTAT_RESERVA_ESTIL[r.estat] ?? ""}`}
            >
              {dict.comu.estats[r.estat] ?? r.estat}
            </span>
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {r.tipus === "puntual" ? t.puntual : t.recurrent} · {t.desDel(r.data_inici)}
            {r.frequencia ? ` · ${r.frequencia}` : ""}
          </p>
        </Link>
        <ArxivaButton id={r.id} arxivada={r.arxivada} textos={{ arxiva: t.arxiva, desarxiva: t.desarxiva }} />
      </div>
    </li>
  );
}
