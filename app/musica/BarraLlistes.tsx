"use client";

import { useEffect, useRef, useState } from "react";
import type { Llista } from "./biblioteca";
import { IconaFletxaAvall, IconaLlistes, IconaMes } from "./icones";

type Props = {
  llistes: Llista[];
  onObre: (id: string) => void;
  onCrea: (nom: string) => void;
};

/** Desplegable amb totes les llistes de reproducció, una sota l'altra. */
export function BarraLlistes({ llistes, onObre, onCrea }: Props) {
  const [obert, setObert] = useState(false);
  const [creant, setCreant] = useState(false);
  const [nom, setNom] = useState("");
  const camp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creant) camp.current?.focus();
  }, [creant]);

  const crea = () => {
    const net = nom.trim();
    if (net) onCrea(net);
    setNom("");
    setCreant(false);
    setObert(false);
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setObert((actual) => !actual)}
        aria-expanded={obert}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left transition-colors hover:border-white/25"
      >
        <IconaLlistes className="h-5 w-5 shrink-0 text-teal-400" />
        <span className="flex-1 text-sm font-semibold text-zinc-100">Llistes de reproducció</span>
        <span className="text-xs text-zinc-500">{llistes.length}</span>
        <IconaFletxaAvall
          className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform ${obert ? "rotate-180" : ""}`}
        />
      </button>

      {obert && (
        <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
          {llistes.length === 0 && !creant && (
            <p className="px-3 py-2 text-xs text-zinc-500">
              Encara no tens cap llista. Crea&apos;n una i podràs posar-hi les cançons que vulguis.
            </p>
          )}

          <ul>
            {llistes.map((llista) => (
              <li key={llista.id}>
                <button
                  type="button"
                  onClick={() => {
                    setObert(false);
                    onObre(llista.id);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100">
                    {llista.nom}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {llista.cancons.length} {llista.cancons.length === 1 ? "cançó" : "cançons"}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {creant ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                crea();
              }}
              className="mt-1 flex items-center gap-2 px-1 pb-1"
            >
              <input
                ref={camp}
                value={nom}
                onChange={(event) => setNom(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && setCreant(false)}
                maxLength={60}
                placeholder="Nom de la llista"
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
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-teal-300 transition-colors hover:bg-white/5"
            >
              <IconaMes className="h-5 w-5" />
              Nova llista
            </button>
          )}
        </div>
      )}
    </div>
  );
}
