"use client";

import { useEffect, useMemo, useState } from "react";
import type { Canco, Llista } from "./biblioteca";
import { IconaCerca } from "./icones";

type Props = {
  llista: Llista;
  cancons: Canco[]; // tota la biblioteca
  onAlterna: (llistaId: string, cancoId: string) => void;
  onTanca: () => void;
};

/** Tria quines cançons de la biblioteca van a parar a aquesta llista. */
export function DialegAfegirCancons({ llista, cancons, onAlterna, onTanca }: Props) {
  const [cerca, setCerca] = useState("");

  useEffect(() => {
    const ambEscapada = (event: KeyboardEvent) => event.key === "Escape" && onTanca();
    window.addEventListener("keydown", ambEscapada);
    return () => window.removeEventListener("keydown", ambEscapada);
  }, [onTanca]);

  const visibles = useMemo(() => {
    const text = cerca.trim().toLowerCase();
    if (!text) return cancons;
    return cancons.filter((canco) =>
      `${canco.titol} ${canco.artista} ${canco.album}`.toLowerCase().includes(text),
    );
  }, [cancons, cerca]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Afegeix cançons a ${llista.nom}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={(event) => event.target === event.currentTarget && onTanca()}
    >
      <div className="flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl border border-white/10 bg-[#25282e] p-4 shadow-2xl shadow-black/60">
        <p className="text-xs uppercase tracking-wide text-teal-400">Afegeix a la llista</p>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-50">{llista.nom}</p>

        {cancons.length > 6 && (
          <div className="relative mt-3">
            <IconaCerca className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={cerca}
              onChange={(event) => setCerca(event.target.value)}
              placeholder="Cerca a la biblioteca"
              aria-label="Cerca a la biblioteca"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2 pl-11 pr-3 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-teal-400"
            />
          </div>
        )}

        <ul className="mt-3 flex-1 space-y-1 overflow-y-auto">
          {visibles.map((canco) => {
            const hiEs = llista.cancons.includes(canco.id);
            return (
              <li key={canco.id}>
                <button
                  type="button"
                  onClick={() => onAlterna(llista.id, canco.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      hiEs ? "border-teal-400 bg-teal-500 text-zinc-950" : "border-white/25"
                    }`}
                  >
                    {hiEs && (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                        <path
                          d="m5 13 4 4 10-10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-zinc-100">{canco.titol}</span>
                    <span className="block truncate text-xs text-zinc-500">{canco.artista}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {visibles.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-zinc-500">
              {cancons.length === 0
                ? "Primer has d'afegir cançons al dispositiu."
                : `Cap cançó coincideix amb «${cerca}».`}
            </li>
          )}
        </ul>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onTanca}
            className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:text-zinc-50"
          >
            Fet
          </button>
        </div>
      </div>
    </div>
  );
}
