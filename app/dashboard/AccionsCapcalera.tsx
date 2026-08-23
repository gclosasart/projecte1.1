"use client";

import { useState } from "react";
import Link from "next/link";
import { SelectorIdioma } from "../SelectorIdioma";
import { signOut } from "./actions";
import type { Idioma, Dict } from "@/lib/i18n";

export type ItemAccio = { href: string; label: string };

// Pantalles amples: fila horitzontal (usar tal qual on abans es feia servir AccionsCapcalera).
export function AccionsCapcaleraDesktop({
  items,
  idioma,
  textosIdiomes,
  tancaSessio,
}: {
  items: ItemAccio[];
  idioma: Idioma;
  textosIdiomes: Dict["comu"]["idiomes"];
  tancaSessio: string;
}) {
  return (
    <div className="hidden shrink-0 items-center gap-3 sm:flex">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
        >
          {it.label}
        </Link>
      ))}
      <SelectorIdioma actual={idioma} textos={textosIdiomes} />
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          {tancaSessio}
        </button>
      </form>
    </div>
  );
}

// Mòbil: un sol botó compacte que ho desplega tot.
export function AccionsCapcaleraMobil({
  items,
  idioma,
  textosIdiomes,
  tancaSessio,
  menuLabel,
}: {
  items: ItemAccio[];
  idioma: Idioma;
  textosIdiomes: Dict["comu"]["idiomes"];
  tancaSessio: string;
  menuLabel: string;
}) {
  const [obert, setObert] = useState(false);

  return (
    <div className="shrink-0">
      <div className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setObert((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-400"
          aria-expanded={obert}
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
            <path
              d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.5c-3 0-6 1.5-6 4v.5h12v-.5c0-2.5-3-4-6-4Z"
              fill="currentColor"
            />
          </svg>
          {menuLabel}
        </button>

        {obert && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setObert(false)} />
            <div className="absolute right-0 top-full z-20 mt-2 flex w-60 flex-col gap-2 rounded-2xl border border-black/5 bg-white shadow-sm p-3 shadow-lg dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setObert(false)}
                  className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5"
                >
                  {it.label}
                </Link>
              ))}
              <SelectorIdioma actual={idioma} textos={textosIdiomes} />
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
                >
                  {tancaSessio}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
