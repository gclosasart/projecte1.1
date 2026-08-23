"use client";

import { useActionState, useState } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { actualitzarRecursosReserva, type ModificarRecursosState } from "./actions";

const ESTAT_INICIAL: ModificarRecursosState = { error: null, conflictes: null, exit: false };

export function EditaRecursosReserva({
  reservaId,
  recursosDisponibles,
  recursIdsActuals,
  idioma,
}: {
  reservaId: string;
  recursosDisponibles: { id: string; nom: string }[];
  recursIdsActuals: string[];
  idioma: Idioma;
}) {
  const textos = dictDe(idioma).reservaGestio.detall;
  const actualitzarAmbId = actualitzarRecursosReserva.bind(null, reservaId);
  const [state, formAction, pending] = useActionState<ModificarRecursosState, FormData>(
    actualitzarAmbId,
    ESTAT_INICIAL,
  );

  const [recursIds, setRecursIds] = useState<string[]>(recursIdsActuals);

  function toggleRecurs(id: string) {
    setRecursIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {recursosDisponibles.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{textos.capRecursDonatAlta}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {recursosDisponibles.map((r) => (
            <label
              key={r.id}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm ${recursIds.includes(r.id) ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-white" : "bg-rose-100 text-rose-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
            >
              <input
                type="checkbox"
                name="recurs_ids"
                value={r.id}
                checked={recursIds.includes(r.id)}
                onChange={() => toggleRecurs(r.id)}
                className="sr-only"
              />
              {r.nom}
            </label>
          ))}
        </div>
      )}

      {state.conflictes && state.conflictes.length > 0 && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {textos.noEsPotFerCanvi(state.conflictes.join(", "))}
        </p>
      )}
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.exit && !pending && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{textos.recursosActualitzats}</p>
      )}

      <button
        type="submit"
        disabled={pending || recursosDisponibles.length === 0}
        className="self-start rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
      >
        {pending ? textos.actualitzant : textos.actualitzaRecursos}
      </button>
    </form>
  );
}
