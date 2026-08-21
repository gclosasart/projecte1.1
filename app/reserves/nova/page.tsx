import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { NovaReservaForm } from "./NovaReservaForm";

export default async function NovaReservaPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const [{ data: recursos }, { data: clients }] = await Promise.all([
    supabase
      .from("recursos")
      .select("id, nom, capacitat, preu, unitat_preu, quantitat")
      .eq("actiu", true)
      .order("nom"),
    supabase.from("clients").select("id, nom, nif, email").order("nom"),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 bg-white px-6 py-5 dark:bg-zinc-950">
        <Link
          href="/dashboard"
          className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform hover:scale-105 dark:bg-white dark:text-zinc-950"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" aria-hidden>
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
          {t.reservaNova.titol}
        </h1>
      </header>
      <div className="h-1.5 w-full bg-blue-900 dark:bg-blue-800" aria-hidden />

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-8">
        <NovaReservaForm recursos={recursos ?? []} clients={clients ?? []} idioma={idioma} />
      </main>
    </div>
  );
}
