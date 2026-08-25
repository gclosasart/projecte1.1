"use client";

import { useState } from "react";
import type { Dict } from "@/lib/i18n";

export function CopiaEnllacPublic({
  url,
  textos: t,
}: {
  url: string;
  textos: Dict["configuracio"];
}) {
  const [copiat, setCopiat] = useState(false);

  async function copia() {
    await navigator.clipboard.writeText(url);
    setCopiat(true);
    setTimeout(() => setCopiat(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-6 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
      <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t.enllacPublicTitol}</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t.enllacPublicText}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={copia}
          className="shrink-0 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
        >
          {copiat ? t.enllacCopiat : t.copiaEnllac}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {t.obreEnllac}
        </a>
      </div>
    </div>
  );
}
