import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { ImprimeixButton } from "@/app/ImprimeixButton";

type FacturaPlataforma = {
  id: string;
  numero: number | null;
  periode_any: number;
  periode_mes: number;
  data_emissio: string | null;
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
};

const ESTAT_ESTIL: Record<string, string> = {
  esborrany: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  pendent: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  pagada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "anul·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function FacturaPlataformaDetallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getDict();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user!.id)
    .single();

  const { data: factura } = await supabase
    .from("factures_plataforma")
    .select(
      "id, numero, periode_any, periode_mes, data_emissio, base_imposable, iva_percent, total, estat, metode_pagament, tenants(nom_comercial, rao_social, nif, adreca_fiscal)",
    )
    .eq("id", id)
    .single<FacturaPlataforma>();

  if (!factura) {
    notFound();
  }

  const { data: plataforma } = await supabase
    .from("plataforma")
    .select("nom_comercial, rao_social, nif, adreca_fiscal")
    .limit(1)
    .single();

  const tornaHref = profile?.rol === "tecnic" ? "/tecnic/factures" : "/factures";

  return (
    <div className="flex flex-1 flex-col bg-rose-50 dark:bg-black print:bg-white">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5 print:hidden">
        <Link
          href={tornaHref}
          className="text-5xl leading-none font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
          {t.factures.quotaPlataforma.periode(factura.periode_mes, factura.periode_any)}
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-6 py-8 print:max-w-none print:gap-4">
        <h1 className="hidden text-xl font-semibold print:block">
          {t.factures.quotaPlataforma.periode(factura.periode_mes, factura.periode_any)}
          {factura.numero != null && ` · ${t.factures.quotaPlataforma.numero(factura.numero)}`}
        </h1>

        <section className="flex flex-col gap-6 rounded-2xl border border-black/5 bg-white shadow-sm p-6 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none print:border-0 print:p-0">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t.factures.detall.emissor}
              </h2>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_ESTIL[factura.estat] ?? ""}`}
                >
                  {t.comu.estats[factura.estat] ?? factura.estat}
                </span>
                <div className="print:hidden">
                  <ImprimeixButton text={t.factures.detall.imprimeix} />
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">
              {plataforma?.nom_comercial}
            </p>
            {plataforma?.rao_social && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{plataforma.rao_social}</p>
            )}
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {[plataforma?.nif, plataforma?.adreca_fiscal].filter(Boolean).join(" · ")}
            </p>
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.factures.quotaPlataforma.destinatari}
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
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/10">
            <dl className="flex flex-col gap-2 text-sm">
              {factura.data_emissio && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">{t.factures.detall.dataEmissio}</dt>
                  <dd className="text-zinc-900 dark:text-zinc-100">{factura.data_emissio}</dd>
                </div>
              )}
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
          </div>
        </section>
      </main>
    </div>
  );
}
