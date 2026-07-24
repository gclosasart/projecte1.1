"use client";

import { useState, useTransition } from "react";
import { actualitzarPermisos } from "./actions";

const MODULS = [
  { key: "reserves", label: "Reserves" },
  { key: "recursos", label: "Recursos" },
  { key: "clients", label: "Clients" },
  { key: "factures", label: "Factures" },
];

export function PermisosEditor({
  profileId,
  permisosInicials,
}: {
  profileId: string;
  permisosInicials: string[];
}) {
  const [permisos, setPermisos] = useState<string[]>(permisosInicials);
  const [desat, setDesat] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle(modul: string) {
    setDesat(false);
    setPermisos((prev) => (prev.includes(modul) ? prev.filter((p) => p !== modul) : [...prev, modul]));
  }

  function desar() {
    startTransition(async () => {
      await actualitzarPermisos(profileId, permisos);
      setDesat(true);
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      {MODULS.map((m) => (
        <label key={m.key} className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" checked={permisos.includes(m.key)} onChange={() => toggle(m.key)} />
          {m.label}
        </label>
      ))}
      <button
        type="button"
        onClick={desar}
        disabled={pending}
        className="text-xs font-medium text-zinc-700 hover:underline disabled:opacity-50 dark:text-zinc-300"
      >
        {pending ? "Desant..." : desat ? "Desat ✓" : "Desa"}
      </button>
    </div>
  );
}
