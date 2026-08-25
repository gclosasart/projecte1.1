import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { TenantForm } from "./TenantForm";
import { CopiaEnllacPublic } from "./CopiaEnllacPublic";
import { BackButton } from "@/app/BackButton";

export default async function ConfiguracioPage() {
  const supabase = await createClient();
  const t = await getDict();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

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
    <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5">
        <BackButton href="/dashboard" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.configuracio.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        {!potEditar || !tenant ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.configuracio.sensePermisos}</p>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-6 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t.configuracio.avisEmissor}</p>
              <TenantForm valorsInicials={tenant} textos={t.configuracio} />
            </div>
            <CopiaEnllacPublic
              url={`${protocol}://${host}/reserva/${profile!.tenant_id!}`}
              textos={t.configuracio}
            />
          </div>
        )}
      </main>
    </div>
  );
}
