"use client";

import { useEffect, useRef, useState } from "react";
import type { Canco } from "./biblioteca";

type Props = {
  canco: Canco;
  lletra: string;
  onDesa: (text: string) => void;
  onTanca: () => void;
};

/**
 * La lletra d'una cançó: es veu, i s'hi enganxa la que es tingui. El text es
 * desa tal qual al dispositiu, com la resta de coses del reproductor.
 */
export function DialegLletra({ canco, lletra, onDesa, onTanca }: Props) {
  const [editant, setEditant] = useState(!lletra);
  const [text, setText] = useState(lletra);
  const camp = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editant) camp.current?.focus();
  }, [editant]);

  useEffect(() => {
    const ambEscapada = (event: KeyboardEvent) => event.key === "Escape" && onTanca();
    window.addEventListener("keydown", ambEscapada);
    return () => window.removeEventListener("keydown", ambEscapada);
  }, [onTanca]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lletra de ${canco.titol}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={(event) => event.target === event.currentTarget && onTanca()}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-white/10 bg-[#25282e] p-4 shadow-2xl shadow-black/60">
        <p className="text-xs uppercase tracking-wide text-teal-400">Lletra</p>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-50">{canco.titol}</p>
        <p className="truncate text-xs text-zinc-400">{canco.artista}</p>

        {editant ? (
          <>
            <textarea
              ref={camp}
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={20000}
              rows={12}
              placeholder="Enganxa aquí la lletra de la cançó…"
              aria-label="Lletra de la cançó"
              className="mt-3 min-h-40 flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-teal-400"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Es queda en aquest dispositiu, com les cançons: no es puja enlloc.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              {lletra && (
                <button
                  type="button"
                  onClick={() => {
                    setText(lletra);
                    setEditant(false);
                  }}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  Deixa-ho
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onDesa(text);
                  setEditant(false);
                  if (!text.trim()) onTanca();
                }}
                className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400"
              >
                Desa
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-3 flex-1 overflow-y-auto rounded-xl bg-white/[0.04] px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">{lletra}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm("Vols esborrar la lletra d'aquesta cançó?")) return;
                  onDesa("");
                  onTanca();
                }}
                className="rounded-full px-3 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-red-300"
              >
                Esborra la lletra
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditant(true)}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/10"
                >
                  Edita
                </button>
                <button
                  type="button"
                  onClick={onTanca}
                  className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400"
                >
                  Fet
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
