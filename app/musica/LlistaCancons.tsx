"use client";

import type { Canco } from "./biblioteca";
import { formatDurada } from "./format";
import { IconaNota, IconaPaperera, IconaReprodueix } from "./icones";

type Props = {
  cancons: Canco[];
  idActual: string | null;
  reproduint: boolean;
  onTria: (id: string) => void;
  onEsborra: (canco: Canco) => void;
};

export function LlistaCancons({ cancons, idActual, reproduint, onTria, onEsborra }: Props) {
  return (
    <ul className="divide-y divide-white/10">
      {cancons.map((canco) => {
        const esActual = canco.id === idActual;
        return (
          <li key={canco.id} className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => onTria(canco.id)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/5"
              aria-label={`Reprodueix ${canco.titol}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  esActual ? "bg-teal-500 text-zinc-950" : "bg-white/10 text-zinc-400"
                }`}
              >
                {esActual && reproduint ? (
                  <BarresSonant />
                ) : esActual ? (
                  <IconaReprodueix className="h-4 w-4" />
                ) : (
                  <IconaNota className="h-5 w-5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm font-semibold ${
                    esActual ? "text-teal-300" : "text-zinc-100"
                  }`}
                >
                  {canco.titol}
                </span>
                <span className="block truncate text-xs text-zinc-400">
                  {canco.artista}
                  {canco.album ? ` · ${canco.album}` : ""}
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs text-zinc-500">
                {canco.durada ? formatDurada(canco.durada) : "--:--"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onEsborra(canco)}
              aria-label={`Treu ${canco.titol} de la biblioteca`}
              title="Treu-la de la biblioteca"
              className="shrink-0 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/15 hover:text-red-300"
            >
              <IconaPaperera className="h-5 w-5" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Tres barretes que pugen i baixen mentre sona la cançó. */
function BarresSonant() {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden>
      {[0, 150, 300].map((retard) => (
        <span
          key={retard}
          className="w-1 origin-bottom animate-[sonant_900ms_ease-in-out_infinite] rounded-full bg-zinc-950"
          style={{ animationDelay: `${retard}ms`, height: "100%" }}
        />
      ))}
    </span>
  );
}
