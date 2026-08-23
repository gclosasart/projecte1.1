"use client";

import { useState, useTransition } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { anularFacturaPlataforma, confirmarFactura, marcarPagadaPlataforma } from "./actions";

const METODES = ["efectiu", "targeta", "transferencia", "altres"] as const;

export function AccionsFacturaPlataforma({
  id,
  estat,
  idioma,
}: {
  id: string;
  estat: string;
  idioma: Idioma;
}) {
  const dict = dictDe(idioma);
  const t = dict.tecnicFactures;
  const metodesTextos = dict.factures.metodes;
  const [pending, startTransition] = useTransition();
  const [obertMetode, setObertMetode] = useState(false);
  const [metode, setMetode] = useState<(typeof METODES)[number]>("efectiu");
  const [error, setError] = useState<string | null>(null);

  if (estat === "esborrany") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await confirmarFactura(id);
            setError(res.error);
          })
        }
        className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {pending ? t.confirmant : t.confirmaEmissio}
        {error && <span className="ml-2 text-red-200">{error}</span>}
      </button>
    );
  }

  if (estat === "pendent") {
    if (obertMetode) {
      return (
        <div className="flex items-center gap-2">
          <select
            value={metode}
            onChange={(e) => setMetode(e.target.value as (typeof METODES)[number])}
            disabled={pending}
            className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {METODES.map((m) => (
              <option key={m} value={m}>
                {metodesTextos[m]}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await marcarPagadaPlataforma(id, metodesTextos[metode]);
                setError(res.error);
                if (!res.error) setObertMetode(false);
              })
            }
            className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {pending ? "..." : t.confirma}
          </button>
          <button
            type="button"
            onClick={() => setObertMetode(false)}
            disabled={pending}
            className="text-sm text-zinc-500 hover:underline disabled:opacity-50 dark:text-zinc-400"
          >
            {t.cancela}
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setObertMetode(true)}
          className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          {t.marcaPagada}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await anularFacturaPlataforma(id);
              setError(res.error);
            })
          }
          className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
        >
          {t.anula}
        </button>
        {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
      </div>
    );
  }

  if (estat === "pagada") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await anularFacturaPlataforma(id);
            setError(res.error);
          })
        }
        className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
      >
        {pending ? "..." : t.anula}
        {error && <span className="ml-2 text-red-600 dark:text-red-400">{error}</span>}
      </button>
    );
  }

  return null;
}
