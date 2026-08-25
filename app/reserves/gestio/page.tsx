import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { ReservesCercador } from "./ReservesCercador";
import { ArxivadesSection } from "./ArxivadesSection";
import { SollicitudsPendents } from "./SollicitudsPendents";
import type { Reserva } from "./tipus";
import { BackButton } from "@/app/BackButton";

type ReservaAmbOcurrencies = Reserva & {
  ocurrencies: { id: string; factures: { estat: string }[] }[];
};

type SollicitudAmbRecurs = {
  id: string;
  data: string;
  hora_inici: string;
  hora_fi: string;
  nom: string;
  email: string | null;
  telefon: string | null;
  missatge: string | null;
  recursos: { nom: string } | null;
};

export default async function GestioReservesPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const { data: sollicituds } = await supabase
    .from("sol_licituds_reserva")
    .select("id, data, hora_inici, hora_fi, nom, email, telefon, missatge, recursos(nom)")
    .eq("estat", "pendent")
    .order("created_at", { ascending: false })
    .returns<SollicitudAmbRecurs[]>();

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
        <SollicitudsPendents
          sollicituds={(sollicituds ?? []).map((s) => ({
            id: s.id,
            data: s.data,
            hora_inici: s.hora_inici,
            hora_fi: s.hora_fi,
            nom: s.nom,
            email: s.email,
            telefon: s.telefon,
            missatge: s.missatge,
            recurs_nom: s.recursos?.nom ?? t.reservaGestio.recursDesconegut,
          }))}
          textos={t.reservaGestio}
        />

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
