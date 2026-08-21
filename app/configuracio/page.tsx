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
      <header className="flex flex-wrap items-center gap-4 bg-white px-6 py-5 dark:bg-zinc-950">
        <Link
          href="/dashboard"
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white transition-transform hover:scale-105 dark:bg-blue-800 dark:text-white"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden>
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
          {t.configuracio.titol}
        </h1>
      </header>
      <div className="h-1.5 w-full bg-blue-900 dark:bg-blue-800" aria-hidden />

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
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
