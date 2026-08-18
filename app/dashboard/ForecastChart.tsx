"use client";

import { useEffect, useState } from "react";

type DiaForecast = {
  label: string;
  comencen: number;
  sessions: number;
  ocupacioPercent: number | null;
};

type TextosForecast = {
  reservesNoves: string;
  novesCurt: string;
  sessionsCurt: string;
  sessionsDelDia: string;
  ocupacioEstimada: string;
  capActivitat: string;
};

export function ForecastChart({ dies, textos }: { dies: DiaForecast[]; textos: TextosForecast }) {
  const maxVal = Math.max(1, ...dies.map((d) => Math.max(d.comencen, d.sessions)));
  const [animat, setAnimat] = useState(false);
  const capActivitat = dies.every((d) => d.comencen === 0 && d.sessions === 0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimat(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (capActivitat) {
    return <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{textos.capActivitat}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-600" aria-hidden />
          {textos.reservesNoves}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-200 dark:bg-sky-900" aria-hidden />
          {textos.sessionsDelDia}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 border-b border-zinc-300 pb-0 dark:border-zinc-700">
        {dies.map((d, i) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-32 items-end gap-1">
              <div
                className="group/bar relative w-3.5 rounded-t bg-sky-600 transition-[height] duration-700 ease-out"
                style={{
                  height: animat ? `${(d.comencen / maxVal) * 100}%` : "0%",
                  minHeight: animat && d.comencen > 0 ? "4px" : "0",
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/bar:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
                  {d.comencen} {textos.novesCurt}
                </span>
              </div>
              <div
                className="group/bar relative w-3.5 rounded-t bg-sky-200 dark:bg-sky-900 transition-[height] duration-700 ease-out"
                style={{
                  height: animat ? `${(d.sessions / maxVal) * 100}%` : "0%",
                  minHeight: animat && d.sessions > 0 ? "4px" : "0",
                  transitionDelay: `${i * 60 + 30}ms`,
                }}
              >
                <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/bar:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
                  {d.sessions} {textos.sessionsCurt}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{d.label}</p>
            <p className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {d.ocupacioPercent === null ? "—" : `${d.ocupacioPercent}%`}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {textos.ocupacioEstimada}
      </p>
    </div>
  );
}
