"use client";

import { useEffect, useState } from "react";
import type { Canco } from "./biblioteca";
import { formatDurada } from "./format";
import {
  IconaAnterior,
  IconaLletra,
  IconaPausa,
  IconaReprodueix,
  IconaSeguent,
  IconaTanca,
} from "./icones";

type Props = {
  canco: Canco;
  lletra: string;
  reproduint: boolean;
  posicio: number;
  durada: number;
  onAlterna: () => void;
  onAnterior: () => void;
  onSeguent: () => void;
  onSalta: (segons: number) => void;
  onEdita: () => void;
  onTanca: () => void;
};

const MIDES = ["text-xl", "text-2xl", "text-3xl"];
const CLAU_MIDA = "musica:karaoke-mida";

/** Pantalla de karaoke: la lletra, gran, i prou controls per no haver de sortir. */
export function Karaoke({
  canco,
  lletra,
  reproduint,
  posicio,
  durada,
  onAlterna,
  onAnterior,
  onSeguent,
  onSalta,
  onEdita,
  onTanca,
}: Props) {
  const [mida, setMida] = useState(() => llegeixMida());

  useEffect(() => {
    const ambEscapada = (event: KeyboardEvent) => event.key === "Escape" && onTanca();
    window.addEventListener("keydown", ambEscapada);
    return () => window.removeEventListener("keydown", ambEscapada);
  }, [onTanca]);

  // Mentre es canta, la pantalla no s'ha d'apagar. El permís es perd quan el
  // mòbil s'amaga o es bloqueja, així que es torna a demanar en tornar.
  useEffect(() => {
    let sentinella: WakeLockSentinel | null = null;
    let viu = true;

    const demana = async () => {
      if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
      try {
        const nova = await navigator.wakeLock.request("screen");
        if (viu) sentinella = nova;
        else void nova.release();
      } catch {
        // Hi ha navegadors que no ho deixen fer; el karaoke va igual.
      }
    };

    void demana();
    document.addEventListener("visibilitychange", demana);
    return () => {
      viu = false;
      document.removeEventListener("visibilitychange", demana);
      void sentinella?.release().catch(() => {});
    };
  }, []);

  const total = durada || canco.durada || 0;

  return (
    <div className="bg-estudi fixed inset-0 z-50 flex flex-col">
      <header className="flex items-center gap-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onTanca}
          aria-label="Tanca el karaoke"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-teal-400 transition-colors hover:bg-white/10"
        >
          <IconaTanca className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold text-zinc-50">{canco.titol}</p>
          <p className="truncate text-xs text-zinc-400">{canco.artista}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setMida((actual) => desaMida(Math.max(0, actual - 1)))}
            disabled={mida === 0}
            aria-label="Lletra més petita"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/10 disabled:opacity-30"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setMida((actual) => desaMida(Math.min(MIDES.length - 1, actual + 1)))}
            disabled={mida === MIDES.length - 1}
            aria-label="Lletra més gran"
            className="rounded-lg px-2 py-1 text-lg font-semibold text-zinc-400 transition-colors hover:bg-white/10 disabled:opacity-30"
          >
            A+
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 pb-4">
        {lletra.trim() ? (
          <p
            className={`whitespace-pre-wrap text-center font-semibold leading-relaxed text-zinc-100 ${MIDES[mida]}`}
          >
            {lletra}
          </p>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <IconaLletra className="h-10 w-10 text-teal-400" />
            <p className="text-sm font-semibold text-zinc-50">
              Aquesta cançó encara no té lletra
            </p>
            <button
              type="button"
              onClick={onEdita}
              className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400"
            >
              Enganxa-la
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#1c1f23]/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-right font-mono text-xs text-zinc-400">
              {formatDurada(posicio)}
            </span>
            <input
              type="range"
              min={0}
              max={total || 1}
              step={1}
              value={Math.min(posicio, total || 1)}
              disabled={!total}
              onChange={(event) => onSalta(Number(event.target.value))}
              aria-label="Posició de la cançó"
              style={{ "--progres": `${total ? (Math.min(posicio, total) / total) * 100 : 0}%` } as React.CSSProperties}
              className="w-full cursor-pointer disabled:cursor-default"
            />
            <span className="w-12 shrink-0 font-mono text-xs text-zinc-400">
              {total ? formatDurada(total) : "--:--"}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onAnterior}
              aria-label="Cançó anterior"
              className="rounded-full p-2 text-zinc-200 transition-colors hover:bg-white/10"
            >
              <IconaAnterior className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={onAlterna}
              aria-label={reproduint ? "Pausa" : "Reprodueix"}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-zinc-950 shadow-lg shadow-teal-500/20 transition-colors hover:bg-teal-400"
            >
              {reproduint ? <IconaPausa className="h-7 w-7" /> : <IconaReprodueix className="h-7 w-7" />}
            </button>
            <button
              type="button"
              onClick={onSeguent}
              aria-label="Cançó següent"
              className="rounded-full p-2 text-zinc-200 transition-colors hover:bg-white/10"
            >
              <IconaSeguent className="h-7 w-7" />
            </button>
          </div>

          {lletra.trim() && (
            <div className="mt-1 flex justify-center">
              <button
                type="button"
                onClick={onEdita}
                className="rounded-full px-3 py-1 text-xs font-semibold text-zinc-500 transition-colors hover:text-teal-300"
              >
                Edita la lletra
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

function llegeixMida(): number {
  try {
    const desada = Number(localStorage.getItem(CLAU_MIDA));
    return Number.isInteger(desada) && desada >= 0 && desada < MIDES.length ? desada : 1;
  } catch {
    return 1;
  }
}

function desaMida(mida: number): number {
  try {
    localStorage.setItem(CLAU_MIDA, String(mida));
  } catch {
    // Mode privat: la mida no es recorda, i ja està.
  }
  return mida;
}
