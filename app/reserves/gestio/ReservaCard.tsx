import Link from "next/link";
import { ArxivaButton } from "./ArxivaButton";
import { ESTAT_RESERVA_ESTIL, nomsRecursos, type Reserva } from "./tipus";

type Textos = {
  clientDesconegut: string;
  recursDesconegut: string;
  puntual: string;
  recurrent: string;
  desDel: (data: string) => string;
  arxiva: string;
  desarxiva: string;
  estats: Record<string, string>;
};

export function ReservaCard({ r, textos }: { r: Reserva; textos: Textos }) {
  return (
    <li className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/reserves/gestio/${r.id}`} className="min-w-0 flex-1 hover:underline">
          <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
            {nomsRecursos(r, textos.recursDesconegut)} — {r.clients?.nom ?? textos.clientDesconegut}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_RESERVA_ESTIL[r.estat] ?? ""}`}
            >
              {textos.estats[r.estat] ?? r.estat}
            </span>
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {r.tipus === "puntual" ? textos.puntual : textos.recurrent} · {textos.desDel(r.data_inici)}
            {r.frequencia ? ` · ${r.frequencia}` : ""}
          </p>
        </Link>
        <ArxivaButton id={r.id} arxivada={r.arxivada} textos={{ arxiva: textos.arxiva, desarxiva: textos.desarxiva }} />
      </div>
    </li>
  );
}
