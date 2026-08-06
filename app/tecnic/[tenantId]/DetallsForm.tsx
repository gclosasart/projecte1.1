"use client";

import { useActionState } from "react";
import { actualitzarDetallsTenant, type DetallTenantState } from "./actions";

const ESTAT_INICIAL: DetallTenantState = { error: null, success: false };

export function DetallsForm({
  tenantId,
  especificacionsInicials,
  quotaInicial,
}: {
  tenantId: string;
  especificacionsInicials: string | null;
  quotaInicial: number | null;
}) {
  const action = actualitzarDetallsTenant.bind(null, tenantId);
  const [state, formAction, pending] = useActionState<DetallTenantState, FormData>(
    action,
    ESTAT_INICIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="especificacions" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Especificacions
        </label>
        <textarea
          id="especificacions"
          name="especificacions"
          rows={4}
          defaultValue={especificacionsInicials ?? undefined}
          placeholder="Configuració particular, acords, coses a tenir en compte..."
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="quota_mensual" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Quota mensual (€)
        </label>
        <input
          id="quota_mensual"
          name="quota_mensual"
          type="number"
          min={0}
          step="0.01"
          defaultValue={quotaInicial ?? undefined}
          className="w-40 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Desat.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
      >
        {pending ? "Desant..." : "Desa els canvis"}
      </button>
    </form>
  );
}
