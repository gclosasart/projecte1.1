"use client";

import { useMemo, useState } from "react";
import { ClientRowActions } from "./ClientRowActions";

type Client = {
  id: string;
  nom: string;
  nif: string | null;
  email: string | null;
};

type Textos = {
  cercaPlaceholder: string;
  capResultatCerca: string;
  senseDadesContacte: string;
  edita: string;
  elimina: string;
  confirma: string;
  cancela: string;
  escriuElimina: string;
};

export function ClientsList({ clients, textos: t }: { clients: Client[]; textos: Textos }) {
  const [query, setQuery] = useState("");

  const filtrats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.nif?.toLowerCase().includes(q),
    );
  }, [clients, query]);

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.cercaPlaceholder}
        className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />

      {filtrats.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.capResultatCerca}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtrats.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
            >
              <div>
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{c.nom}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {[c.nif, c.email].filter(Boolean).join(" · ") || t.senseDadesContacte}
                </p>
              </div>
              <ClientRowActions
                id={c.id}
                textos={{
                  edita: t.edita,
                  elimina: t.elimina,
                  confirma: t.confirma,
                  cancela: t.cancela,
                  escriuElimina: t.escriuElimina,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
