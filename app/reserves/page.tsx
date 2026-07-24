import Link from "next/link";

export default function ReservesPage() {
  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Dashboard
        </Link>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Reserves</h1>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-start">
        <Link
          href="/reserves/nova"
          className="flex flex-1 flex-col gap-1 rounded-xl border border-black/10 bg-white p-6 transition-colors hover:border-sky-500 dark:border-white/10 dark:bg-zinc-950 dark:hover:border-indigo-500"
        >
          <span className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Nova reserva</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Crea una reserva puntual o recurrent per a un client.
          </span>
        </Link>

        <Link
          href="/reserves/gestio"
          className="flex flex-1 flex-col gap-1 rounded-xl border border-black/10 bg-white p-6 transition-colors hover:border-sky-500 dark:border-white/10 dark:bg-zinc-950 dark:hover:border-indigo-500"
        >
          <span className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Gestiona reserves</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Consulta totes les reserves existents i el seu estat.
          </span>
        </Link>
      </main>
    </div>
  );
}
