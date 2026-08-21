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
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 bg-white px-6 py-5 dark:bg-zinc-950">
        <Link
          href="/clients"
          className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform hover:scale-105 dark:bg-white dark:text-zinc-950"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" aria-hidden>
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
          {t.clients.editaElClient}
        </h1>
      </header>
      <div className="h-1.5 w-full bg-blue-900 dark:bg-blue-800" aria-hidden />

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
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
