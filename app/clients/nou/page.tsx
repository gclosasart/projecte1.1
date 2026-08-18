import Link from "next/link";
import { ClientForm } from "../ClientForm";
import { crearClient } from "../actions";
import { getDict } from "@/lib/i18n";

export default async function NouClientPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 flex-col items-center bg-sky-50 py-10 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <Link href="/clients" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← {t.clients.titol}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-sky-600 dark:text-indigo-400">
          {t.clients.nouClient}
        </h1>

        <div className="mt-6">
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
      </div>
    </div>
  );
}
