import Link from "next/link";
import { RecursForm } from "../RecursForm";
import { crearRecurs } from "../actions";
import { getDict } from "@/lib/i18n";

export default async function NouRecursPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 flex-col bg-rose-50 dark:bg-black">
      <header className="flex items-center gap-4 px-6 py-5">
        <Link
          href="/recursos"
          className="text-5xl leading-none font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
          {t.recursos.nouRecurs}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
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
