"use client";

import { useActionState } from "react";
import type { Dict } from "@/lib/i18n";
import { actualitzarTenant, type TenantFormState } from "./actions";

type ValorsTenant = {
  nom_comercial: string;
  rao_social: string | null;
  nif: string | null;
  adreca_fiscal: string | null;
};

const ESTAT_INICIAL: TenantFormState = { error: null, success: false };

export function TenantForm({
  valorsInicials,
  textos: t,
}: {
  valorsInicials: ValorsTenant;
  textos: Dict["configuracio"];
}) {
  const [state, formAction, pending] = useActionState<TenantFormState, FormData>(
    actualitzarTenant,
    ESTAT_INICIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nom_comercial"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {t.nomComercial}
        </label>
        <input
          id="nom_comercial"
          name="nom_comercial"
          type="text"
          required
          defaultValue={valorsInicials.nom_comercial}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
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
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
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
          placeholder={t.nifPlaceholder}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
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
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{t.dadesDesades}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
      >
        {pending ? t.desant : t.desaCanvis}
      </button>
    </form>
  );
}
