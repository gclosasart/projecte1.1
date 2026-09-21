"use client";

import { useEffect, useRef, useState } from "react";
import type { Llista } from "./biblioteca";
import { IconaEnrere, IconaLlapis, IconaMes, IconaPaperera } from "./icones";

type Props = {
  llista: Llista;
  onTorna: () => void;
  onCanviaNom: (id: string, nom: string) => void;
  onEsborra: (llista: Llista) => void;
  onAfegeix: () => void;
};

/** Capçalera de la pantalla d'una llista: nom, i poc més. */
export function CapcaleraLlista({ llista, onTorna, onCanviaNom, onEsborra, onAfegeix }: Props) {
  const [editant, setEditant] = useState(false);
  const [nom, setNom] = useState(llista.nom);
  const camp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editant) camp.current?.focus();
  }, [editant]);

  const desa = () => {
    const net = nom.trim();
    if (net && net !== llista.nom) onCanviaNom(llista.id, net);
    setEditant(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTorna}
          aria-label="Torna a totes les cançons"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-teal-400 transition-colors hover:bg-white/10"
        >
          <IconaEnrere className="h-5 w-5" />
        </button>

        {editant ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              desa();
            }}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <input
              ref={camp}
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setNom(llista.nom);
                  setEditant(false);
                }
              }}
              maxLength={60}
              aria-label="Nom de la llista"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-lg font-bold text-zinc-50 outline-none transition-colors focus:border-teal-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400"
            >
              Desa
            </button>
          </form>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold tracking-tight text-zinc-50">{llista.nom}</h2>
              <p className="text-xs text-zinc-400">
                {llista.cancons.length} {llista.cancons.length === 1 ? "cançó" : "cançons"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNom(llista.nom);
                setEditant(true);
              }}
              aria-label="Canvia el nom de la llista"
              title="Canvia el nom"
              className="shrink-0 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-teal-300"
            >
              <IconaLlapis className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onEsborra(llista)}
              aria-label="Esborra la llista"
              title="Esborra la llista (les cançons es queden)"
              className="shrink-0 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/15 hover:text-red-300"
            >
              <IconaPaperera className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onAfegeix}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-teal-400"
      >
        <IconaMes className="h-5 w-5" />
        Afegeix cançons
      </button>
    </div>
  );
}
