import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const DIES = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte", "Diumenge"];
const MESOS = [
  "Gener",
  "Febrer",
  "Març",
  "Abril",
  "Maig",
  "Juny",
  "Juliol",
  "Agost",
  "Setembre",
  "Octubre",
  "Novembre",
  "Desembre",
];

const MAX_VISIBLES_PER_DIA = 3;

type Ocurrencia = {
  id: string;
  data: string;
  hora_inici: string;
  hora_fi: string;
  reserves: {
    recursos: { nom: string } | null;
    clients: { nom: string } | null;
  } | null;
};

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dilluniDe(data: Date): Date {
  const d = new Date(data);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  return d;
}

export default async function CalendariPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const avui = new Date();
  avui.setHours(0, 0, 0, 0);

  let any = avui.getFullYear();
  let mesIdx = avui.getMonth();
  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const [y, m] = mes.split("-").map(Number);
    any = y;
    mesIdx = m - 1;
  }

  const primerDelMes = new Date(any, mesIdx, 1);
  const ultimDelMes = new Date(any, mesIdx + 1, 0);
  const graellaInici = dilluniDe(primerDelMes);
  const graellaFi = new Date(dilluniDe(ultimDelMes));
  graellaFi.setDate(graellaFi.getDate() + 6);

  const dies: Date[] = [];
  for (let d = new Date(graellaInici); d <= graellaFi; d.setDate(d.getDate() + 1)) {
    dies.push(new Date(d));
  }

  const mesAnterior = new Date(any, mesIdx - 1, 1);
  const mesSeguent = new Date(any, mesIdx + 1, 1);
  const paramMesAnterior = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, "0")}`;
  const paramMesSeguent = `${mesSeguent.getFullYear()}-${String(mesSeguent.getMonth() + 1).padStart(2, "0")}`;
  const paramMesActual = `${avui.getFullYear()}-${String(avui.getMonth() + 1).padStart(2, "0")}`;

  const supabase = await createClient();
  const { data: ocurrencies } = await supabase
    .from("ocurrencies")
    .select("id, data, hora_inici, hora_fi, reserves(recursos(nom), clients(nom))")
    .eq("estat", "activa")
    .gte("data", toISODate(graellaInici))
    .lte("data", toISODate(graellaFi))
    .order("hora_inici")
    .returns<Ocurrencia[]>();

  const perDia = new Map<string, Ocurrencia[]>();
  for (const oc of ocurrencies ?? []) {
    const llista = perDia.get(oc.data) ?? [];
    llista.push(oc);
    perDia.set(oc.data, llista);
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Calendari</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form method="get" className="flex items-center gap-1.5">
            <input
              type="month"
              name="mes"
              defaultValue={`${any}-${String(mesIdx + 1).padStart(2, "0")}`}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-950 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              type="submit"
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              Vés-hi
            </button>
          </form>
          <Link
            href={`/calendari?mes=${paramMesAnterior}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            ← Mes anterior
          </Link>
          <Link
            href={`/calendari?mes=${paramMesActual}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            Avui
          </Link>
          <Link
            href={`/calendari?mes=${paramMesSeguent}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            Mes següent →
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <h2 className="mb-4 text-center text-2xl font-bold text-zinc-950 dark:text-zinc-50">
          {MESOS[mesIdx]} {any}
        </h2>

        <div className="overflow-x-auto">
          <div className="grid min-w-[840px] grid-cols-7 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
            {DIES.map((nom) => (
              <div
                key={nom}
                className="border-b border-black/10 bg-indigo-600 px-2 py-2 text-center text-xs font-semibold text-white dark:border-white/10 dark:bg-indigo-500 dark:text-white"
              >
                {nom}
              </div>
            ))}

            {dies.map((d) => {
              const dISO = toISODate(d);
              const dinsDelMes = d.getMonth() === mesIdx;
              const esAvui = dISO === toISODate(avui);
              const ocsDelDia = perDia.get(dISO) ?? [];
              const visibles = ocsDelDia.slice(0, MAX_VISIBLES_PER_DIA);
              const restants = ocsDelDia.length - visibles.length;

              return (
                <div
                  key={dISO}
                  className={`min-h-28 border-b border-r border-black/10 p-1.5 last:border-r-0 dark:border-white/10 ${
                    dinsDelMes ? "bg-white dark:bg-zinc-950" : "bg-zinc-50 dark:bg-zinc-900/40"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      esAvui
                        ? "bg-indigo-600 font-semibold text-white dark:bg-indigo-500 dark:text-white"
                        : dinsDelMes
                          ? "text-zinc-700 dark:text-zinc-300"
                          : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {d.getDate()}
                  </span>

                  <ul className="mt-1 flex flex-col gap-0.5">
                    {visibles.map((oc) => (
                      <li
                        key={oc.id}
                        className="truncate rounded bg-zinc-100 px-1 py-0.5 text-[11px] leading-tight text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                        title={`${oc.hora_inici.slice(0, 5)}–${oc.hora_fi.slice(0, 5)} ${oc.reserves?.recursos?.nom ?? ""} — ${oc.reserves?.clients?.nom ?? ""}`}
                      >
                        {oc.hora_inici.slice(0, 5)} {oc.reserves?.recursos?.nom ?? "?"}
                      </li>
                    ))}
                    {restants > 0 && (
                      <li className="text-[11px] text-zinc-500 dark:text-zinc-400">+{restants} més</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
