import Link from "next/link";
import { ClientForm } from "../ClientForm";
import { crearClient } from "../actions";
import { getDict } from "@/lib/i18n";

export default async function NouClientPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link
          href="/clients"
          className="text-7xl leading-none font-semibold text-sky-600 hover:text-sky-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-semibold text-sky-600 dark:text-indigo-400">{t.clients.nouClient}</h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <ClientForm
            action={crearClient}
            textBoto={t.clients.creaClient}
            textos={{
              nom: t.clients.nom,
              nif: t.clients.nif,
              email: t.clients.email,
              adreca: t.clients.adreca,
              desant: t.clients.desant,
            }}
          />
        </div>
      </main>
    </div>
  );
}
