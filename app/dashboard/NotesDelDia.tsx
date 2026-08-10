"use client";

import { useRef, useState, useTransition } from "react";
import { afegirNota, marcarNota, eliminarNota } from "./actions";

type Nota = {
  id: string;
  contingut: string;
  fet: boolean;
  hora: string;
  autorNom: string | null;
};

type TextosNotes = {
  capNota: string;
  placeholder: string;
  afegeix: string;
  elimina: string;
  eliminaNota: string;
};

function inicialAutor(nom: string | null): string {
  return nom?.trim().charAt(0).toUpperCase() || "?";
}

export function NotesDelDia({ notes, textos }: { notes: Nota[]; textos: TextosNotes }) {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    startTransition(async () => {
      await afegirNota(value);
      inputRef.current?.focus();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {notes.length === 0 ? (
        <p className="text-base text-zinc-500 dark:text-zinc-400">{textos.capNota}</p>
      ) : (
        <ul className="flex max-h-[7.5rem] flex-col gap-1.5 overflow-y-auto pr-1">
          {notes.map((n) => (
            <li key={n.id} className="group flex h-9 shrink-0 items-center gap-2.5">
              <input
                type="checkbox"
                checked={n.fet}
                onChange={(e) => startTransition(() => marcarNota(n.id, e.target.checked))}
                className="h-4 w-4 shrink-0 accent-sky-600"
              />
              <span
                title={n.autorNom ?? undefined}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white dark:bg-indigo-500"
              >
                {inicialAutor(n.autorNom)}
              </span>
              <span
                className={`flex-1 truncate text-base ${n.fet ? "text-zinc-400 line-through dark:text-zinc-600" : "text-zinc-900 dark:text-zinc-100"}`}
              >
                {n.contingut}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                {n.hora}
              </span>
              <button
                type="button"
                onClick={() => startTransition(() => eliminarNota(n.id))}
                className="shrink-0 text-xs text-zinc-400 opacity-0 hover:text-red-600 group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-red-400"
                aria-label={textos.eliminaNota}
              >
                {textos.elimina}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-1 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={textos.placeholder}
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-40"
        >
          {textos.afegeix}
        </button>
      </form>
    </div>
  );
}
