import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ClientRowActions } from "./ClientRowActions";

type Client = {
  id: string;
  nom: string;
  nif: string | null;
  email: string | null;
};

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, nom, nif, email")
    .order("nom")
    .returns<Client[]>();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Clients</h1>
        </div>
        <Link
          href="/clients/nou"
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
        >
          Nou client
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {!clients || clients.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Encara no hi ha cap client donat d&apos;alta.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {clients.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{c.nom}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {[c.nif, c.email].filter(Boolean).join(" · ") || "Sense dades de contacte"}
                  </p>
                </div>
                <ClientRowActions id={c.id} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
