"use client";

import { useActionState } from "react";
import type { RecursFormState } from "./actions";

type ValorsRecurs = {
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: string;
  quantitat: number;
};

type Textos = {
  nom: string;
  nomPlaceholder: string;
  capacitatPersones: string;
  unitatsDisponiblesLabel: string;
  preu: string;
  unitat: string;
  perHora: string;
  perDia: string;
  desant: string;
};

export function RecursForm({
  action,
  valorsInicials,
  textBoto,
  textos,
}: {
  action: (prevState: RecursFormState, formData: FormData) => Promise<RecursFormState>;
  valorsInicials?: ValorsRecurs;
  textBoto: string;
  textos: Textos;
}) {
  const [state, formAction, pending] = useActionState<RecursFormState, FormData>(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nom" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {textos.nom}
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          defaultValue={valorsInicials?.nom}
          placeholder={textos.nomPlaceholder}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="capacitat" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {textos.capacitatPersones}
          </label>
          <input
            id="capacitat"
            name="capacitat"
            type="number"
            min={0}
            step={1}
            defaultValue={valorsInicials?.capacitat ?? undefined}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="quantitat" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {textos.unitatsDisponiblesLabel}
          </label>
          <input
            id="quantitat"
            name="quantitat"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={valorsInicials?.quantitat ?? 1}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="preu" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {textos.preu}
          </label>
          <input
            id="preu"
            name="preu"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={valorsInicials?.preu}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="unitat_preu" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {textos.unitat}
          </label>
          <select
            id="unitat_preu"
            name="unitat_preu"
            defaultValue={valorsInicials?.unitat_preu ?? "hora"}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
          >
            <option value="hora">{textos.perHora}</option>
            <option value="dia">{textos.perDia}</option>
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
      >
        {pending ? textos.desant : textBoto}
      </button>
    </form>
  );
}
