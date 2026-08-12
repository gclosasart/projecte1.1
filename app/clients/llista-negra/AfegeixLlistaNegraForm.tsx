"use client";

import { useActionState } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { afegirALlistaNegra, type LlistaNegraState } from "./actions";

const ESTAT_INICIAL: LlistaNegraState = { error: null };

export function AfegeixLlistaNegraForm({ idioma }: { idioma: Idioma }) {
  const t = dictDe(idioma).llistaNegra;
  const [state, formAction, pending] = useActionState<LlistaNegraState, FormData>(
    afegirALlistaNegra,
    ESTAT_INICIAL,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <input
        type="text"
        name="nif"
        placeholder={t.nifPlaceholder}
        required
        className="w-36 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <input
        type="text"
        name="nom"
        placeholder={t.nomPlaceholder}
        className="w-40 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <input
        type="text"
        name="motiu"
        placeholder={t.motiuPlaceholder}
        className="w-48 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {pending ? t.afegint : t.afegeix}
      </button>
      {state.error && <p className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
