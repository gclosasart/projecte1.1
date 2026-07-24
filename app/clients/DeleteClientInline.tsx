"use client";

import { useActionState, useState } from "react";
import type { ClientFormState } from "./actions";

export function DeleteClientInline({
  action,
  onCancel,
}: {
  action: (prevState: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(action, {
    error: null,
  });
  const [confirmText, setConfirmText] = useState("");
  const confirmat = confirmText.trim().toUpperCase() === "ELIMINA";

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="confirmacio"
          autoComplete="off"
          placeholder='Escriu "ELIMINA"'
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-36 rounded-lg border border-red-300 bg-white px-2 py-1 text-sm text-zinc-950 outline-none focus:border-red-600 dark:border-red-900/50 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={!confirmat || pending}
          className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "..." : "Confirma"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Cancel·la
          </button>
        )}
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
