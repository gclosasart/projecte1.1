import Link from "next/link";
import { RecursForm } from "../RecursForm";
import { crearRecurs } from "../actions";
import { getDict } from "@/lib/i18n";

export default async function NouRecursPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 bg-white px-6 py-5 dark:bg-zinc-950">
        <Link
          href="/recursos"
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform hover:scale-105 dark:bg-white dark:text-zinc-950"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden>
            <path
              d="M16 10H4m0 0 4.5-4.5M4 10l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-950 uppercase italic dark:text-zinc-50">
          {t.recursos.nouRecurs}
        </h1>
      </header>
      <div className="h-1.5 w-full bg-blue-900 dark:bg-blue-800" aria-hidden />

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <RecursForm
            action={crearRecurs}
            textBoto={t.recursos.creaRecurs}
            textos={{
              nom: t.recursos.nom,
              nomPlaceholder: t.recursos.nomPlaceholder,
              capacitatPersones: t.recursos.capacitatPersones,
              unitatsDisponiblesLabel: t.recursos.unitatsDisponiblesLabel,
              preu: t.recursos.preu,
              unitat: t.recursos.unitat,
              perHora: t.recursos.perHora,
              perDia: t.recursos.perDia,
              desant: t.recursos.desant,
            }}
          />
        </div>
      </main>
    </div>
  );
}
