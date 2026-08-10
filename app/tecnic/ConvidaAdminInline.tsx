"use client";

import { useActionState, useState } from "react";
import type { Dict } from "@/lib/i18n";
import { convidarAdminTenant, type TecnicFormState } from "./actions";

const ESTAT_INICIAL: TecnicFormState = { error: null, success: false };

export function ConvidaAdminInline({
  tenantId,
  textos: t,
}: {
  tenantId: string;
  textos: Dict["tecnic"];
}) {
  const [obert, setObert] = useState(false);
  const action = convidarAdminTenant.bind(null, tenantId);
  const [state, formAction, pending] = useActionState<TecnicFormState, FormData>(
    action,
    ESTAT_INICIAL,
  );

  if (state.success) {
    return <p className="text-sm text-emerald-700 dark:text-emerald-400">{t.invitacioEnviada}</p>;
  }

  if (!obert) {
    return (
      <button
        type="button"
        onClick={() => setObert(true)}
        className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400"
      >
        {t.convidaAdmin}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <input
        type="email"
        name="email"
        placeholder={t.emailPlaceholder}
        required
        className="w-48 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <input
        type="text"
        name="nom"
        placeholder={t.nomOpcionalPlaceholder}
        className="w-36 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {pending ? "..." : t.convida}
      </button>
      <button
        type="button"
        onClick={() => setObert(false)}
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        {t.cancela}
      </button>
      {state.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
