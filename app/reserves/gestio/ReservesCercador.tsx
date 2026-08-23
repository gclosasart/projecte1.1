"use client";

import { useMemo, useState } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { ReservaCard } from "./ReservaCard";
import { coincideixCerca, type Reserva } from "./tipus";

export function ReservesCercador({
  enCurs,
  pagades,
  cancellades,
  idioma,
}: {
  enCurs: Reserva[];
  pagades: Reserva[];
  cancellades: Reserva[];
  idioma: Idioma;
}) {
  const [query, setQuery] = useState("");
  const t = dictDe(idioma).reservaGestio;

  const enCursFiltrat = useMemo(() => enCurs.filter((r) => coincideixCerca(r, query)), [enCurs, query]);
  const pagadesFiltrat = useMemo(() => pagades.filter((r) => coincideixCerca(r, query)), [pagades, query]);
  const cancelladesFiltrat = useMemo(
    () => cancellades.filter((r) => coincideixCerca(r, query)),
    [cancellades, query],
  );

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.cercaPlaceholder}
        className="mb-6 w-full rounded-lg border border-black/5 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />

      <div className="grid min-w-0 gap-6 md:grid-cols-2">
        <section className="min-w-0">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.enCurs(enCursFiltrat.length)}
          </h2>
          {enCursFiltrat.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {query ? t.capResultatCerca : t.capEnCurs}
            </p>
          ) : (
            <ul className="flex max-h-[calc(100vh-16rem)] min-w-0 flex-col gap-3 overflow-y-auto pr-1">
              {enCursFiltrat.map((r) => (
                <ReservaCard key={r.id} r={r} idioma={idioma} />
              ))}
            </ul>
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-6">
          <section className="min-w-0">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.pagades(pagadesFiltrat.length)}
            </h2>
            {pagadesFiltrat.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {query ? t.capResultatCerca : t.capPagada}
              </p>
            ) : (
              <ul className="flex max-h-[calc(100vh-16rem)] min-w-0 flex-col gap-3 overflow-y-auto pr-1">
                {pagadesFiltrat.map((r) => (
                  <ReservaCard key={r.id} r={r} idioma={idioma} />
                ))}
              </ul>
            )}
          </section>

          <section className="min-w-0">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.cancellades(cancelladesFiltrat.length)}
            </h2>
            {cancelladesFiltrat.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {query ? t.capResultatCerca : t.capCancellada}
              </p>
            ) : (
              <ul className="flex max-h-[calc(100vh-16rem)] min-w-0 flex-col gap-3 overflow-y-auto pr-1">
                {cancelladesFiltrat.map((r) => (
                  <ReservaCard key={r.id} r={r} idioma={idioma} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
