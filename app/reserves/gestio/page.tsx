import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { ReservesCercador } from "./ReservesCercador";
import { ArxivadesSection } from "./ArxivadesSection";
import type { Reserva } from "./tipus";

export default async function GestioReservesPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const { data: reserves } = await supabase
    .from("reserves")
    .select(
      "id, codi, tipus, frequencia, data_inici, condicio_final, model_preu, estat, arxivada, reserva_recursos(recursos(nom)), clients(nom)",
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
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-7xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          ←
        </Link>
        <h1 className="text-4xl font-semibold text-sky-600 dark:text-indigo-400">{t.reservaGestio.titol}</h1>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-10">
        <Link
          href="/reserves/nova"
          className="mb-8 inline-block rounded-full bg-sky-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
        >
          {t.reservaGestio.novaReserva}
        </Link>

        {visibles.length === 0 ? (
          <p className="text-base text-zinc-500 dark:text-zinc-400">{t.reservaGestio.capReservaCreada}</p>
        ) : (
          <ReservesCercador enCurs={enCurs} pagades={pagades} cancellades={cancellades} idioma={idioma} />
        )}

        <ArxivadesSection reserves={arxivades} idioma={idioma} />
      </main>
    </div>
  );
}
