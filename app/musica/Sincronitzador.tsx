"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Canco, Lletra } from "./biblioteca";
import { formatDurada } from "./format";
import { IconaPausa, IconaReprodueix, IconaTanca } from "./icones";

type Props = {
  canco: Canco;
  lletra: Lletra;
  reproduint: boolean;
  posicio: number;
  onAlterna: () => void;
  onSalta: (segons: number) => void;
  onDesa: (temps: (number | null)[]) => void;
  onTanca: () => void;
};

// En sentir que entra una línia i prémer el botó s'hi va sempre una mica
// tard; es descompta aquest tros perquè la lletra no vagi enrere del so.
const REACCIO = 0.25;

/**
 * Marca el temps de cada línia: sona la cançó i es va tocant el botó a cada
 * línia que entra. És l'única manera de sincronitzar una lletra sense
 * dependre de cap servei de fora.
 */
export function Sincronitzador({
  canco,
  lletra,
  reproduint,
  posicio,
  onAlterna,
  onSalta,
  onDesa,
  onTanca,
}: Props) {
  const linies = useMemo(() => lletra.text.split("\n"), [lletra.text]);
  // Les línies buides separen estrofes: no es marquen, se salten soles.
  const marcables = useMemo(
    () => linies.map((linia, i) => (linia.trim() ? i : -1)).filter((i) => i >= 0),
    [linies],
  );

  const [marques, setMarques] = useState<(number | null)[]>(() =>
    linies.map((_, i) => (lletra.temps && lletra.temps.length === linies.length ? lletra.temps[i] : null)),
  );
  const [fetes, setFetes] = useState(0); // quantes línies marcables ja tenen temps
  const contenidor = useRef<HTMLDivElement>(null);
  const referencies = useRef<(HTMLParagraphElement | null)[]>([]);

  const indexActual = fetes < marcables.length ? marcables[fetes] : -1;
  const acabat = fetes >= marcables.length;

  const marca = () => {
    if (acabat) return;
    setMarques((previes) => {
      const seguents = [...previes];
      seguents[indexActual] = Math.max(0, posicio - REACCIO);
      return seguents;
    });
    setFetes((fet) => fet + 1);
  };

  const desfes = () => {
    if (!fetes) return;
    const anterior = marcables[fetes - 1];
    setMarques((previes) => {
      const seguents = [...previes];
      seguents[anterior] = null;
      return seguents;
    });
    setFetes((fet) => fet - 1);
    // Torna on començava la línia anterior per poder-ho tornar a provar.
    const abans = fetes >= 2 ? marques[marcables[fetes - 2]] : 0;
    onSalta(typeof abans === "number" ? abans : 0);
  };

  // La línia que toca marcar, sempre centrada.
  useEffect(() => {
    const caixa = contenidor.current;
    const linia = referencies.current[indexActual];
    if (!caixa || !linia) return;
    caixa.scrollTo({
      top: linia.offsetTop - caixa.clientHeight / 2 + linia.offsetHeight / 2,
      behavior: "smooth",
    });
  }, [indexActual]);

  // La barra espaiadora marca, com a qualsevol programa d'aquests.
  useEffect(() => {
    const ambTecla = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      marca();
    };
    window.addEventListener("keydown", ambTecla);
    return () => window.removeEventListener("keydown", ambTecla);
  });

  return (
    <div className="bg-estudi fixed inset-0 z-50 flex flex-col">
      <header className="flex items-center gap-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onTanca}
          aria-label="Deixa la sincronització"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-teal-400 transition-colors hover:bg-white/10"
        >
          <IconaTanca className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-xs uppercase tracking-wide text-teal-400">Sincronitza</p>
          <p className="truncate text-sm font-semibold text-zinc-50">{canco.titol}</p>
        </div>
        <span className="w-10 shrink-0 text-right font-mono text-xs text-zinc-400">
          {fetes}/{marcables.length}
        </span>
      </header>

      <div ref={contenidor} className="relative mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6">
        {linies.map((linia, i) => {
          const esActual = i === indexActual;
          const marcada = typeof marques[i] === "number";
          return (
            <p
              key={`${i}-${linia}`}
              ref={(element) => {
                referencies.current[i] = element;
              }}
              className={`py-1.5 text-center leading-relaxed transition-colors ${
                esActual
                  ? "text-xl font-bold text-teal-300"
                  : marcada
                    ? "text-base text-zinc-500"
                    : "text-base text-zinc-400"
              }`}
            >
              {linia || " "}
              {marcada && (
                <span className="ml-2 font-mono text-xs text-zinc-600">
                  {formatDurada(marques[i] as number)}
                </span>
              )}
            </p>
          );
        })}
      </div>

      <footer className="border-t border-white/10 bg-[#1c1f23]/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-center text-xs text-zinc-500">
            {acabat
              ? "Ja hi són totes. Desa-ho i la lletra anirà sola."
              : "Toca «Marca» just quan entri la línia de dalt."}
          </p>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAlterna}
              aria-label={reproduint ? "Pausa" : "Reprodueix"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-100 transition-colors hover:bg-white/10"
            >
              {reproduint ? <IconaPausa className="h-6 w-6" /> : <IconaReprodueix className="h-6 w-6" />}
            </button>

            <button
              type="button"
              onClick={marca}
              disabled={acabat}
              className="h-14 flex-1 rounded-full bg-teal-500 text-base font-bold text-zinc-950 transition-colors hover:bg-teal-400 disabled:opacity-30"
            >
              Marca
            </button>

            <button
              type="button"
              onClick={desfes}
              disabled={!fetes}
              className="h-12 shrink-0 rounded-full border border-white/15 px-4 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              Desfés
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-500">{formatDurada(posicio)}</span>
            <button
              type="button"
              onClick={() => onDesa(marques)}
              disabled={!fetes}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/20 disabled:opacity-30"
            >
              {acabat ? "Desa" : "Desa el que hi ha"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
