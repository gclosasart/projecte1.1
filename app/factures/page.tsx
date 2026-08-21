import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { FacturesList } from "./FacturesList";

type Factura = {
  id: string;
  numero: number;
  data_emissio: string;
  base_imposable: number;
  iva_percent: number;
  total: number;
  estat: string;
  metode_pagament: string | null;
  no_show: boolean;
  ocurrencies: {
    data: string;
    reserves: {
      reserva_recursos: { recursos: { nom: string } | null }[];
      clients: { nom: string } | null;
    } | null;
  } | null;
};

export default async function FacturesPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const { data: factures } = await supabase
    .from("factures")
    .select(
      "id, numero, data_emissio, base_imposable, iva_percent, total, estat, metode_pagament, no_show, ocurrencies(data, reserves(reserva_recursos(recursos(nom)), clients(nom)))",
    )
    .order("numero", { ascending: false })
    .returns<Factura[]>();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-5xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          ←
        </Link>
        <h1 className="text-2xl font-semibold text-sky-600 dark:text-indigo-400">{t.factures.titol}</h1>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {!factures || factures.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.factures.capFactura}</p>
        ) : (
          <FacturesList factures={factures} idioma={idioma} />
        )}
      </main>
    </div>
  );
}
