"use client";

import { useMemo, useState } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { ReservaCard } from "./ReservaCard";
import { coincideixCerca, type Reserva } from "./tipus";

export function ArxivadesSection({ reserves, idioma }: { reserves: Reserva[]; idioma: Idioma }) {
  const [obert, setObert] = useState(false);
  const [query, setQuery] = useState("");
  const t = dictDe(idioma).reservaGestio;

  const filtrades = useMemo(() => reserves.filter((r) => coincideixCerca(r, query)), [reserves, query]);

  if (reserves.length === 0) return null;

  return (
    <section className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
      <button
        type="button"
        onClick={() => setObert((v) => !v)}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <span aria-hidden>{obert ? "📂" : "📁"}</span>
        {t.arxivades(reserves.length)}
        <span className="text-xs">{obert ? "▲" : "▼"}</span>
      </button>

      {obert && (
        <div className="mt-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.cercaPlaceholder}
            className="mb-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {filtrades.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.capResultatCerca}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {filtrades.map((r) => (
                <ReservaCard key={r.id} r={r} idioma={idioma} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
