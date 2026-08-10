"use client";

import { useActionState } from "react";
import type { Dict } from "@/lib/i18n";
import { crearTenant, type TecnicFormState } from "./actions";

const ESTAT_INICIAL: TecnicFormState = { error: null, success: false };

export function CreaTenantForm({ textos: t }: { textos: Dict["tecnic"] }) {
  const [state, formAction, pending] = useActionState<TecnicFormState, FormData>(
    crearTenant,
    ESTAT_INICIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nom_comercial" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.nomComercial}
        </label>
        <input
          id="nom_comercial"
          name="nom_comercial"
          type="text"
          required
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
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
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="nif" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t.nif}
          </label>
          <input
            id="nif"
            name="nif"
            type="text"
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="adreca_fiscal" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t.adrecaFiscal}
          </label>
          <input
            id="adreca_fiscal"
            name="adreca_fiscal"
            type="text"
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{t.tenantCreat}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
      >
        {pending ? t.creant : t.creaElTenant}
      </button>
    </form>
  );
}
