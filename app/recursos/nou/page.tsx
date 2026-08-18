import Link from "next/link";
import { RecursForm } from "../RecursForm";
import { crearRecurs } from "../actions";
import { getDict } from "@/lib/i18n";

export default async function NouRecursPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 flex-col items-center bg-sky-50 py-10 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <Link href="/recursos" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← {t.recursos.titol}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-sky-600 dark:text-indigo-400">
          {t.recursos.nouRecurs}
        </h1>

        <div className="mt-6">
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
      </div>
    </div>
  );
}
