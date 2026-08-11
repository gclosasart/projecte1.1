"use client";

import { useState } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { ReservaCard } from "./ReservaCard";
import type { Reserva } from "./tipus";

export function ArxivadesSection({ reserves, idioma }: { reserves: Reserva[]; idioma: Idioma }) {
  const [obert, setObert] = useState(false);
  const t = dictDe(idioma).reservaGestio;

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
        <ul className="mt-4 flex flex-col gap-3">
          {reserves.map((r) => (
            <ReservaCard key={r.id} r={r} idioma={idioma} />
          ))}
        </ul>
      )}
    </section>
  );
}
