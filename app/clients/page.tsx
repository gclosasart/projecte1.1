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
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white transition-transform hover:scale-105 dark:bg-blue-800 dark:text-white"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden>
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

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-8">
        <Link
          href="/clients/nou"
          className="mb-6 inline-block rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
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
