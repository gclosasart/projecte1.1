import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DetallsForm } from "./DetallsForm";
import { NotesTenant } from "./NotesTenant";

type Membre = {
  id: string;
  nom: string | null;
  email: string | null;
  rol: string;
};

const ROL_LABEL: Record<string, string> = {
  tenant_admin: "Administrador",
  user: "Empleat",
};

export default async function DetallTenantPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const supabase = await createClient();

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
      <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
        <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Aquesta pantalla és només per al tècnic.
          </p>
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
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/tecnic" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Panell de tècnic
        </Link>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          {tenant.nom_comercial}
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Vista només de gestió — no s&apos;hi veuen ni s&apos;hi toquen les reserves, clients o
          factures reals d&apos;aquest tenant.
        </p>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Equip
          </h2>
          {!membres || membres.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Aquest tenant encara no té ningú a l&apos;equip.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {membres.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-950"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {m.nom ?? m.email ?? "Sense nom"}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{m.email}</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {ROL_LABEL[m.rol] ?? m.rol}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Especificacions i quota
          </h2>
          <div className="mt-4">
            <DetallsForm
              tenantId={tenantId}
              especificacionsInicials={tenant.especificacions}
              quotaInicial={tenant.quota_mensual}
            />
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Notes</h2>
          <div className="mt-4">
            <NotesTenant tenantId={tenantId} notes={notes ?? []} />
          </div>
        </section>
      </main>
    </div>
  );
}
