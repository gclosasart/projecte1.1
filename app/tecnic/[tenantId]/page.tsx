import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { DetallsForm } from "./DetallsForm";
import { NotesTenant } from "./NotesTenant";
import { MembreActions } from "./MembreActions";

type Membre = {
  id: string;
  nom: string | null;
  email: string | null;
  rol: string;
};

export default async function DetallTenantPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const supabase = await createClient();
  const t = await getDict();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfilActual } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user!.id)
    .single();

  if (perfilActual?.rol !== "tecnic") {
    return (
      <div className="flex flex-1 flex-col bg-rose-50 dark:bg-black">
        <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.tecnic.nomesPerTecnic}</p>
        </main>
      </div>
    );
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, nom_comercial, rao_social, nif, especificacions, quota_mensual")
    .eq("id", tenantId)
    .single();

  if (!tenant) {
    notFound();
  }

  const { data: membres } = await supabase
    .from("profiles")
    .select("id, nom, email, rol")
    .eq("tenant_id", tenantId)
    .order("rol")
    .returns<Membre[]>();

  const { data: notes } = await supabase
    .from("notes_tenant")
    .select("id, contingut, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col bg-rose-50 dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5">
        <Link
          href="/tecnic"
          className="text-5xl leading-none font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
        >
          ←
        </Link>
        <h1 className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
          {tenant.nom_comercial}
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-8 px-6 py-10">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.tecnic.detall.vistaNomesGestio}</p>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.tecnic.detall.equip}
          </h2>
          {!membres || membres.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.tecnic.detall.capMembre}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {membres.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-black/5 bg-white shadow-sm p-3 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {m.nom ?? m.email ?? t.tecnic.detall.senseNom}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{m.email}</p>
                  </div>
                  <MembreActions
                    tenantId={tenantId}
                    profileId={m.id}
                    email={m.email}
                    rolActual={m.rol}
                    textos={t.tecnic.detall}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t.tecnic.detall.especificacionsIQuota}
          </h2>
          <div className="mt-4">
            <DetallsForm
              tenantId={tenantId}
              especificacionsInicials={tenant.especificacions}
              quotaInicial={tenant.quota_mensual}
              textos={t.tecnic.detall}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t.tecnic.detall.notes}
          </h2>
          <div className="mt-4">
            <NotesTenant tenantId={tenantId} notes={notes ?? []} textos={t.tecnic.detall} />
          </div>
        </section>
      </main>
    </div>
  );
}
