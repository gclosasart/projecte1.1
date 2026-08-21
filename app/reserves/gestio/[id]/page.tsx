import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { CancelOcurrenciaButton } from "../CancelOcurrenciaButton";
import { EditaRecursosReserva } from "../EditaRecursosReserva";
import { EstatReservaSelector } from "../EstatReservaSelector";
import { NoShowButton } from "../NoShowButton";

type Ocurrencia = {
  id: string;
  data: string;
  hora_inici: string;
  hora_fi: string;
  estat: string;
  preu: number;
  no_show: boolean;
};

type Factura = {
  id: string;
  ocurrencia_id: string;
  numero: number;
  estat: string;
  total: number;
  no_show: boolean;
};

// Estat de la RESERVA/OCURRÈNCIA (activa/cancel·lada) — no confondre amb el pagament de la factura.
const ESTAT_RESERVA_ESTIL: Record<string, string> = {
  activa: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  "cancel·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

// Estat de pagament de la FACTURA — verd només vol dir "pagada", no "reserva activa".
const ESTAT_FACTURA_ESTIL: Record<string, string> = {
  pendent: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  pagada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "anul·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function DetallReservaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const { data: reserva } = await supabase
    .from("reserves")
    .select(
      "id, codi, tipus, frequencia, data_inici, condicio_final, model_preu, preu_base_snapshot, estat, notes, reserva_recursos(recursos(id, nom)), clients(nom)",
    )
    .eq("id", id)
    .single();

  if (!reserva) {
    notFound();
  }

  const recursosReserva = reserva.reserva_recursos as unknown as
    | { recursos: { id: string; nom: string } | null }[]
    | null;
  const recursosSeleccionats = (recursosReserva ?? [])
    .map((rr) => rr.recursos)
    .filter((r): r is { id: string; nom: string } => Boolean(r));
  const nomsRecursos = recursosSeleccionats.length > 0
    ? recursosSeleccionats.map((r) => r.nom).join(" + ")
    : t.reservaGestio.recursDesconegut;
  const client = reserva.clients as unknown as { nom: string } | null;

  const { data: totsRecursos } = await supabase
    .from("recursos")
    .select("id, nom")
    .order("nom");

  const { data: ocurrencies } = await supabase
    .from("ocurrencies")
    .select("id, data, hora_inici, hora_fi, estat, preu, no_show")
    .eq("reserva_id", id)
    .order("data")
    .returns<Ocurrencia[]>();

  const ocIds = (ocurrencies ?? []).map((o) => o.id);
  const { data: factures } =
    ocIds.length > 0
      ? await supabase
          .from("factures")
          .select("id, ocurrencia_id, numero, estat, total, no_show")
          .in("ocurrencia_id", ocIds)
          .returns<Factura[]>()
      : { data: [] as Factura[] };

  const facturaPerOc = new Map((factures ?? []).map((f) => [f.ocurrencia_id, f]));
  const esRecurrent = reserva.tipus === "recurrent";

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link
          href="/reserves/gestio"
          className="text-7xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ←
        </Link>
        <h1 className="text-4xl font-semibold text-sky-600 dark:text-indigo-400">
          {t.reservaGestio.detall.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500">{reserva.codi}</p>
          <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-zinc-950 dark:text-zinc-50">
            {nomsRecursos} — {client?.nom ?? t.reservaGestio.clientDesconegut}
            <EstatReservaSelector reservaId={reserva.id} estatActual={reserva.estat} idioma={idioma} />
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {esRecurrent ? t.reservaGestio.recurrent : t.reservaGestio.puntual} ·{" "}
            {t.reservaGestio.desDel(reserva.data_inici)}
            {reserva.frequencia ? ` · ${reserva.frequencia}` : ""}
            {reserva.condicio_final ? ` · ${reserva.condicio_final}` : ""}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t.reservaGestio.detall.preuBase(String(reserva.preu_base_snapshot))}
            {reserva.model_preu
              ? ` · ${reserva.model_preu === "per_ocurrencia" ? t.reservaGestio.detall.preuPerOcurrencia : t.reservaGestio.detall.abonamentFix}`
              : ""}
          </p>

          {reserva.notes && (
            <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {reserva.notes.split("\n").map((linia: string, i: number) => (
                <p key={i}>{linia}</p>
              ))}
            </div>
          )}
        </section>

        {reserva.estat === "activa" && (
          <section className="mt-6 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {t.reservaGestio.detall.recursos}
            </h2>
            <div className="mt-3">
              <EditaRecursosReserva
                reservaId={reserva.id}
                recursosDisponibles={totsRecursos ?? []}
                recursIdsActuals={recursosSeleccionats.map((r) => r.id)}
                idioma={idioma}
              />
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.reservaGestio.detall.ocurrenciesIFactures}
          </h2>
          <ul className="flex flex-col gap-3">
            {(ocurrencies ?? []).map((oc) => {
              const factura = facturaPerOc.get(oc.id);
              return (
                <li
                  key={oc.id}
                  className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                        {oc.data} · {oc.hora_inici.slice(0, 5)}–{oc.hora_fi.slice(0, 5)}
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_RESERVA_ESTIL[oc.estat] ?? ""}`}
                        >
                          {t.comu.estats[oc.estat] ?? oc.estat}
                        </span>
                        {oc.no_show && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            {t.reservaGestio.detall.noShowBadge}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {oc.preu} €
                        {factura && (
                          <>
                            {" "}
                            · {t.reservaGestio.detall.factura(factura.numero)}{" "}
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${ESTAT_FACTURA_ESTIL[factura.estat] ?? ""}`}
                            >
                              {t.comu.estats[factura.estat] ?? factura.estat}
                            </span>
                            {factura.no_show && (
                              <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                {t.factures.detall.noShowBadge}
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <NoShowButton
                        ocurrenciaId={oc.id}
                        reservaId={reserva.id}
                        noShow={oc.no_show}
                        idioma={idioma}
                      />
                      {oc.estat === "activa" && (
                        <CancelOcurrenciaButton
                          ocurrenciaId={oc.id}
                          reservaId={reserva.id}
                          esRecurrent={esRecurrent}
                          idioma={idioma}
                        />
                      )}
                    </div>
                  </div>

                  {factura && (
                    <Link
                      href={`/factures/${factura.id}`}
                      className="rounded-full bg-sky-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                      {t.reservaGestio.detall.veureFactura}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
