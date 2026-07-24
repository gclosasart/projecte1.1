import Link from "next/link";
import { ClientForm } from "../ClientForm";
import { crearClient } from "../actions";

export default function NouClientPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-sky-50 py-10 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <Link href="/clients" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Clients
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Nou client
        </h1>

        <div className="mt-6">
          <ClientForm action={crearClient} textBoto="Crea el client" />
        </div>
      </div>
    </div>
  );
}
