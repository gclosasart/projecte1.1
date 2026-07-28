import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CancelOcurrenciaButton } from "../CancelOcurrenciaButton";

type Ocurrencia = {
  id: string;
  data: string;
  hora_inici: string;
  hora_fi: string;
  estat: string;
  preu: number;
};

type Factura = {
  id: string;
  ocurrencia_id: string;
  numero: number;
  estat: string;
  total: number;
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

  const { data: reserva } = await supabase
    .from("reserves")
    .select(
      "id, tipus, frequencia, data_inici, condicio_final, model_preu, preu_base_snapshot, estat, notes, recursos(nom), clients(nom)",
    )
    .eq("id", id)
    .single();

  if (!reserva) {
    notFound();
  }

  const recurs = reserva.recursos as unknown as { nom: string } | null;
  const client = reserva.clients as unknown as { nom: string } | null;

  const { data: ocurrencies } = await supabase
    .from("ocurrencies")
    .select("id, data, hora_inici, hora_fi, estat, preu")
    .eq("reserva_id", id)
    .order("data")
    .returns<Ocurrencia[]>();

  const ocIds = (ocurrencies ?? []).map((o) => o.id);
  const { data: factures } =
    ocIds.length > 0
      ? await supabase
          .from("factures")
          .select("id, ocurrencia_id, numero, estat, total")
          .in("ocurrencia_id", ocIds)
          .returns<Factura[]>()
      : { data: [] as Factura[] };

  const facturaPerOc = new Map((factures ?? []).map((f) => [f.ocurrencia_id, f]));
  const esRecurrent = reserva.tipus === "recurrent";

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link
          href="/reserves/gestio"
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Gestiona reserves
        </Link>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Detall de la reserva</h1>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            {recurs?.nom ?? "Recurs desconegut"} — {client?.nom ?? "Client desconegut"}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_RESERVA_ESTIL[reserva.estat] ?? ""}`}
            >
              {reserva.estat}
            </span>
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {esRecurrent ? "Recurrent" : "Puntual"} · des del {reserva.data_inici}
            {reserva.frequencia ? ` · ${reserva.frequencia}` : ""}
            {reserva.condicio_final ? ` · ${reserva.condicio_final}` : ""}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Preu base: {reserva.preu_base_snapshot} €
            {reserva.model_preu ? ` · ${reserva.model_preu === "per_ocurrencia" ? "preu per ocurrència" : "abonament fix"}` : ""}
          </p>

          {reserva.notes && (
            <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {reserva.notes.split("\n").map((linia: string, i: number) => (
                <p key={i}>{linia}</p>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Ocurrències i factures
          </h2>
          <ul className="flex flex-col gap-3">
            {(ocurrencies ?? []).map((oc) => {
              const factura = facturaPerOc.get(oc.id);
              return (
                <li
                  key={oc.id}
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {oc.data} · {oc.hora_inici.slice(0, 5)}–{oc.hora_fi.slice(0, 5)}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_RESERVA_ESTIL[oc.estat] ?? ""}`}
                      >
                        {oc.estat}
                      </span>
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {oc.preu} €
                      {factura && (
                        <>
                          {" "}
                          · Factura #{factura.numero}{" "}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${ESTAT_FACTURA_ESTIL[factura.estat] ?? ""}`}
                          >
                            {factura.estat}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {oc.estat === "activa" && (
                    <CancelOcurrenciaButton
                      ocurrenciaId={oc.id}
                      reservaId={reserva.id}
                      esRecurrent={esRecurrent}
                    />
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
