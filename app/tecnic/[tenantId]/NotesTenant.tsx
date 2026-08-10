"use client";

import { useRef, useState, useTransition } from "react";
import type { Dict } from "@/lib/i18n";
import { afegirNotaTenant, eliminarNotaTenant } from "./actions";

type Nota = {
  id: string;
  contingut: string;
  created_at: string;
};

export function NotesTenant({
  tenantId,
  notes,
  textos: t,
}: {
  tenantId: string;
  notes: Nota[];
  textos: Dict["tecnic"]["detall"];
}) {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    startTransition(async () => {
      await afegirNotaTenant(tenantId, value);
      inputRef.current?.focus();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {notes.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.capNotaEncara}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((n) => (
            <li key={n.id} className="group flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{n.contingut}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {new Date(n.created_at).toLocaleDateString(t.localeDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startTransition(() => eliminarNotaTenant(tenantId, n.id))}
                className="shrink-0 text-xs text-zinc-400 opacity-0 hover:text-red-600 group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-red-400"
                aria-label={t.eliminaNota}
              >
                {t.elimina}
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
          placeholder={t.afegeixNotaPlaceholder}
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-40"
        >
          {t.afegeix}
        </button>
      </form>
    </div>
  );
}
