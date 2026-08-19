import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

type Recurs = {
  id: string;
  nom: string;
  quantitat: number;
};

type OcurrenciaDia = {
  hora_inici: string;
  hora_fi: string;
  reserves: { reserva_recursos: { recurs_id: string }[] } | null;
};

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function picConcurrencia(intervals: { inici: string; fi: string }[]): number {
  const events: [string, number][] = [];
  for (const iv of intervals) {
    events.push([iv.inici, 1]);
    events.push([iv.fi, -1]);
  }
  events.sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] < b[0] ? -1 : 1));

  let actual = 0;
  let max = 0;
  for (const [, delta] of events) {
    actual += delta;
    if (actual > max) max = actual;
  }
  return max;
}

export default async function DisponibilitatPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const t = await getDict();
  const avui = new Date();
  avui.setHours(0, 0, 0, 0);
  const dataSeleccionada =
    dataParam && /^\d{4}-\d{2}-\d{2}$/.test(dataParam) ? dataParam : toISODate(avui);

  const supabase = await createClient();

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nom, quantitat")
    .eq("actiu", true)
    .order("nom")
    .returns<Recurs[]>();

  const { data: ocurrencies } = await supabase
    .from("ocurrencies")
    .select("hora_inici, hora_fi, reserves(reserva_recursos(recurs_id))")
    .eq("data", dataSeleccionada)
    .eq("estat", "activa")
    .returns<OcurrenciaDia[]>();

  const intervalsPerRecurs = new Map<string, { inici: string; fi: string }[]>();
  for (const oc of ocurrencies ?? []) {
    const recursIds = oc.reserves?.reserva_recursos.map((rr) => rr.recurs_id) ?? [];
    for (const rid of recursIds) {
      const llista = intervalsPerRecurs.get(rid) ?? [];
      llista.push({ inici: oc.hora_inici, fi: oc.hora_fi });
      intervalsPerRecurs.set(rid, llista);
    }
  }

  const dataObj = new Date(`${dataSeleccionada}T00:00:00`);
  const dAnterior = new Date(dataObj);
  dAnterior.setDate(dAnterior.getDate() - 1);
  const dSeguent = new Date(dataObj);
  dSeguent.setDate(dSeguent.getDate() + 1);

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ←
          </Link>
          <h1 className="text-2xl font-semibold text-sky-600 dark:text-indigo-400">{t.disponibilitat.titol}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form method="get" className="flex items-center gap-1.5">
            <input
              type="date"
              name="data"
              defaultValue={dataSeleccionada}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              type="submit"
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              {t.disponibilitat.vesHi}
            </button>
          </form>
          <Link
            href={`/disponibilitat?data=${toISODate(dAnterior)}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.disponibilitat.diaAnterior}
          </Link>
          <Link
            href={`/disponibilitat?data=${toISODate(avui)}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.disponibilitat.avui}
          </Link>
          <Link
            href={`/disponibilitat?data=${toISODate(dSeguent)}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.disponibilitat.diaSeguent}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          {t.disponibilitat.descripcio(dataSeleccionada)}
        </p>

        {!recursos || recursos.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.disponibilitat.capRecursActiu}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recursos.map((r) => {
              const ocupades = picConcurrencia(intervalsPerRecurs.get(r.id) ?? []);
              const lliures = Math.max(r.quantitat - ocupades, 0);
              const percentOcupat =
                r.quantitat > 0 ? Math.min(Math.round((ocupades / r.quantitat) * 100), 100) : 0;
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{r.nom}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <span
                        className={
                          lliures === 0
                            ? "font-semibold text-red-600 dark:text-red-400"
                            : "font-semibold text-emerald-700 dark:text-emerald-400"
                        }
                      >
                        {lliures}
                      </span>{" "}
                      {t.disponibilitat.lliuresDe(r.quantitat)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-sky-600 dark:bg-indigo-500"
                      style={{ width: `${percentOcupat}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
