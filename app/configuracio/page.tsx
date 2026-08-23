import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { TenantForm } from "./TenantForm";

export default async function ConfiguracioPage() {
  const supabase = await createClient();
  const t = await getDict();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, rol")
    .eq("id", user!.id)
    .single();

  const potEditar = profile?.rol === "tenant_admin" || profile?.rol === "tecnic";

  const { data: tenant } = profile?.tenant_id
    ? await supabase
        .from("tenants")
        .select("nom_comercial, rao_social, nif, adreca_fiscal")
        .eq("id", profile.tenant_id)
        .single()
    : { data: null };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5">
        <Link
          href="/dashboard"
          className="text-5xl leading-none font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
          {t.configuracio.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        {!potEditar || !tenant ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.configuracio.sensePermisos}</p>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-6 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t.configuracio.avisEmissor}</p>
            <TenantForm valorsInicials={tenant} textos={t.configuracio} />
          </div>
        )}
      </main>
    </div>
  );
}
