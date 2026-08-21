import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { RecursForm } from "../RecursForm";
import { actualitzarRecurs } from "../actions";

export default async function EditarRecursPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getDict();

  const { data: recurs } = await supabase
    .from("recursos")
    .select("nom, capacitat, preu, unitat_preu, quantitat")
    .eq("id", id)
    .single();

  if (!recurs) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-sky-50 py-10 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <Link
          href="/recursos"
          className="text-7xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ←
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-sky-600 dark:text-indigo-400">
          {t.recursos.editaElRecurs}
        </h1>

        <div className="mt-6">
          <RecursForm
            action={actualitzarRecurs.bind(null, id)}
            valorsInicials={recurs}
            textBoto={t.recursos.desaCanvis}
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
