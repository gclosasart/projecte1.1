"use client";

import type { Canco } from "./biblioteca";
import { formatDurada } from "./format";
import type { Repeticio } from "./tipus";
import {
  IconaAnterior,
  IconaBarreja,
  IconaNota,
  IconaPausa,
  IconaReprodueix,
  IconaRepeticio,
  IconaSeguent,
  IconaVolum,
} from "./icones";

type Props = {
  canco: Canco | null;
  caratulaUrl: string | null;
  reproduint: boolean;
  posicio: number;
  durada: number;
  volum: number;
  barreja: boolean;
  repeticio: Repeticio;
  onAlterna: () => void;
  onAnterior: () => void;
  onSeguent: () => void;
  onSalta: (segons: number) => void;
  onVolum: (valor: number) => void;
  onBarreja: () => void;
  onRepeticio: () => void;
};

const TEXT_REPETICIO: Record<Repeticio, string> = {
  cap: "Repetició desactivada",
  tot: "Repeteix tota la llista",
  una: "Repeteix aquesta cançó",
};

export function BarraReproduccio({
  canco,
  caratulaUrl,
  reproduint,
  posicio,
  durada,
  volum,
  barreja,
  repeticio,
  onAlterna,
  onAnterior,
  onSeguent,
  onSalta,
  onVolum,
  onBarreja,
  onRepeticio,
}: Props) {
  const total = durada || canco?.durada || 0;

  return (
    <div className="sticky bottom-0 z-10 border-t border-black/5 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-zinc-950/95">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600">
            {caratulaUrl ? (
              // Blob local del dispositiu: next/image no el pot optimitzar.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={caratulaUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <IconaNota className="h-6 w-6" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {canco ? canco.titol : "Cap cançó seleccionada"}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {canco ? canco.artista : "Tria'n una de la biblioteca"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onAnterior}
              disabled={!canco}
              aria-label="Cançó anterior"
              className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <IconaAnterior className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={onAlterna}
              disabled={!canco}
              aria-label={reproduint ? "Pausa" : "Reprodueix"}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-30"
            >
              {reproduint ? <IconaPausa className="h-6 w-6" /> : <IconaReprodueix className="h-6 w-6" />}
            </button>
            <button
              type="button"
              onClick={onSeguent}
              disabled={!canco}
              aria-label="Cançó següent"
              className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <IconaSeguent className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-12 shrink-0 text-right font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {formatDurada(posicio)}
          </span>
          <input
            type="range"
            min={0}
            max={total || 1}
            step={1}
            value={Math.min(posicio, total || 1)}
            disabled={!canco || !total}
            onChange={(event) => onSalta(Number(event.target.value))}
            aria-label="Posició de la cançó"
            className="h-1.5 w-full cursor-pointer accent-teal-600 disabled:cursor-default"
          />
          <span className="w-12 shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {total ? formatDurada(total) : "--:--"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onBarreja}
              aria-pressed={barreja}
              title={barreja ? "Ordre aleatori activat" : "Ordre aleatori desactivat"}
              className={`rounded-lg p-2 transition-colors ${
                barreja
                  ? "bg-teal-50 text-teal-700 dark:bg-zinc-900 dark:text-teal-400"
                  : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <IconaBarreja className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onRepeticio}
              title={TEXT_REPETICIO[repeticio]}
              aria-label={TEXT_REPETICIO[repeticio]}
              className={`rounded-lg p-2 transition-colors ${
                repeticio === "cap"
                  ? "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  : "bg-teal-50 text-teal-700 dark:bg-zinc-900 dark:text-teal-400"
              }`}
            >
              <IconaRepeticio className="h-5 w-5" una={repeticio === "una"} />
            </button>
          </div>

          {/* Al mòbil el volum el manen els botons físics del dispositiu. */}
          <div className="hidden items-center gap-2 sm:flex">
            <IconaVolum className="h-5 w-5 text-zinc-400" silenci={volum === 0} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volum}
              onChange={(event) => onVolum(Number(event.target.value))}
              aria-label="Volum"
              className="h-1.5 w-28 cursor-pointer accent-teal-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
