"use client";

import { useTransition } from "react";
import { canviarIdioma } from "./idioma-actions";
import type { Idioma, Dict } from "@/lib/i18n";

export function SelectorIdioma({ actual, textos }: { actual: Idioma; textos: Dict["comu"]["idiomes"] }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={actual}
      disabled={pending}
      onChange={(e) => startTransition(() => canviarIdioma(e.target.value as Idioma))}
      aria-label="Idioma"
      className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <option value="ca">{textos.ca}</option>
      <option value="es">{textos.es}</option>
      <option value="en">{textos.en}</option>
    </select>
  );
}
