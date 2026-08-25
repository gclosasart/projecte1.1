import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDict, getIdioma } from "@/lib/i18n";
import { SelectorIdioma } from "@/app/SelectorIdioma";
import { SolicitudForm } from "./SolicitudForm";

type Recurs = {
  id: string;
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: string;
};

export default async function ReservaPublicaPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const t = await getDict();
  const idioma = await getIdioma();
  const admin = createAdminClient();

  const { data: tenant } = await admin
    .from("tenants")
    .select("nom_comercial")
    .eq("id", tenantId)
    .maybeSingle();

  if (!tenant) {
    notFound();
  }

  const { data: recursos } = await admin
    .from("recursos")
    .select("id, nom, capacitat, preu, unitat_preu")
    .eq("tenant_id", tenantId)
    .eq("actiu", true)
    .eq("bloquejat", false)
    .order("nom")
    .returns<Recurs[]>();

  return (
    <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
      <header className="flex items-center justify-between gap-4 px-6 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-teal-600 dark:text-teal-400">
            {t.reservaPublica.etiquetaCoworking}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {tenant.nom_comercial}
          </h1>
        </div>
        <SelectorIdioma actual={idioma} textos={t.comu.idiomes} />
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-6">
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">{t.reservaPublica.subtitol}</p>

        {!recursos || recursos.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.reservaPublica.capRecurs}</p>
        ) : (
          <SolicitudForm tenantId={tenantId} recursos={recursos} textos={t.reservaPublica} />
        )}
      </main>
    </div>
  );
}
