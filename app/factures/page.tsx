import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { FacturesList } from "./FacturesList";

type Factura = {
  id: string;
  numero: number;
  serie: string;
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

type FacturaPlataformaResum = {
  id: string;
  numero: number | null;
  periode_any: number;
  periode_mes: number;
  total: number;
  estat: string;
};

export default async function FacturesPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user!.id)
    .single();

  const { data: factures } = await supabase
    .from("factures")
    .select(
      "id, numero, serie, data_emissio, base_imposable, iva_percent, total, estat, metode_pagament, no_show, ocurrencies(data, reserves(reserva_recursos(recursos(nom)), clients(nom)))",
    )
    .order("numero", { ascending: false })
    .returns<Factura[]>();

  const { data: facturesPlataforma } =
    profile?.rol === "tenant_admin"
      ? await supabase
          .from("factures_plataforma")
          .select("id, numero, periode_any, periode_mes, total, estat")
          .neq("estat", "esborrany")
          .order("periode_any", { ascending: false })
          .order("periode_mes", { ascending: false })
          .returns<FacturaPlataformaResum[]>()
      : { data: null };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5">
        <Link
          href="/dashboard"
          className="text-5xl leading-none font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
          {t.factures.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
        {!factures || factures.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.factures.capFactura}</p>
        ) : (
          <FacturesList factures={factures} idioma={idioma} />
        )}

        {facturesPlataforma && facturesPlataforma.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.factures.quotaPlataforma.titol}
            </h2>
            <ul className="flex flex-col gap-3">
              {facturesPlataforma.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/factures/plataforma/${f.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white shadow-sm p-4 hover:underline dark:border-white/10 dark:bg-zinc-950 dark:shadow-none"
                  >
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">
                      {t.factures.quotaPlataforma.periode(f.periode_mes, f.periode_any)}
                      {f.numero != null && ` · ${t.factures.quotaPlataforma.numero(f.numero)}`}
                      <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                        {t.comu.estats[f.estat] ?? f.estat}
                      </span>
                    </span>
                    <strong className="text-sm text-zinc-950 dark:text-zinc-50">{f.total} €</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
