"use client";

import { useActionState, useState } from "react";
import type { RecursFormState } from "./actions";

type Textos = {
  escriuElimina: string;
  confirma: string;
  cancela: string;
};

export function DeleteRecursInline({
  action,
  onCancel,
  textos,
}: {
  action: (prevState: RecursFormState, formData: FormData) => Promise<RecursFormState>;
  onCancel?: () => void;
  textos: Textos;
}) {
  const [state, formAction, pending] = useActionState<RecursFormState, FormData>(action, {
    error: null,
  });
  const [confirmText, setConfirmText] = useState("");
  const confirmat = confirmText.trim().toUpperCase() === "ELIMINA";

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="confirmacio"
          autoComplete="off"
          placeholder={textos.escriuElimina}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-36 rounded-lg border border-red-300 bg-white px-2 py-1 text-sm text-zinc-950 outline-none focus:border-red-600 dark:border-red-900/50 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={!confirmat || pending}
          className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "..." : textos.confirma}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            {textos.cancela}
          </button>
        )}
      </div>
      {state.error && (
        <p className="max-w-64 text-right text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
