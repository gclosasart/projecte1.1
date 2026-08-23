import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { PlataformaForm } from "./PlataformaForm";
import { BackButton } from "@/app/BackButton";

export default async function PlataformaPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user!.id)
    .single();

  const esTecnic = profile?.rol === "tecnic";

  const { data: plataforma } = esTecnic
    ? await supabase
        .from("plataforma")
        .select("nom_comercial, rao_social, nif, adreca_fiscal, iva_percent")
        .limit(1)
        .single()
    : { data: null };

  return (
    <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5">
        <BackButton href="/tecnic" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.plataforma.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        {!esTecnic || !plataforma ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.plataforma.sensePermisos}</p>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-6 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t.plataforma.avisEmissor}</p>
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
              {t.plataforma.avisNoDonatAlta}
            </p>
            <PlataformaForm valorsInicials={plataforma} idioma={idioma} />
          </div>
        )}
      </main>
    </div>
  );
}
