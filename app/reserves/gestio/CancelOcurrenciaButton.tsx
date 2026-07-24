"use client";

import { useState, useTransition } from "react";
import { cancelarOcurrencia, type CancelState } from "./actions";

export function CancelOcurrenciaButton({
  ocurrenciaId,
  reservaId,
  esRecurrent,
}: {
  ocurrenciaId: string;
  reservaId: string;
  esRecurrent: boolean;
}) {
  const [mode, setMode] = useState<"idle" | "triant">("idle");
  const [resultat, setResultat] = useState<CancelState | null>(null);
  const [pending, startTransition] = useTransition();

  function cancelar(abast: "nomes_aquesta" | "aquesta_i_futures") {
    startTransition(async () => {
      const res = await cancelarOcurrencia(ocurrenciaId, abast, reservaId);
      setResultat(res);
      setMode("idle");
    });
  }

  if (resultat && !resultat.error) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm text-emerald-700 dark:text-emerald-400">Cancel·lada.</span>
        {resultat.avisos && (
          <div className="max-w-64 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
            {resultat.avisos.map((a, i) => (
              <p key={i}>{a}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {mode === "idle" ? (
        esRecurrent ? (
          <button
            type="button"
            onClick={() => setMode("triant")}
            disabled={pending}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-40 dark:text-red-400"
          >
            Cancel·la
          </button>
        ) : (
          <button
            type="button"
            onClick={() => cancelar("nomes_aquesta")}
            disabled={pending}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-40 dark:text-red-400"
          >
            {pending ? "Cancel·lant..." : "Cancel·la"}
          </button>
        )
      ) : (
        <div className="flex flex-col items-end gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-xs text-red-700 dark:text-red-400">Segur que vols cancel·lar?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cancelar("nomes_aquesta")}
              disabled={pending}
              className="text-xs font-medium text-red-700 hover:underline disabled:opacity-40 dark:text-red-400"
            >
              Només aquesta
            </button>
            <button
              type="button"
              onClick={() => cancelar("aquesta_i_futures")}
              disabled={pending}
              className="text-xs font-medium text-red-700 hover:underline disabled:opacity-40 dark:text-red-400"
            >
              Aquesta i futures
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
            >
              Enrere
            </button>
          </div>
        </div>
      )}

      {resultat?.error && <p className="text-xs text-red-600 dark:text-red-400">{resultat.error}</p>}
    </div>
  );
}
