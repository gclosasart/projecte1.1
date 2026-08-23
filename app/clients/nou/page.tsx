import { ClientForm } from "../ClientForm";
import { crearClient } from "../actions";
import { getDict } from "@/lib/i18n";
import { BackButton } from "@/app/BackButton";

export default async function NouClientPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 flex-col bg-marble dark:bg-black">
      <header className="flex items-center gap-4 px-6 py-5">
        <BackButton href="/clients" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.clients.nouClient}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
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
