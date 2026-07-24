import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { InvitaForm } from "./InvitaForm";
import { PermisosEditor } from "./PermisosEditor";

type Membre = {
  id: string;
  nom: string | null;
  email: string | null;
  rol: string;
  permisos: string[] | null;
};

const ROL_LABEL: Record<string, string> = {
  tecnic: "Tècnic",
  tenant_admin: "Administrador",
  user: "Empleat",
};

export default async function EquipPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfilActual } = await supabase
    .from("profiles")
    .select("tenant_id, rol")
    .eq("id", user!.id)
    .single();

  const potGestionar = perfilActual?.rol === "tenant_admin" || perfilActual?.rol === "tecnic";

  const { data: membres } = await supabase
    .from("profiles")
    .select("id, nom, email, rol, permisos")
    .order("rol")
    .returns<Membre[]>();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Dashboard
        </Link>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Equip</h1>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        {!potGestionar ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No tens permisos per gestionar l&apos;equip.
          </p>
        ) : (
          <>
            <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Convida algú nou
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Rebrà un email amb un enllaç per establir la seva contrasenya.
              </p>
              <div className="mt-4">
                <InvitaForm />
              </div>
            </section>

            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Membres de l&apos;equip
              </h2>
              <ul className="flex flex-col gap-3">
                {(membres ?? []).map((m) => (
                  <li
                    key={m.id}
                    className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
                  >
                    <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {m.nom ?? m.email ?? "Sense nom"}
                      <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {ROL_LABEL[m.rol] ?? m.rol}
                      </span>
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{m.email}</p>
                    {m.rol === "user" && (
                      <PermisosEditor profileId={m.id} permisosInicials={m.permisos ?? []} />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
