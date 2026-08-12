"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { MarcaPagadaForm } from "./MarcaPagadaForm";

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

function nomsRecursosFactura(f: Factura, recursDesconegut: string): string {
  const noms = (f.ocurrencies?.reserves?.reserva_recursos ?? [])
    .map((rr) => rr.recursos?.nom)
    .filter((n): n is string => Boolean(n));
  return noms.length > 0 ? noms.join(" + ") : recursDesconegut;
}

const ESTAT_ESTIL: Record<string, string> = {
  pendent: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  pagada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "anul·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function FacturesList({ factures, idioma }: { factures: Factura[]; idioma: Idioma }) {
  const [query, setQuery] = useState("");
  const dict = dictDe(idioma);
  const t = dict.factures;

  const filtrades = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return factures;
    return factures.filter((f) => {
      const client = f.ocurrencies?.reserves?.clients?.nom ?? "";
      const recurs = nomsRecursosFactura(f, "");
      return (
        client.toLowerCase().includes(q) ||
        recurs.toLowerCase().includes(q) ||
        String(f.numero).includes(q)
      );
    });
  }, [factures, query]);

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.cercaPlaceholder}
        className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />

      {filtrades.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.capResultatCerca}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtrades.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
            >
              <Link href={`/factures/${f.id}`} className="min-w-0 flex-1 hover:underline">
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  {t.factura(f.numero)}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_ESTIL[f.estat] ?? ""}`}
                  >
                    {dict.comu.estats[f.estat] ?? f.estat}
                  </span>
                  {f.no_show && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      {t.detall.noShowBadge}
                    </span>
                  )}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {f.ocurrencies?.reserves?.clients?.nom ?? t.clientDesconegut} ·{" "}
                  {nomsRecursosFactura(f, t.recursDesconegut)} ·{" "}
                  {f.ocurrencies?.data ?? f.data_emissio}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t.basePrefix(String(f.base_imposable), String(f.iva_percent))}
                  <strong>{f.total} €</strong>
                </p>
                {f.estat === "pagada" && f.metode_pagament && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    {t.pagadaAmb(f.metode_pagament)}
                  </p>
                )}
              </Link>

              {f.estat === "pendent" && <MarcaPagadaForm facturaId={f.id} idioma={idioma} />}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
