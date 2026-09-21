"use client";

import { useRef, useState } from "react";
import type { Canco } from "./biblioteca";
import { formatDurada } from "./format";
import { IconaAgafador, IconaNota, IconaPaperera, IconaReprodueix } from "./icones";

type Props = {
  cancons: Canco[];
  idActual: string | null;
  reproduint: boolean;
  /** Només es pot reordenar la llista sencera, no un resultat de cerca. */
  reordenable: boolean;
  onTria: (id: string) => void;
  onEsborra: (canco: Canco) => void;
  onReordena: (origen: number, desti: number) => void;
};

type Arrossegament = {
  index: number;
  desti: number;
  inici: number; // on tenia el dit o el cursor en començar
  dy: number;
  cims: number[];
  alcades: number[];
};

export function LlistaCancons({
  cancons,
  idActual,
  reproduint,
  reordenable,
  onTria,
  onEsborra,
  onReordena,
}: Props) {
  const llista = useRef<HTMLUListElement>(null);
  const [arros, setArros] = useState<Arrossegament | null>(null);

  // Es fa amb esdeveniments de punter i no amb l'arrossegament natiu del
  // navegador, que al mòbil no existeix: així el dit i el ratolí segueixen el
  // mateix camí. Les mides de les files es prenen un sol cop, en començar.
  const comenca = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    if (!reordenable) return;
    const files = Array.from(llista.current?.children ?? []) as HTMLElement[];
    const mides = files.map((fila) => fila.getBoundingClientRect());
    event.currentTarget.setPointerCapture(event.pointerId);
    setArros({
      index,
      desti: index,
      inici: event.clientY,
      dy: 0,
      cims: mides.map((mida) => mida.top),
      alcades: mides.map((mida) => mida.height),
    });
  };

  const mou = (event: React.PointerEvent<HTMLButtonElement>) => {
    setArros((actual) => {
      if (!actual) return actual;
      const dy = event.clientY - actual.inici;
      const centre = actual.cims[actual.index] + actual.alcades[actual.index] / 2 + dy;
      let desti = actual.cims.length - 1;
      for (let i = 0; i < actual.cims.length; i += 1) {
        if (centre < actual.cims[i] + actual.alcades[i] / 2) {
          desti = i;
          break;
        }
      }
      return { ...actual, dy, desti };
    });
  };

  const acaba = () => {
    if (!arros) return;
    if (arros.desti !== arros.index) onReordena(arros.index, arros.desti);
    setArros(null);
  };

  // Amb el teclat, un cop l'agafador té el focus: fletxa amunt o avall.
  const ambTeclat = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const amunt = event.key === "ArrowUp";
    const avall = event.key === "ArrowDown";
    if (!amunt && !avall) return;
    event.preventDefault();
    const desti = amunt ? index - 1 : index + 1;
    if (desti >= 0 && desti < cancons.length) onReordena(index, desti);
  };

  // Mentre una fila viatja, les que queden pel camí s'aparten per ensenyar on
  // caurà.
  const desplacament = (index: number) => {
    if (!arros) return 0;
    if (index === arros.index) return arros.dy;
    const alcada = arros.alcades[arros.index];
    if (arros.index < arros.desti && index > arros.index && index <= arros.desti) return -alcada;
    if (arros.desti < arros.index && index >= arros.desti && index < arros.index) return alcada;
    return 0;
  };

  return (
    <ul ref={llista} className="divide-y divide-white/10">
      {cancons.map((canco, index) => {
        const esActual = canco.id === idActual;
        const viatjant = arros?.index === index;
        return (
          <li
            key={canco.id}
            style={{
              transform: `translateY(${desplacament(index)}px)`,
              transition: viatjant ? "none" : "transform 150ms ease",
            }}
            className={`relative flex items-center gap-1 py-2 ${
              viatjant ? "z-10 rounded-xl bg-white/10 shadow-lg shadow-black/40" : ""
            }`}
          >
            {reordenable && (
              <button
                type="button"
                aria-label={`Mou ${canco.titol} de lloc`}
                title="Arrossega per canviar l'ordre"
                onPointerDown={(event) => comenca(event, index)}
                onPointerMove={mou}
                onPointerUp={acaba}
                onPointerCancel={acaba}
                onKeyDown={(event) => ambTeclat(event, index)}
                className={`shrink-0 touch-none rounded-lg p-1.5 text-zinc-500 transition-colors hover:text-zinc-200 ${
                  viatjant ? "cursor-grabbing text-zinc-300" : "cursor-grab"
                }`}
              >
                <IconaAgafador className="h-5 w-5" />
              </button>
            )}

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
