"use client";

import { useTransition } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { canviarNoShow } from "./actions";

export function NoShowButton({
  ocurrenciaId,
  reservaId,
  noShow,
  idioma,
}: {
  ocurrenciaId: string;
  reservaId: string;
  noShow: boolean;
  idioma: Idioma;
}) {
  const [pending, startTransition] = useTransition();
  const t = dictDe(idioma).reservaGestio.detall;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => canviarNoShow(ocurrenciaId, reservaId, !noShow))}
      className="text-sm font-medium text-zinc-500 hover:underline disabled:opacity-50 dark:text-zinc-400"
    >
      {noShow ? t.desmarcaNoShow : t.marcaNoShow}
    </button>
  );
}
