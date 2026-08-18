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
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← {t.comu.dashboard}
          </Link>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{t.clients.titol}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/clients/llista-negra"
            className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            {t.llistaNegra.titol}
          </Link>
          <Link
            href="/clients/nou"
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
          >
            {t.clients.nouClient}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
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
