"use client";

import { useState } from "react";
import Link from "next/link";

export type ItemNav = { href: string; label: string };

export function NavSecundaria({ items, menuLabel }: { items: ItemNav[]; menuLabel: string }) {
  const [obert, setObert] = useState(false);

  return (
    <nav className="-mt-6">
      {/* Pantalles amples: fila de píndoles */}
      <div className="hidden flex-wrap gap-2 sm:flex">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:border-sky-600 hover:text-sky-700 dark:border-white/10 dark:text-zinc-400 dark:hover:border-sky-500 dark:hover:text-sky-400"
          >
            {it.label}
          </Link>
        ))}
      </div>

      {/* Mòbil: botó que desplega un menú */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setObert((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-400"
          aria-expanded={obert}
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
            <path
              d="M3 5.5h14M3 10h14M3 14.5h14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          {menuLabel}
        </button>

        {obert && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setObert(false)} />
            <div className="relative z-20 mt-2 flex w-full max-w-xs flex-col gap-1 rounded-xl border border-black/10 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-zinc-950">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setObert(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5"
                >
                  {it.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
