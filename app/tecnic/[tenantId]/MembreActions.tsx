"use client";

import { useState, useTransition } from "react";
import type { Dict } from "@/lib/i18n";
import {
  canviarRolMembre,
  enviarResetContrasenya,
  type MembreActionState,
} from "./actions";

export function MembreActions({
  tenantId,
  profileId,
  email,
  rolActual,
  textos: t,
}: {
  tenantId: string;
  profileId: string;
  email: string | null;
  rolActual: string;
  textos: Dict["tecnic"]["detall"];
}) {
  const [pending, startTransition] = useTransition();
  const [missatge, setMissatge] = useState<MembreActionState | null>(null);

  function canviarRol(nouRol: "tenant_admin" | "user") {
    startTransition(async () => {
      const res = await canviarRolMembre(tenantId, profileId, nouRol);
      setMissatge(res);
    });
  }

  function resetContrasenya() {
    if (!email) return;
    startTransition(async () => {
      const res = await enviarResetContrasenya(email);
      setMissatge(res);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <select
          value={rolActual}
          disabled={pending}
          onChange={(e) => canviarRol(e.target.value as "tenant_admin" | "user")}
          className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="tenant_admin">{t.administrador}</option>
          <option value="user">{t.empleat}</option>
        </select>
        <button
          type="button"
          onClick={resetContrasenya}
          disabled={pending || !email}
          className="text-xs font-medium text-teal-700 hover:underline disabled:opacity-40 dark:text-teal-400"
        >
          {t.resetContrasenya}
        </button>
      </div>
      {missatge?.error && <p className="text-xs text-red-600 dark:text-red-400">{missatge.error}</p>}
      {missatge?.missatge && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">{missatge.missatge}</p>
      )}
    </div>
  );
}
