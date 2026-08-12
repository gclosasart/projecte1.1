"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { dictDe, type Idioma } from "@/lib/i18n/client";

export type Bloc = {
  ocurrenciaId: string;
  reservaId: string;
  codi: string;
  clientNom: string | null;
  horaInici: string;
  horaFi: string;
  noShow: boolean;
};

export type RecursAmbBlocs = {
  id: string;
  nom: string;
  capacitat: number | null;
  preu: number;
  unitatPreu: string;
  blocs: Bloc[];
};

const GRAELLA_INICI_MIN = 7 * 60;
const GRAELLA_FI_MIN = 23 * 60;
const GRAELLA_TOTAL_MIN = GRAELLA_FI_MIN - GRAELLA_INICI_MIN;
const HORES_GRAELLA = Array.from({ length: 17 }, (_, i) => 7 + i);

function minutsDes(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function posicioBloc(horaInici: string, horaFi: string) {
  const iniciMin = Math.min(Math.max(minutsDes(horaInici), GRAELLA_INICI_MIN), GRAELLA_FI_MIN);
  const fiMin = Math.min(Math.max(minutsDes(horaFi), GRAELLA_INICI_MIN), GRAELLA_FI_MIN);
  const left = ((iniciMin - GRAELLA_INICI_MIN) / GRAELLA_TOTAL_MIN) * 100;
  const width = Math.max(((fiMin - iniciMin) / GRAELLA_TOTAL_MIN) * 100, 0.6);
  return { left, width };
}

export function PlanningGraella({
  recursos,
  idioma,
}: {
  recursos: RecursAmbBlocs[];
  idioma: Idioma;
}) {
  const dict = dictDe(idioma);
  const t = dict.planning;

  const [seleccionats, setSeleccionats] = useState<Set<string>>(
    () => new Set(recursos.map((r) => r.id)),
  );
  const [capacitatMin, setCapacitatMin] = useState("");
  const [preuMax, setPreuMax] = useState("");

  const filtrats = useMemo(() => {
    const capMin = capacitatMin === "" ? null : Number(capacitatMin);
    const preMax = preuMax === "" ? null : Number(preuMax);
    return recursos.filter((r) => {
      if (!seleccionats.has(r.id)) return false;
      if (capMin !== null && (r.capacitat == null || r.capacitat < capMin)) return false;
      if (preMax !== null && r.preu > preMax) return false;
      return true;
    });
  }, [recursos, seleccionats, capacitatMin, preuMax]);

  function toggleRecurs(id: string) {
    setSeleccionats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (recursos.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.capRecursActiu}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t.filtres}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">{t.capacitatMinima}</span>
            <input
              type="number"
              min={0}
              value={capacitatMin}
              onChange={(e) => setCapacitatMin(e.target.value)}
              className="w-32 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">{t.preuMaxim}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={preuMax}
              onChange={(e) => setPreuMax(e.target.value)}
              className="w-32 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{t.recursosLabel}</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSeleccionats(new Set(recursos.map((r) => r.id)))}
                className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
              >
                {t.seleccionaTots}
              </button>
              <button
                type="button"
                onClick={() => setSeleccionats(new Set())}
                className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
              >
                {t.desmarcaTots}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recursos.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRecurs(r.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  seleccionats.has(r.id)
                    ? "border-sky-600 bg-sky-50 text-sky-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "border-black/10 text-zinc-500 dark:border-white/10 dark:text-zinc-400"
                }`}
              >
                {r.nom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtrats.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.capRecursFiltrat}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
          <div className="min-w-[960px]">
            <div className="flex border-b border-black/10 dark:border-white/10">
              <div className="w-48 shrink-0 border-r border-black/10 dark:border-white/10" />
              <div className="relative flex flex-1">
                {HORES_GRAELLA.map((h) => (
                  <div
                    key={h}
                    className="flex-1 border-r border-black/5 py-1.5 text-center text-[11px] text-zinc-500 last:border-r-0 dark:border-white/5 dark:text-zinc-400"
                  >
                    {String(h).padStart(2, "0")}h
                  </div>
                ))}
              </div>
            </div>

            {filtrats.map((r) => (
              <div
                key={r.id}
                className="flex border-b border-black/5 last:border-0 dark:border-white/5"
              >
                <div className="w-48 shrink-0 border-r border-black/10 px-3 py-3 dark:border-white/10">
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{r.nom}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {r.capacitat != null ? `${dict.recursos.persones(r.capacitat)} — ` : ""}
                    {r.preu} {r.unitatPreu === "hora" ? dict.recursos.perHora : dict.recursos.perDia}
                  </p>
                </div>
                <div className="relative flex-1 py-3">
                  <div className="absolute inset-0 flex">
                    {HORES_GRAELLA.map((h) => (
                      <div
                        key={h}
                        className="flex-1 border-r border-black/5 last:border-r-0 dark:border-white/5"
                      />
                    ))}
                  </div>
                  <div className="relative h-8">
                    {r.blocs.map((b) => {
                      const { left, width } = posicioBloc(b.horaInici, b.horaFi);
                      return (
                        <Link
                          key={b.ocurrenciaId}
                          href={`/reserves/gestio/${b.reservaId}`}
                          title={`${b.codi} · ${b.horaInici.slice(0, 5)}–${b.horaFi.slice(0, 5)} · ${b.clientNom ?? ""}`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          className={`absolute top-0 h-8 overflow-hidden rounded-md px-2 py-1 text-[11px] font-medium leading-tight text-white transition-opacity hover:opacity-80 ${
                            b.noShow ? "bg-amber-500 dark:bg-amber-600" : "bg-sky-600 dark:bg-indigo-500"
                          }`}
                        >
                          <span className="truncate">{b.clientNom ?? b.codi}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
