"use client";

import { useRef, useState, useTransition } from "react";
import { afegirNota, marcarNota, eliminarNota } from "./actions";

type Nota = {
  id: string;
  contingut: string;
  fet: boolean;
};

export function NotesDelDia({ notes }: { notes: Nota[] }) {
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cap nota per avui.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {notes.map((n) => (
            <li key={n.id} className="group flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={n.fet}
                onChange={(e) => startTransition(() => marcarNota(n.id, e.target.checked))}
                className="h-4 w-4 shrink-0 accent-sky-600"
              />
              <span
                className={`flex-1 text-sm ${n.fet ? "text-zinc-400 line-through dark:text-zinc-600" : "text-zinc-900 dark:text-zinc-100"}`}
              >
                {n.contingut}
              </span>
              <button
                type="button"
                onClick={() => startTransition(() => eliminarNota(n.id))}
                className="shrink-0 text-xs text-zinc-400 opacity-0 hover:text-red-600 group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-red-400"
                aria-label="Elimina la nota"
              >
                Elimina
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
          placeholder="Afegeix una nota..."
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-40"
        >
          Afegeix
        </button>
      </form>
    </div>
  );
}
