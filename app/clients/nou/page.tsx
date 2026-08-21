import Link from "next/link";
import { ClientForm } from "../ClientForm";
import { crearClient } from "../actions";
import { getDict } from "@/lib/i18n";

export default async function NouClientPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 px-6 py-5">
        <Link
          href="/clients"
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
          {t.clients.nouClient}
        </h1>
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
