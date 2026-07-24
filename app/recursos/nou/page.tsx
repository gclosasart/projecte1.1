import Link from "next/link";
import { RecursForm } from "../RecursForm";
import { crearRecurs } from "../actions";

export default function NouRecursPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-sky-50 py-10 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <Link href="/recursos" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Recursos
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Nou recurs
        </h1>

        <div className="mt-6">
          <RecursForm action={crearRecurs} textBoto="Crea el recurs" />
        </div>
      </div>
    </div>
  );
}
