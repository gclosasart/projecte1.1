import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { ClientForm } from "../ClientForm";
import { DeleteClientForm } from "../DeleteClientForm";
import { actualitzarClient, eliminarClient } from "../actions";
import { BackButton } from "@/app/BackButton";

export default async function EditarClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getDict();

  const { data: client } = await supabase
    .from("clients")
    .select("nom, nif, email, adreca")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-marble dark:bg-black">
      <header className="flex items-center gap-4 px-6 py-5">
        <BackButton href="/clients" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.clients.editaElClient}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
          <ClientForm
            action={actualitzarClient.bind(null, id)}
            valorsInicials={client}
            textBoto={t.clients.desaCanvis}
            textos={{
              nom: t.clients.nom,
              nif: t.clients.nif,
              email: t.clients.email,
              adreca: t.clients.adreca,
              desant: t.clients.desant,
            }}
          />
        </div>

        <DeleteClientForm
          action={eliminarClient.bind(null, id)}
          textos={{
            zonaPerillosa: t.clients.zonaPerillosa,
            avisEliminarPermanent: t.clients.avisEliminarPermanent,
            confirma: t.comu.confirma,
            cancela: t.comu.cancela,
            escriuElimina: t.recursos.escriuElimina,
          }}
        />
      </main>
    </div>
  );
}
