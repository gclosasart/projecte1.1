"use client";

import { useEffect, useRef, useState } from "react";
import type { Canco, Llista } from "./biblioteca";
import { IconaMes } from "./icones";

type Props = {
  canco: Canco;
  llistes: Llista[];
  onAlterna: (llistaId: string, cancoId: string) => void;
  onCrea: (nom: string, cancoId: string) => void;
  onTanca: () => void;
};

/** Finestreta per triar a quines llistes va una cançó. */
export function DialegLlistes({ canco, llistes, onAlterna, onCrea, onTanca }: Props) {
  const [nom, setNom] = useState("");
  const [creant, setCreant] = useState(llistes.length === 0);
  const camp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creant) camp.current?.focus();
  }, [creant]);

  useEffect(() => {
    const ambEscapada = (event: KeyboardEvent) => event.key === "Escape" && onTanca();
    window.addEventListener("keydown", ambEscapada);
    return () => window.removeEventListener("keydown", ambEscapada);
  }, [onTanca]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Llistes de ${canco.titol}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={(event) => event.target === event.currentTarget && onTanca()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#25282e] p-4 shadow-2xl shadow-black/60">
        <p className="text-xs uppercase tracking-wide text-teal-400">Afegeix a una llista</p>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-50">{canco.titol}</p>

        <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {llistes.map((llista) => {
            const hiEs = llista.cancons.includes(canco.id);
            return (
              <li key={llista.id}>
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
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-100">{llista.nom}</span>
                  <span className="shrink-0 text-xs text-zinc-500">{llista.cancons.length}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {creant ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const net = nom.trim();
              if (net) onCrea(net, canco.id);
              setNom("");
              setCreant(false);
            }}
            className="mt-3 flex items-center gap-2"
          >
            <input
              ref={camp}
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              maxLength={60}
              placeholder="Nom de la llista nova"
              aria-label="Nom de la llista nova"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-teal-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400"
            >
              Crea
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreant(true)}
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-dashed border-white/20 px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:border-teal-400 hover:text-teal-300"
          >
            <IconaMes className="h-4 w-4" />
            Nova llista
          </button>
        )}

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
