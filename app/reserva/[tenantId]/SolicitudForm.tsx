"use client";

import { useActionState, useState } from "react";
import { crearSolicitud, type SolicitudState } from "./actions";
import type { Dict } from "@/lib/i18n";

type Recurs = {
  id: string;
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: string;
};

const ESTAT_INICIAL: SolicitudState = { error: null, exit: false };
const inputClass =
  "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50";

export function SolicitudForm({
  tenantId,
  recursos,
  textos: t,
}: {
  tenantId: string;
  recursos: Recurs[];
  textos: Dict["reservaPublica"];
}) {
  const [state, formAction, pending] = useActionState<SolicitudState, FormData>(
    crearSolicitud,
    ESTAT_INICIAL,
  );
  const [recursId, setRecursId] = useState(recursos[0]?.id ?? "");

  if (state.exit) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">{t.exitTitol}</p>
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{t.exitText}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="tenant_id" value={tenantId} />
      {/* Camp trampa anti-bots: ocult per a persones amb CSS, no amb display:none perquè
          alguns bots l'ignoren si detecten això. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Empresa
          <input type="text" name="empresa_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t.recurs}</h2>
        <div className="mt-3 flex flex-col gap-2">
          {recursos.map((r) => (
            <label
              key={r.id}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                recursId === r.id
                  ? "border-teal-600 bg-teal-50 dark:border-teal-500 dark:bg-teal-950/20"
                  : "border-black/10 dark:border-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="recurs_id"
                  value={r.id}
                  checked={recursId === r.id}
                  onChange={() => setRecursId(r.id)}
                />
                <span className="text-zinc-950 dark:text-zinc-50">
                  {r.nom}
                  {r.capacitat != null ? ` — ${t.personesCurt(r.capacitat)}` : ""}
                </span>
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {r.preu} {r.unitat_preu === "hora" ? t.perHora : t.perDia}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.data}</label>
            <input type="date" name="data" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.horaInici}</label>
            <input type="time" name="hora_inici" defaultValue="09:00" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.horaFi}</label>
            <input type="time" name="hora_fi" defaultValue="10:00" required className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.nom}</label>
            <input type="text" name="nom" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.email}</label>
            <input type="email" name="email" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.telefon}</label>
            <input type="tel" name="telefon" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.missatge}</label>
            <textarea name="missatge" rows={3} placeholder={t.missatgePlaceholder} className={inputClass} />
          </div>
        </div>
      </section>

      <div>
        {state.error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
        >
          {pending ? t.enviant : t.envia}
        </button>
        <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">{t.avisNoConfirmada}</p>
      </div>
    </form>
  );
}
