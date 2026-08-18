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
      <header className="flex flex-wrap items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← {t.comu.dashboard}
        </Link>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{t.reservaNova.titol}</h1>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <NovaReservaForm recursos={recursos ?? []} clients={clients ?? []} idioma={idioma} />
      </main>
    </div>
  );
}
