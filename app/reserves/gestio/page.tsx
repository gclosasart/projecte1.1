import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { ReservesCercador } from "./ReservesCercador";
import { ArxivadesSection } from "./ArxivadesSection";
import type { Reserva } from "./tipus";
import { BackButton } from "@/app/BackButton";

type ReservaAmbOcurrencies = Reserva & {
  ocurrencies: { id: string; factures: { estat: string }[] }[];
};

export default async function GestioReservesPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const { data: reserves } = await supabase
    .from("reserves")
    .select(
      "id, codi, tipus, frequencia, data_inici, condicio_final, model_preu, estat, arxivada, reserva_recursos(recursos(nom)), clients(nom), ocurrencies(id, factures(estat))",
    )
    .order("data_inici", { ascending: false })
    .returns<ReservaAmbOcurrencies[]>();

  const facturaEstatPerOc = new Map<string, string>();
  const ocsPerReserva = new Map<string, string[]>();
  for (const r of reserves ?? []) {
    const ocIds: string[] = [];
    for (const oc of r.ocurrencies ?? []) {
      ocIds.push(oc.id);
      const factura = oc.factures?.[0];
      if (factura) {
        facturaEstatPerOc.set(oc.id, factura.estat);
      }
    }
    ocsPerReserva.set(r.id, ocIds);
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
    <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
      <header className="flex items-center gap-4 px-6 py-5">
        <BackButton href="/dashboard" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.reservaGestio.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
        <Link
          href="/reserves/nova"
          className="mb-6 inline-block rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
        >
          {t.reservaGestio.novaReserva}
        </Link>

        {visibles.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.reservaGestio.capReservaCreada}</p>
        ) : (
          <ReservesCercador enCurs={enCurs} pagades={pagades} cancellades={cancellades} idioma={idioma} />
        )}

        <ArxivadesSection reserves={arxivades} idioma={idioma} />
      </main>
    </div>
  );
}
