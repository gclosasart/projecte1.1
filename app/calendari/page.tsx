import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { CalendariGraella, type DiaGraella } from "./CalendariGraella";
import { BackButton } from "@/app/BackButton";

type Ocurrencia = {
  id: string;
  data: string;
  hora_inici: string;
  hora_fi: string;
  estat: string;
  no_show: boolean;
  reserves: {
    id: string;
    codi: string;
    reserva_recursos: { recursos: { nom: string } | null }[];
    clients: { nom: string } | null;
  } | null;
};

function nomsRecursosOcurrencia(oc: Ocurrencia): string {
  const noms = (oc.reserves?.reserva_recursos ?? [])
    .map((rr) => rr.recursos?.nom)
    .filter((n): n is string => Boolean(n));
  return noms.length > 0 ? noms.join(" + ") : "?";
}

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
  const t = await getDict();
  const idioma = await getIdioma();
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
    .select(
      "id, data, hora_inici, hora_fi, estat, no_show, reserves(id, codi, reserva_recursos(recursos(nom)), clients(nom))",
    )
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

  const diesGraella: DiaGraella[] = dies.map((d) => {
    const dISO = toISODate(d);
    return {
      iso: dISO,
      dia: d.getDate(),
      dinsDelMes: d.getMonth() === mesIdx,
      esAvui: dISO === toISODate(avui),
      ocurrencies: (perDia.get(dISO) ?? [])
        .filter((oc) => oc.reserves)
        .map((oc) => ({
          id: oc.id,
          reservaId: oc.reserves!.id,
          codi: oc.reserves!.codi,
          horaInici: oc.hora_inici,
          horaFi: oc.hora_fi,
          estat: oc.estat,
          noShow: oc.no_show,
          clientNom: oc.reserves!.clients?.nom ?? null,
          recursos: nomsRecursosOcurrencia(oc),
        })),
    };
  });

  return (
    <div className="flex flex-1 flex-col bg-marble dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.calendari.titol}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form method="get" className="flex items-center gap-1.5">
            <input
              type="month"
              name="mes"
              defaultValue={`${any}-${String(mesIdx + 1).padStart(2, "0")}`}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              type="submit"
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              {t.calendari.vesHi}
            </button>
          </form>
          <Link
            href={`/calendari?mes=${paramMesAnterior}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.calendari.mesAnterior}
          </Link>
          <Link
            href={`/calendari?mes=${paramMesActual}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.calendari.avui}
          </Link>
          <Link
            href={`/calendari?mes=${paramMesSeguent}`}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {t.calendari.mesSeguent}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <h2 className="mb-4 text-center text-2xl font-bold text-zinc-950 dark:text-zinc-50">
          {t.calendari.mesos[mesIdx]} {any}
        </h2>

        <CalendariGraella dies={diesGraella} idioma={idioma} />
      </main>
    </div>
  );
}
