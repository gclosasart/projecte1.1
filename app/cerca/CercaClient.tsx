"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { dictDe, type Idioma } from "@/lib/i18n/client";

type Coworking = { id: string; nom: string; numRecursos: number };

export function CercaClient({ coworkings, idioma }: { coworkings: Coworking[]; idioma: Idioma }) {
  const t = dictDe(idioma).cerca;
  const [query, setQuery] = useState("");

  const filtrats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coworkings;
    return coworkings.filter((c) => c.nom.toLowerCase().includes(q));
  }, [coworkings, query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.cercaPlaceholder}
        className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-zinc-950 shadow-sm outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50"
      />

      <div className="mt-6 flex flex-col gap-3">
        {coworkings.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{t.capCoworking}</p>
        ) : filtrats.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{t.capResultat}</p>
        ) : (
          filtrats.map((c) => (
            <Link
              key={c.id}
              href={`/reserva/${c.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-950 dark:shadow-none"
            >
              <div>
                <p className="font-semibold text-zinc-950 dark:text-zinc-50">{c.nom}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {t.recursosDisponibles(c.numRecursos)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white dark:bg-teal-500">
                {t.reservaAra}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
