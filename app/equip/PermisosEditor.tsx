"use client";

import { useState, useTransition } from "react";
import type { Dict } from "@/lib/i18n";
import { actualitzarPermisos } from "./actions";

const MODUL_KEYS = ["reserves", "recursos", "clients", "factures"] as const;

export function PermisosEditor({
  profileId,
  permisosInicials,
  textos: t,
}: {
  profileId: string;
  permisosInicials: string[];
  textos: Dict["equip"];
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
      {MODUL_KEYS.map((key) => (
        <label key={key} className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" checked={permisos.includes(key)} onChange={() => toggle(key)} />
          {t.modulsCurt[key]}
        </label>
      ))}
      <button
        type="button"
        onClick={desar}
        disabled={pending}
        className="text-xs font-medium text-zinc-700 hover:underline disabled:opacity-50 dark:text-zinc-300"
      >
        {pending ? t.desant : desat ? t.desat : t.desa}
      </button>
    </div>
  );
}
