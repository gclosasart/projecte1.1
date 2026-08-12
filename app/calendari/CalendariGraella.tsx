"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dictDe, type Idioma } from "@/lib/i18n/client";

const MAX_VISIBLES_PER_DIA = 3;

export type OcurrenciaResum = {
  id: string;
  reservaId: string;
  codi: string;
  horaInici: string;
  horaFi: string;
  estat: string;
  noShow: boolean;
  clientNom: string | null;
  recursos: string;
};

export type DiaGraella = {
  iso: string;
  dia: number;
  dinsDelMes: boolean;
  esAvui: boolean;
  ocurrencies: OcurrenciaResum[];
};

const ESTAT_ESTIL: Record<string, string> = {
  activa: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  "cancel·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function CalendariGraella({ dies, idioma }: { dies: DiaGraella[]; idioma: Idioma }) {
  const dict = dictDe(idioma);
  const t = dict.calendari;
  const [seleccionat, setSeleccionat] = useState<DiaGraella | null>(null);

  useEffect(() => {
    if (!seleccionat) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSeleccionat(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [seleccionat]);

  return (
    <>
      <div className="overflow-x-auto">
        <div className="grid min-w-[840px] grid-cols-7 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
          {dict.calendari.dies.map((nom) => (
            <div
              key={nom}
              className="border-b border-black/10 bg-sky-600 px-2 py-2 text-center text-xs font-semibold text-white dark:border-white/10 dark:bg-indigo-500 dark:text-white"
            >
              {nom}
            </div>
          ))}

          {dies.map((d) => {
            const visibles = d.ocurrencies.slice(0, MAX_VISIBLES_PER_DIA);
            const restants = d.ocurrencies.length - visibles.length;

            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => setSeleccionat(d)}
                className={`min-h-28 border-b border-r border-black/10 p-1.5 text-left last:border-r-0 hover:ring-1 hover:ring-inset hover:ring-sky-600 dark:border-white/10 dark:hover:ring-indigo-500 ${
                  d.dinsDelMes ? "bg-white dark:bg-zinc-950" : "bg-sky-50 dark:bg-zinc-900/40"
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    d.esAvui
                      ? "bg-sky-600 font-semibold text-white dark:bg-indigo-500 dark:text-white"
                      : d.dinsDelMes
                        ? "text-zinc-700 dark:text-zinc-300"
                        : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {d.dia}
                </span>

                <ul className="mt-1 flex flex-col gap-0.5">
                  {visibles.map((oc) => (
                    <li
                      key={oc.id}
                      className="truncate rounded bg-zinc-100 px-1 py-0.5 text-[11px] leading-tight text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {oc.horaInici.slice(0, 5)} {oc.recursos}
                    </li>
                  ))}
                  {restants > 0 && (
                    <li className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {t.mesMes(restants)}
                    </li>
                  )}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {seleccionat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSeleccionat(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                {t.reservesDe(seleccionat.iso)}
              </h2>
              <button
                type="button"
                onClick={() => setSeleccionat(null)}
                className="rounded-full p-1 text-zinc-500 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/10"
                aria-label={t.tancar}
              >
                ✕
              </button>
            </div>

            {seleccionat.ocurrencies.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.capReservaDia}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {seleccionat.ocurrencies.map((oc) => (
                  <li key={oc.id}>
                    <Link
                      href={`/reserves/gestio/${oc.reservaId}`}
                      onClick={() => setSeleccionat(null)}
                      className="block rounded-lg border border-black/10 p-3 transition-colors hover:border-sky-600 dark:border-white/10 dark:hover:border-indigo-500"
                    >
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                        {oc.horaInici.slice(0, 5)}–{oc.horaFi.slice(0, 5)} · {oc.recursos}
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_ESTIL[oc.estat] ?? ""}`}
                        >
                          {dict.comu.estats[oc.estat] ?? oc.estat}
                        </span>
                        {oc.noShow && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            {dict.reservaGestio.detall.noShowBadge}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                        {oc.clientNom ?? dict.reservaGestio.clientDesconegut} · {oc.codi}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
