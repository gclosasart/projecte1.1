"use client";

import { useActionState } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { actualitzarPlataforma, type PlataformaFormState } from "./actions";

type ValorsPlataforma = {
  nom_comercial: string;
  rao_social: string | null;
  nif: string | null;
  adreca_fiscal: string | null;
  iva_percent: number;
};

const ESTAT_INICIAL: PlataformaFormState = { error: null, success: false };

export function PlataformaForm({
  valorsInicials,
  idioma,
}: {
  valorsInicials: ValorsPlataforma;
  idioma: Idioma;
}) {
  const t = dictDe(idioma).plataforma;
  const [state, formAction, pending] = useActionState<PlataformaFormState, FormData>(
    actualitzarPlataforma,
    ESTAT_INICIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nom_comercial"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {t.nom}
        </label>
        <input
          id="nom_comercial"
          name="nom_comercial"
          type="text"
          required
          defaultValue={valorsInicials.nom_comercial}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="rao_social" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.raoSocial}
        </label>
        <input
          id="rao_social"
          name="rao_social"
          type="text"
          defaultValue={valorsInicials.rao_social ?? undefined}
          placeholder={t.raoSocialPlaceholder}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nif" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.nif}
        </label>
        <input
          id="nif"
          name="nif"
          type="text"
          defaultValue={valorsInicials.nif ?? undefined}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="adreca_fiscal"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {t.adrecaFiscal}
        </label>
        <input
          id="adreca_fiscal"
          name="adreca_fiscal"
          type="text"
          defaultValue={valorsInicials.adreca_fiscal ?? undefined}
          placeholder={t.adrecaFiscalPlaceholder}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="iva_percent" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.ivaPercent}
        </label>
        <input
          id="iva_percent"
          name="iva_percent"
          type="number"
          min={0}
          step="0.01"
          defaultValue={valorsInicials.iva_percent}
          className="w-32 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{t.dadesDesades}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
      >
        {pending ? t.desant : t.desaCanvis}
      </button>
    </form>
  );
}
