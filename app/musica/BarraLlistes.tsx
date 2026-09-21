"use client";

import { useEffect, useRef, useState } from "react";
import type { Llista } from "./biblioteca";
import { IconaLlapis, IconaMes, IconaPaperera } from "./icones";

type Props = {
  llistes: Llista[];
  activa: string | null; // null = tota la biblioteca
  onTria: (id: string | null) => void;
  onCrea: (nom: string) => void;
  onCanviaNom: (id: string, nom: string) => void;
  onEsborra: (llista: Llista) => void;
};

export function BarraLlistes({ llistes, activa, onTria, onCrea, onCanviaNom, onEsborra }: Props) {
  const [creant, setCreant] = useState(false);
  const [nomNou, setNomNou] = useState("");
  const [editant, setEditant] = useState(false);
  const [nomEditat, setNomEditat] = useState("");
  const camp = useRef<HTMLInputElement>(null);

  const llistaActiva = llistes.find((llista) => llista.id === activa) ?? null;

  useEffect(() => {
    if (creant || editant) camp.current?.focus();
  }, [creant, editant]);

  // En canviar de llista, cap edició a mitges no ha de sobreviure.
  const tria = (id: string | null) => {
    setEditant(false);
    setCreant(false);
    onTria(id);
  };

  const crea = () => {
    const nom = nomNou.trim();
    if (nom) onCrea(nom);
    setNomNou("");
    setCreant(false);
  };

  const reanomena = () => {
    const nom = nomEditat.trim();
    if (nom && llistaActiva && nom !== llistaActiva.nom) onCanviaNom(llistaActiva.id, nom);
    setEditant(false);
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Xip actiu={activa === null} onClick={() => tria(null)}>
          Totes les cançons
        </Xip>

        {llistes.map((llista) => (
          <Xip key={llista.id} actiu={llista.id === activa} onClick={() => tria(llista.id)}>
            {llista.nom}
            <span className="ml-1.5 text-xs opacity-60">{llista.cancons.length}</span>
          </Xip>
        ))}

        {!creant && (
          <button
            type="button"
            onClick={() => setCreant(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/20 px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:border-teal-400 hover:text-teal-300"
          >
            <IconaMes className="h-4 w-4" />
            Nova llista
          </button>
        )}
      </div>

      {creant && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            crea();
          }}
          className="mt-2 flex items-center gap-2"
        >
          <input
            ref={camp}
            value={nomNou}
            onChange={(event) => setNomNou(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setCreant(false)}
            maxLength={60}
            placeholder="Nom de la llista (per exemple, «Per córrer»)"
            aria-label="Nom de la llista nova"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-teal-400"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400"
          >
            Crea
          </button>
          <button
            type="button"
            onClick={() => setCreant(false)}
            className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Deixa-ho
          </button>
        </form>
      )}

      {llistaActiva && !editant && (
        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
          <button
            type="button"
            onClick={() => {
              setNomEditat(llistaActiva.nom);
              setEditant(true);
            }}
            className="inline-flex items-center gap-1 font-semibold text-zinc-400 transition-colors hover:text-teal-300"
          >
            <IconaLlapis className="h-4 w-4" />
            Canvia el nom
          </button>
          <button
            type="button"
            onClick={() => onEsborra(llistaActiva)}
            className="inline-flex items-center gap-1 font-semibold text-zinc-400 transition-colors hover:text-red-300"
          >
            <IconaPaperera className="h-4 w-4" />
            Esborra la llista
          </button>
          <span className="ml-auto">Les cançons no es perden</span>
        </div>
      )}

      {llistaActiva && editant && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            reanomena();
          }}
          className="mt-2 flex items-center gap-2"
        >
          <input
            ref={camp}
            value={nomEditat}
            onChange={(event) => setNomEditat(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setEditant(false)}
            maxLength={60}
            aria-label="Nom de la llista"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-50 outline-none transition-colors focus:border-teal-400"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400"
          >
            Desa
          </button>
          <button
            type="button"
            onClick={() => setEditant(false)}
            className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Deixa-ho
          </button>
        </form>
      )}
    </div>
  );
}

function Xip({
  actiu,
  onClick,
  children,
}: {
  actiu: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actiu}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        actiu
          ? "bg-teal-500 text-zinc-950"
          : "border border-white/10 bg-white/[0.06] text-zinc-300 hover:border-white/25 hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}
