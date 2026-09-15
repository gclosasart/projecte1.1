import { createAdminClient } from "@/lib/supabase/admin";
import { getDict, getIdioma } from "@/lib/i18n";
import { SelectorIdioma } from "@/app/SelectorIdioma";
import { CercaClient } from "./CercaClient";

type TenantAmbRecursos = {
  id: string;
  nom_comercial: string;
  recursos: { id: string }[];
};

export default async function CercaPage() {
  const t = await getDict();
  const idioma = await getIdioma();
  const admin = createAdminClient();

  const { data: tenants } = await admin
    .from("tenants")
    .select("id, nom_comercial, recursos(id)")
    .eq("recursos.actiu", true)
    .eq("recursos.bloquejat", false)
    .returns<TenantAmbRecursos[]>();

  const coworkings = (tenants ?? [])
    .filter((tn) => tn.recursos.length > 0)
    .map((tn) => ({ id: tn.id, nom: tn.nom_comercial, numRecursos: tn.recursos.length }))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
      <header className="flex items-center justify-between gap-4 px-6 py-5">
        <p className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Trempt</p>
        <SelectorIdioma actual={idioma} textos={t.comu.idiomes} />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.cerca.titol}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t.cerca.subtitol}</p>
        </div>

        <CercaClient coworkings={coworkings} idioma={idioma} />
      </main>
    </div>
  );
}
