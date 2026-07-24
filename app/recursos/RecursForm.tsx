"use client";

import { useActionState } from "react";
import type { RecursFormState } from "./actions";

type ValorsRecurs = {
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: string;
};

export function RecursForm({
  action,
  valorsInicials,
  textBoto,
}: {
  action: (prevState: RecursFormState, formData: FormData) => Promise<RecursFormState>;
  valorsInicials?: ValorsRecurs;
  textBoto: string;
}) {
  const [state, formAction, pending] = useActionState<RecursFormState, FormData>(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nom" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          defaultValue={valorsInicials?.nom}
          placeholder="Sala Blava"
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="capacitat" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Capacitat (persones)
        </label>
        <input
          id="capacitat"
          name="capacitat"
          type="number"
          min={0}
          step={1}
          defaultValue={valorsInicials?.capacitat ?? undefined}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="preu" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Preu
          </label>
          <input
            id="preu"
            name="preu"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={valorsInicials?.preu}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="unitat_preu" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Unitat
          </label>
          <select
            id="unitat_preu"
            name="unitat_preu"
            defaultValue={valorsInicials?.unitat_preu ?? "hora"}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500"
          >
            <option value="hora">€/hora</option>
            <option value="dia">€/dia</option>
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
      >
        {pending ? "Desant..." : textBoto}
      </button>
    </form>
  );
}
