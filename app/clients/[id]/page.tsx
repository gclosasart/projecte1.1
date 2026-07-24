import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const { data: client } = await supabase
    .from("clients")
    .select("nom, nif, email, adreca")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 py-10 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <Link href="/clients" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Clients
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Edita el client
        </h1>

        <div className="mt-6">
          <ClientForm
            action={actualitzarClient.bind(null, id)}
            valorsInicials={client}
            textBoto="Desa els canvis"
          />
        </div>

        <DeleteClientForm action={eliminarClient.bind(null, id)} />
      </div>
    </div>
  );
}
