import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { ClientForm } from "../ClientForm";
import { DeleteClientForm } from "../DeleteClientForm";
import { actualitzarClient, eliminarClient } from "../actions";

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
    <div className="flex flex-1 flex-col items-center bg-sky-50 py-10 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <Link
          href="/clients"
          className="text-7xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ←
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-sky-600 dark:text-indigo-400">
          {t.clients.editaElClient}
        </h1>

        <div className="mt-6">
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
      </div>
    </div>
  );
}
