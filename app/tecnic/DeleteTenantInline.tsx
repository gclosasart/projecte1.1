"use client";

import { useActionState, useState } from "react";
import type { Dict } from "@/lib/i18n";
import { eliminarTenant, type TecnicFormState } from "./actions";

const ESTAT_INICIAL: TecnicFormState = { error: null, success: false };

export function DeleteTenantInline({
  tenantId,
  textos: t,
}: {
  tenantId: string;
  textos: Dict["tecnic"];
}) {
  const [confirmant, setConfirmant] = useState(false);
  const action = eliminarTenant.bind(null, tenantId);
  const [state, formAction, pending] = useActionState<TecnicFormState, FormData>(
    action,
    ESTAT_INICIAL,
  );
  const [confirmText, setConfirmText] = useState("");
  const confirmat = confirmText.trim().toUpperCase() === "ELIMINA";

  if (!confirmant) {
    return (
      <button
        type="button"
        onClick={() => setConfirmant(true)}
        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
      >
        {t.elimina}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="confirmacio"
          autoComplete="off"
          placeholder={t.escriuElimina}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-36 rounded-lg border border-red-300 bg-white px-2 py-1 text-sm text-zinc-950 outline-none focus:border-red-600 dark:border-red-900/50 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={!confirmat || pending}
          className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "..." : t.confirma}
        </button>
        <button
          type="button"
          onClick={() => setConfirmant(false)}
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          {t.cancela}
        </button>
      </div>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
