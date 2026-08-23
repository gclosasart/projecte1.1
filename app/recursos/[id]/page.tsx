import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { RecursForm } from "../RecursForm";
import { actualitzarRecurs } from "../actions";
import { BackButton } from "@/app/BackButton";

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
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-black">
      <header className="flex items-center gap-4 px-6 py-5">
        <BackButton href="/recursos" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.recursos.editaElRecurs}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
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
      </main>
    </div>
  );
}
