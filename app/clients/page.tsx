import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { ClientsList } from "./ClientsList";

type Client = {
  id: string;
  nom: string;
  nif: string | null;
  email: string | null;
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const t = await getDict();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, nom, nif, email")
    .order("nom")
    .returns<Client[]>();

  return (
    <div className="flex flex-1 flex-col bg-rose-50 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="text-5xl leading-none font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
          >
            ←
          </Link>
          <h1 className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
            {t.clients.titol}
          </h1>
        </div>
        <Link
          href="/clients/llista-negra"
          className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
        >
          {t.llistaNegra.titol}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
        <Link
          href="/clients/nou"
          className="mb-6 inline-block rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
        >
          {t.clients.nouClient}
        </Link>

        {!clients || clients.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.clients.capClient}</p>
        ) : (
          <ClientsList
            clients={clients}
            textos={{
              cercaPlaceholder: t.clients.cercaPlaceholder,
              capResultatCerca: t.clients.capResultatCerca,
              senseDadesContacte: t.clients.senseDadesContacte,
              edita: t.comu.edita,
              elimina: t.comu.elimina,
              confirma: t.comu.confirma,
              cancela: t.comu.cancela,
              escriuElimina: t.recursos.escriuElimina,
            }}
          />
        )}
      </main>
    </div>
  );
}
