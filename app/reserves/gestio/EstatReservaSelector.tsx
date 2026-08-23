"use client";

import { useTransition } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { canviarEstatReserva } from "./actions";

const ESTATS = ["activa", "cancel·lada"] as const;

export function EstatReservaSelector({
  reservaId,
  estatActual,
  idioma,
}: {
  reservaId: string;
  estatActual: string;
  idioma: Idioma;
}) {
  const [pending, startTransition] = useTransition();
  const dict = dictDe(idioma);

  function canviar(nouEstat: (typeof ESTATS)[number]) {
    startTransition(() => canviarEstatReserva(reservaId, nouEstat));
  }

  return (
    <select
      value={estatActual}
      disabled={pending}
      onChange={(e) => canviar(e.target.value as (typeof ESTATS)[number])}
      className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-xs text-zinc-950 outline-none focus:border-teal-600 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
    >
      {ESTATS.map((estat) => (
        <option key={estat} value={estat}>
          {dict.comu.estats[estat] ?? estat}
        </option>
      ))}
    </select>
  );
}
