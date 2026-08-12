import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { MarcaPagadaForm } from "../MarcaPagadaForm";

type Factura = {
  id: string;
  numero: number;
  data_emissio: string;
  base_imposable: number;
  iva_percent: number;
  total: number;
  estat: string;
  metode_pagament: string | null;
  tenants: {
    nom_comercial: string;
    rao_social: string | null;
    nif: string | null;
    adreca_fiscal: string | null;
  } | null;
  ocurrencies: {
    data: string;
    hora_inici: string;
    hora_fi: string;
    reserves: {
      reserva_recursos: { recursos: { nom: string } | null }[];
      clients: { nom: string; nif: string | null; email: string | null; adreca: string | null } | null;
    } | null;
  } | null;
};

const ESTAT_ESTIL: Record<string, string> = {
  pendent: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  pagada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "anul·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function FacturaDetallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const { data: factura } = await supabase
    .from("factures")
    .select(
      "id, numero, data_emissio, base_imposable, iva_percent, total, estat, metode_pagament, tenants(nom_comercial, rao_social, nif, adreca_fiscal), ocurrencies(data, hora_inici, hora_fi, reserves(reserva_recursos(recursos(nom)), clients(nom, nif, email, adreca)))",
    )
    .eq("id", id)
    .single<Factura>();

  if (!factura) {
    notFound();
  }

  const client = factura.ocurrencies?.reserves?.clients ?? null;
  const noms = (factura.ocurrencies?.reserves?.reserva_recursos ?? [])
    .map((rr) => rr.recursos?.nom)
    .filter((n): n is string => Boolean(n));
  const recursText = noms.length > 0 ? noms.join(" + ") : t.factures.recursDesconegut;

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/factures" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← {t.factures.titol}
        </Link>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          {t.factures.factura(factura.numero)}
        </h1>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_ESTIL[factura.estat] ?? ""}`}
        >
          {t.comu.estats[factura.estat] ?? factura.estat}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-8">
        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.factures.detall.emissor}
          </h2>
          <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">
            {factura.tenants?.nom_comercial}
          </p>
          {factura.tenants?.rao_social && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{factura.tenants.rao_social}</p>
          )}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[factura.tenants?.nif, factura.tenants?.adreca_fiscal].filter(Boolean).join(" · ")}
          </p>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.dashboard.client}
          </h2>
          <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">
            {client?.nom ?? t.factures.clientDesconegut}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[client?.nif, client?.email, client?.adreca].filter(Boolean).join(" · ")}
          </p>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.dashboard.recurs}
          </h2>
          <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{recursText}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {factura.ocurrencies?.data ?? factura.data_emissio}
            {factura.ocurrencies && (
              <>
                {" "}
                · {factura.ocurrencies.hora_inici.slice(0, 5)}–{factura.ocurrencies.hora_fi.slice(0, 5)}
              </>
            )}
          </p>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">{t.factures.detall.baseImposable}</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">{factura.base_imposable} €</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">
                {t.factures.detall.iva} ({factura.iva_percent}%)
              </dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {(factura.total - factura.base_imposable).toFixed(2)} €
              </dd>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold dark:border-white/10">
              <dt className="text-zinc-950 dark:text-zinc-50">{t.factures.detall.total}</dt>
              <dd className="text-zinc-950 dark:text-zinc-50">{factura.total} €</dd>
            </div>
            {factura.estat === "pagada" && factura.metode_pagament && (
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">{t.factures.detall.metodePagament}</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{factura.metode_pagament}</dd>
              </div>
            )}
          </dl>

          {factura.estat === "pendent" && (
            <div className="mt-4">
              <MarcaPagadaForm facturaId={factura.id} idioma={idioma} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
