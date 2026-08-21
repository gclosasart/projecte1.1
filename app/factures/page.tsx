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
      <header className="flex flex-wrap items-center gap-4 bg-white px-6 py-5 dark:bg-zinc-950">
        <Link
          href="/dashboard"
          className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform hover:scale-105 dark:bg-white dark:text-zinc-950"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" aria-hidden>
            <path
              d="M16 10H4m0 0 4.5-4.5M4 10l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-950 uppercase italic dark:text-zinc-50">
          {t.factures.titol}
        </h1>
      </header>
      <div className="h-1.5 w-full bg-blue-900 dark:bg-blue-800" aria-hidden />

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-8">
        {!factures || factures.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.factures.capFactura}</p>
        ) : (
          <FacturesList factures={factures} idioma={idioma} />
        )}
      </main>
    </div>
  );
}
