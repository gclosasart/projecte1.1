"use client";

import { useActionState } from "react";
import type { ClientFormState } from "./actions";

type ValorsClient = {
  nom: string;
  nif: string | null;
  email: string | null;
  adreca: string | null;
};

type Textos = {
  nom: string;
  nif: string;
  email: string;
  adreca: string;
  desant: string;
};

export function ClientForm({
  action,
  valorsInicials,
  textBoto,
  textos,
}: {
  action: (prevState: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  valorsInicials?: ValorsClient;
  textBoto: string;
  textos: Textos;
}) {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(action, {
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
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nif" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {textos.nif}
        </label>
        <input
          id="nif"
          name="nif"
          type="text"
          defaultValue={valorsInicials?.nif ?? undefined}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {textos.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={valorsInicials?.email ?? undefined}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="adreca" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {textos.adreca}
        </label>
        <input
          id="adreca"
          name="adreca"
          type="text"
          defaultValue={valorsInicials?.adreca ?? undefined}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
        />
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
