import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { formatNumeroFactura } from "@/lib/factures";
import { MarcaPagadaForm } from "../MarcaPagadaForm";
import { CreaRectificativaButton } from "../CreaRectificativaButton";
import { ImprimeixButton } from "@/app/ImprimeixButton";

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
  factura_rectificada_id: string | null;
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
  rectificativa: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
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
      "id, numero, serie, data_emissio, base_imposable, iva_percent, total, estat, metode_pagament, no_show, factura_rectificada_id, tenants(nom_comercial, rao_social, nif, adreca_fiscal), ocurrencies(data, hora_inici, hora_fi, reserves(reserva_recursos(recursos(nom)), clients(nom, nif, email, adreca)))",
    )
    .eq("id", id)
    .single<Factura>();

  if (!factura) {
    notFound();
  }

  const { data: original } = factura.factura_rectificada_id
    ? await supabase
        .from("factures")
        .select("id, numero, serie")
        .eq("id", factura.factura_rectificada_id)
        .single()
    : { data: null };

  const { data: rectificativa } = await supabase
    .from("factures")
    .select("id, numero, serie")
    .eq("factura_rectificada_id", factura.id)
    .maybeSingle();

  const client = factura.ocurrencies?.reserves?.clients ?? null;
  const noms = (factura.ocurrencies?.reserves?.reserva_recursos ?? [])
    .map((rr) => rr.recursos?.nom)
    .filter((n): n is string => Boolean(n));
  const recursText = noms.length > 0 ? noms.join(" + ") : t.factures.recursDesconegut;
  const potRectificar = factura.estat === "pendent" || factura.estat === "pagada";

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black print:bg-white">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5 print:hidden">
        <Link
          href="/factures"
          className="text-5xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-semibold text-sky-600 dark:text-indigo-400">
          {t.factures.facturaFormatada(formatNumeroFactura(factura.serie, factura.numero))}
        </h1>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_ESTIL[factura.estat] ?? ""}`}
        >
          {t.comu.estats[factura.estat] ?? factura.estat}
        </span>
        {factura.no_show && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            {t.factures.detall.noShowBadge}
          </span>
        )}
        <ImprimeixButton text={t.factures.detall.imprimeix} />
      </header>

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-6 py-8 print:max-w-none print:gap-4">
        <h1 className="hidden text-xl font-semibold print:block">
          {t.factures.facturaFormatada(formatNumeroFactura(factura.serie, factura.numero))}
        </h1>

        {original && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.factures.detall.rectificaA(formatNumeroFactura(original.serie, original.numero))}{" "}
            <Link href={`/factures/${original.id}`} className="text-sky-600 hover:underline dark:text-indigo-400">
              {t.factures.detall.veureFactura}
            </Link>
          </p>
        )}
        {rectificativa && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.factures.detall.rectificadaPer(
              formatNumeroFactura(rectificativa.serie, rectificativa.numero),
            )}{" "}
            <Link
              href={`/factures/${rectificativa.id}`}
              className="text-sky-600 hover:underline dark:text-indigo-400"
            >
              {t.factures.detall.veureFactura}
            </Link>
          </p>
        )}

        <section className="flex flex-col gap-6 rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950 print:border-0 print:p-0">
          <div>
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
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.dashboard.client}
            </h2>
            <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">
              {client?.nom ?? t.factures.clientDesconegut}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {[client?.nif, client?.email, client?.adreca].filter(Boolean).join(" · ")}
            </p>
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/10">
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
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/10">
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
              <div className="mt-4 print:hidden">
                <MarcaPagadaForm facturaId={factura.id} idioma={idioma} />
              </div>
            )}
          </div>
        </section>

        {potRectificar && !rectificativa && (
          <section className="print:hidden">
            <CreaRectificativaButton facturaId={factura.id} idioma={idioma} />
          </section>
        )}
      </main>
    </div>
  );
}
