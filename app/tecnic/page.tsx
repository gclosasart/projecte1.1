import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreaTenantForm } from "./CreaTenantForm";
import { ConvidaAdminInline } from "./ConvidaAdminInline";

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
      <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
        <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Aquesta pantalla és només per al tècnic.
          </p>
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
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Dashboard
        </Link>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Panell de tècnic
        </h1>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Crea un tenant nou
          </h2>
          <div className="mt-4">
            <CreaTenantForm />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Tenants ({tenants?.length ?? 0})
          </h2>
          {!tenants || tenants.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Encara no hi ha cap tenant.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {tenants.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link href={`/tecnic/${t.id}`} className="min-w-0 flex-1 hover:underline">
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                        {t.nom_comercial}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {[t.rao_social, t.nif].filter(Boolean).join(" · ") || "Sense dades fiscals"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                        {staff.get(t.id) ?? 0} persones a l&apos;equip
                        {(admins.get(t.id) ?? 0) === 0 && " (sense administrador)"}
                        {" · "}
                        {recursosPerTenant.get(t.id) ?? 0} recursos actius
                        {t.quota_mensual != null && ` · ${t.quota_mensual} €/mes`}
                      </p>
                    </Link>
                    <ConvidaAdminInline tenantId={t.id} />
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
