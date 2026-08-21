"use client";

import { useActionState, useState } from "react";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { convidarStaff, type ConvidaState } from "./actions";

const MODUL_KEYS = ["reserves", "recursos", "clients", "factures"] as const;

const ESTAT_INICIAL: ConvidaState = { error: null, success: false };

export function InvitaForm({ idioma }: { idioma: Idioma }) {
  const t = dictDe(idioma).equip;
  const [state, formAction, pending] = useActionState<ConvidaState, FormData>(
    convidarStaff,
    ESTAT_INICIAL,
  );
  const [rol, setRol] = useState<"tenant_admin" | "user">("user");
  const [permisos, setPermisos] = useState<string[]>([]);

  function toggle(modul: string) {
    setPermisos((prev) => (prev.includes(modul) ? prev.filter((p) => p !== modul) : [...prev, modul]));
  }

  function toggleTots() {
    setPermisos((prev) => (prev.length === MODUL_KEYS.length ? [] : [...MODUL_KEYS]));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nom" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.nom}
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="rol" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.rol}
        </label>
        <select
          id="rol"
          name="rol"
          value={rol}
          onChange={(e) => setRol(e.target.value as "tenant_admin" | "user")}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="user">{t.empleatNomesModuls}</option>
          <option value="tenant_admin">{t.administradorAccesTotal}</option>
        </select>
      </div>

      {rol === "user" && (
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.modulsConcedits}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={permisos.length === MODUL_KEYS.length}
                onChange={toggleTots}
              />
              {t.tots}
            </label>
            {MODUL_KEYS.map((key) => (
              <label
                key={key}
                className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <input
                  type="checkbox"
                  name="permisos"
                  value={key}
                  checked={permisos.includes(key)}
                  onChange={() => toggle(key)}
                />
                {t.moduls[key]}
              </label>
            ))}
          </div>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{t.invitacioEnviada}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
      >
        {pending ? t.enviant : t.convida}
      </button>
    </form>
  );
}
