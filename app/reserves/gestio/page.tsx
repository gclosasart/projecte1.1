import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReservaCard } from "./ReservaCard";
import { ArxivadesSection } from "./ArxivadesSection";
import type { Reserva } from "./tipus";

export default async function GestioReservesPage() {
  const supabase = await createClient();

  const { data: reserves } = await supabase
    .from("reserves")
    .select(
      "id, tipus, frequencia, data_inici, condicio_final, model_preu, estat, arxivada, reserva_recursos(recursos(nom)), clients(nom)",
    )
    .order("data_inici", { ascending: false })
    .returns<Reserva[]>();

  const reservaIds = (reserves ?? []).map((r) => r.id);

  const { data: ocurrencies } =
    reservaIds.length > 0
      ? await supabase.from("ocurrencies").select("id, reserva_id").in("reserva_id", reservaIds)
      : { data: [] as { id: string; reserva_id: string }[] };

  const ocIds = (ocurrencies ?? []).map((o) => o.id);
  const { data: factures } =
    ocIds.length > 0
      ? await supabase.from("factures").select("ocurrencia_id, estat").in("ocurrencia_id", ocIds)
      : { data: [] as { ocurrencia_id: string; estat: string }[] };

  const facturaEstatPerOc = new Map((factures ?? []).map((f) => [f.ocurrencia_id, f.estat]));
  const ocsPerReserva = new Map<string, string[]>();
  for (const oc of ocurrencies ?? []) {
    const llista = ocsPerReserva.get(oc.reserva_id) ?? [];
    llista.push(oc.id);
    ocsPerReserva.set(oc.reserva_id, llista);
  }

  const visibles = (reserves ?? []).filter((r) => !r.arxivada);
  const arxivades = (reserves ?? []).filter((r) => r.arxivada);

  const cancellades: Reserva[] = [];
  const pagades: Reserva[] = [];
  const enCurs: Reserva[] = [];

  for (const r of visibles) {
    if (r.estat === "cancel·lada") {
      cancellades.push(r);
      continue;
    }
    const estatsFactures = (ocsPerReserva.get(r.id) ?? []).map((ocId) => facturaEstatPerOc.get(ocId));
    const totesPagades = estatsFactures.length > 0 && estatsFactures.every((e) => e === "pagada");
    if (totesPagades) {
      pagades.push(r);
    } else {
      enCurs.push(r);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center justify-between gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <Link href="/reserves" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← Reserves
          </Link>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Gestiona reserves</h1>
        </div>
        <Link
          href="/reserves/nova"
          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
        >
          Nova reserva
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {visibles.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Encara no hi ha cap reserva creada.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                En curs ({enCurs.length})
              </h2>
              {enCurs.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Cap reserva en curs.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {enCurs.map((r) => (
                    <ReservaCard key={r.id} r={r} />
                  ))}
                </ul>
              )}
            </section>

            <div className="flex flex-col gap-6">
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Pagades ({pagades.length})
                </h2>
                {pagades.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Cap reserva totalment pagada.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {pagades.map((r) => (
                      <ReservaCard key={r.id} r={r} />
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Cancel·lades ({cancellades.length})
                </h2>
                {cancellades.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Cap reserva cancel·lada.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {cancellades.map((r) => (
                      <ReservaCard key={r.id} r={r} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        <ArxivadesSection reserves={arxivades} />
      </main>
    </div>
  );
}
