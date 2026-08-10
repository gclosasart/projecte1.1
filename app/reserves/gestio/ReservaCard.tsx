import Link from "next/link";
import { ArxivaButton } from "./ArxivaButton";
import { ESTAT_RESERVA_ESTIL, nomsRecursos, type Reserva } from "./tipus";

export function ReservaCard({ r }: { r: Reserva }) {
  return (
    <li className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/reserves/gestio/${r.id}`} className="min-w-0 flex-1 hover:underline">
          <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
            {nomsRecursos(r)} — {r.clients?.nom ?? "Client desconegut"}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_RESERVA_ESTIL[r.estat] ?? ""}`}
            >
              {r.estat}
            </span>
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {r.tipus === "puntual" ? "Puntual" : "Recurrent"} · des del {r.data_inici}
            {r.frequencia ? ` · ${r.frequencia}` : ""}
          </p>
        </Link>
        <ArxivaButton id={r.id} arxivada={r.arxivada} />
      </div>
    </li>
  );
}
