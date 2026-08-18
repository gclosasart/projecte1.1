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
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← {t.comu.dashboard}
        </Link>
        <h1 className="text-lg font-semibold text-sky-600 dark:text-indigo-400">
          {t.configuracio.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-sm flex-1 px-6 py-8">
        {!potEditar || !tenant ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.configuracio.sensePermisos}</p>
        ) : (
          <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t.configuracio.avisEmissor}</p>
            <TenantForm valorsInicials={tenant} textos={t.configuracio} />
          </div>
        )}
      </main>
    </div>
  );
}
