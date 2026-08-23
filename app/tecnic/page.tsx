import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { SelectorIdioma } from "../SelectorIdioma";
import { signOut } from "@/app/dashboard/actions";
import { CreaTenantForm } from "./CreaTenantForm";
import { ConvidaAdminInline } from "./ConvidaAdminInline";
import { DeleteTenantInline } from "./DeleteTenantInline";

type Tenant = {
  id: string;
  nom_comercial: string;
  rao_social: string | null;
  nif: string | null;
  quota_mensual: number | null;
  created_at: string;
};

export default async function TecnicPage() {
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

  if (profile?.rol !== "tecnic") {
    return (
      <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
        <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.tecnic.nomesPerTecnic}</p>
        </main>
      </div>
    );
  }

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, nom_comercial, rao_social, nif, quota_mensual, created_at")
    .order("created_at", { ascending: false })
    .returns<Tenant[]>();

  const { data: totsElsPerfils } = await supabase
    .from("profiles")
    .select("tenant_id, rol")
    .not("tenant_id", "is", null);

  const admins = new Map<string, number>();
  const staff = new Map<string, number>();
  for (const p of totsElsPerfils ?? []) {
    if (!p.tenant_id) continue;
    staff.set(p.tenant_id, (staff.get(p.tenant_id) ?? 0) + 1);
    if (p.rol === "tenant_admin") {
      admins.set(p.tenant_id, (admins.get(p.tenant_id) ?? 0) + 1);
    }
  }

  const { data: totsElsRecursos } = await supabase
    .from("recursos")
    .select("tenant_id")
    .eq("actiu", true);

  const recursosPerTenant = new Map<string, number>();
  for (const r of totsElsRecursos ?? []) {
    recursosPerTenant.set(r.tenant_id, (recursosPerTenant.get(r.tenant_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.tecnic.titol}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/plataforma"
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            {t.comu.plataforma}
          </Link>
          <Link
            href="/tecnic/factures"
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            {t.nav.factures}
          </Link>
          <SelectorIdioma actual={idioma} textos={t.comu.idiomes} />
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
            >
              {t.comu.surt}
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
        <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t.tecnic.creaTenantNou}
          </h2>
          <div className="mt-4">
            <CreaTenantForm idioma={idioma} />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.tecnic.tenants(tenants?.length ?? 0)}
          </h2>
          {!tenants || tenants.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.tecnic.capTenant}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {tenants.map((tn) => (
                <li
                  key={tn.id}
                  className="rounded-2xl border border-black/5 bg-white shadow-sm p-4 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link href={`/tecnic/${tn.id}`} className="min-w-0 flex-1 hover:underline">
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                        {tn.nom_comercial}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {[tn.rao_social, tn.nif].filter(Boolean).join(" · ") || t.tecnic.senseDadesFiscals}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                        {t.tecnic.persones(staff.get(tn.id) ?? 0)}
                        {(admins.get(tn.id) ?? 0) === 0 && t.tecnic.senseAdmin}
                        {" · "}
                        {t.tecnic.recursosActius(recursosPerTenant.get(tn.id) ?? 0)}
                        {tn.quota_mensual != null && t.tecnic.perMes(tn.quota_mensual)}
                      </p>
                    </Link>
                    <div className="flex items-center gap-3">
                      <ConvidaAdminInline tenantId={tn.id} idioma={idioma} />
                      <DeleteTenantInline tenantId={tn.id} idioma={idioma} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
