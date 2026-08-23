"use client";

import { useState, useTransition } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { generarEsborranys } from "./actions";

export function GeneraEsborranysButton({ idioma }: { idioma: Idioma }) {
  const t = dictDe(idioma).tecnicFactures;
  const [pending, startTransition] = useTransition();
  const [missatge, setMissatge] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await generarEsborranys();
            setMissatge(res.error ?? t.esborranysGenerats);
          })
        }
        className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-400"
      >
        {pending ? t.generant : t.generaEsborranys}
      </button>
      {missatge && <p className="text-sm text-zinc-500 dark:text-zinc-400">{missatge}</p>}
    </div>
  );
}
