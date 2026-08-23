"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Dict } from "@/lib/i18n";
import { crearRectificativa } from "./actions";

export function CreaRectificativaButton({
  facturaId,
  textos: t,
}: {
  facturaId: string;
  textos: Dict["factures"]["detall"];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmant, setConfirmant] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirmant) {
    return (
      <button
        type="button"
        onClick={() => setConfirmant(true)}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        {t.creaRectificativa}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.segurRectificativa}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await crearRectificativa(facturaId);
              if (res.error) {
                setError(res.error);
                return;
              }
              if (res.novaId) router.push(`/factures/${res.novaId}`);
            })
          }
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? t.creant : t.confirma}
        </button>
        <button
          type="button"
          onClick={() => setConfirmant(false)}
          disabled={pending}
          className="text-sm text-zinc-500 hover:underline disabled:opacity-50 dark:text-zinc-400"
        >
          {t.cancela}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
