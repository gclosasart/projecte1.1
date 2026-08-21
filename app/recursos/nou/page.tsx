import Link from "next/link";
import { RecursForm } from "../RecursForm";
import { crearRecurs } from "../actions";
import { getDict } from "@/lib/i18n";

export default async function NouRecursPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link
          href="/recursos"
          className="text-7xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-semibold text-sky-600 dark:text-indigo-400">{t.recursos.nouRecurs}</h1>
      </header>

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
