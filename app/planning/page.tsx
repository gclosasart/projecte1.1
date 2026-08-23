import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { PlanningGraella, type RecursAmbBlocs } from "./PlanningGraella";
import { BackButton } from "@/app/BackButton";

type Recurs = {
  id: string;
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: string;
};

type OcurrenciaDia = {
  id: string;
  hora_inici: string;
  hora_fi: string;
  no_show: boolean;
  reserves: {
    id: string;
    codi: string;
    clients: { nom: string } | null;
    reserva_recursos: { recurs_id: string }[];
  } | null;
};

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const t = await getDict();
  const idioma = await getIdioma();
  const avui = new Date();
  avui.setHours(0, 0, 0, 0);
  const dataSeleccionada =
    dataParam && /^\d{4}-\d{2}-\d{2}$/.test(dataParam) ? dataParam : toISODate(avui);

  const supabase = await createClient();

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nom, capacitat, preu, unitat_preu")
    .eq("actiu", true)
    .order("nom")
    .returns<Recurs[]>();

  const { data: ocurrencies } = await supabase
    .from("ocurrencies")
    .select(
      "id, hora_inici, hora_fi, no_show, reserves(id, codi, clients(nom), reserva_recursos(recurs_id))",
    )
    .eq("data", dataSeleccionada)
    .eq("estat", "activa")
    .order("hora_inici")
    .returns<OcurrenciaDia[]>();

  const blocsPerRecurs = new Map<string, RecursAmbBlocs["blocs"]>();
  for (const oc of ocurrencies ?? []) {
    if (!oc.reserves) continue;
    for (const rr of oc.reserves.reserva_recursos) {
      const llista = blocsPerRecurs.get(rr.recurs_id) ?? [];
      llista.push({
        ocurrenciaId: oc.id,
        reservaId: oc.reserves.id,
        codi: oc.reserves.codi,
        clientNom: oc.reserves.clients?.nom ?? null,
        horaInici: oc.hora_inici,
        horaFi: oc.hora_fi,
        noShow: oc.no_show,
      });
      blocsPerRecurs.set(rr.recurs_id, llista);
    }
  }

  const recursosAmbBlocs: RecursAmbBlocs[] = (recursos ?? []).map((r) => ({
    id: r.id,
    nom: r.nom,
    capacitat: r.capacitat,
    preu: r.preu,
    unitatPreu: r.unitat_preu,
    blocs: blocsPerRecurs.get(r.id) ?? [],
  }));

  const dataObj = new Date(`${dataSeleccionada}T00:00:00`);
  const dAnterior = new Date(dataObj);
  dAnterior.setDate(dAnterior.getDate() - 1);
  const dSeguent = new Date(dataObj);
  dSeguent.setDate(dSeguent.getDate() + 1);

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.planning.titol}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form method="get" className="flex items-center gap-1.5">
            <input
              type="date"
              name="data"
              defaultValue={dataSeleccionada}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              type="submit"
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              {t.planning.vesHi}
            </button>
          </form>
          <Link
            href={`/planning?data=${toISODate(dAnterior)}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.planning.diaAnterior}
          </Link>
          <Link
            href={`/planning?data=${toISODate(avui)}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.planning.avui}
          </Link>
          <Link
            href={`/planning?data=${toISODate(dSeguent)}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.planning.diaSeguent}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
        <PlanningGraella recursos={recursosAmbBlocs} idioma={idioma} />
      </main>
    </div>
  );
}
