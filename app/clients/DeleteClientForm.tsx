"use client";

import { DeleteClientInline } from "./DeleteClientInline";
import type { ClientFormState } from "./actions";

export function DeleteClientForm({
  action,
}: {
  action: (prevState: ClientFormState, formData: FormData) => Promise<ClientFormState>;
}) {
  return (
    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
      <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Zona perillosa</h2>
      <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">
        Aquesta acció elimina el client permanentment i no es pot desfer.
      </p>
      <div className="mt-4">
        <DeleteClientInline action={action} />
      </div>
    </div>
  );
}
