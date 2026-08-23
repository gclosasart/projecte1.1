"use client";

import { useState, useTransition } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { marcarPagada } from "./actions";

const METODES = ["efectiu", "targeta", "transferencia", "altres"] as const;

export function MarcaPagadaForm({ facturaId, idioma }: { facturaId: string; idioma: Idioma }) {
  const dict = dictDe(idioma);
  const [obert, setObert] = useState(false);
  const [metode, setMetode] = useState<(typeof METODES)[number]>("efectiu");
  const [pending, startTransition] = useTransition();

  if (!obert) {
    return (
      <button
        type="button"
        onClick={() => setObert(true)}
        className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
      >
        {dict.factures.marcaPagada}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={metode}
        onChange={(e) => setMetode(e.target.value as (typeof METODES)[number])}
        disabled={pending}
        className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm text-zinc-950 outline-none focus:border-teal-600 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {METODES.map((m) => (
          <option key={m} value={m}>
            {dict.factures.metodes[m]}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => marcarPagada(facturaId, dict.factures.metodes[metode]))}
        className="rounded-full bg-teal-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-400"
      >
        {pending ? "..." : dict.comu.confirma}
      </button>
      <button
        type="button"
        onClick={() => setObert(false)}
        disabled={pending}
        className="text-sm text-zinc-500 hover:underline disabled:opacity-50 dark:text-zinc-400"
      >
        {dict.comu.cancela}
      </button>
    </div>
  );
}
