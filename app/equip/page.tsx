import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { InvitaForm } from "./InvitaForm";
import { PermisosEditor } from "./PermisosEditor";
import { BackButton } from "@/app/BackButton";

type Membre = {
  id: string;
  nom: string | null;
  email: string | null;
  rol: string;
  permisos: string[] | null;
};

export default async function EquipPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();
  const ROL_LABEL: Record<string, string> = {
    tecnic: t.equip.rolTecnic,
    tenant_admin: t.equip.rolAdmin,
    user: t.equip.rolEmpleat,
  };

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
    <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5">
        <BackButton href="/dashboard" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.equip.titol}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-10">
        {!potGestionar ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.equip.sensePermisos}</p>
        ) : (
          <>
            <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {t.equip.convidaAlguNou}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t.equip.rebraEmail}</p>
              <div className="mt-4">
                <InvitaForm idioma={idioma} />
              </div>
            </section>

            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t.equip.membresDeLEquip}
              </h2>
              <ul className="flex flex-col gap-3">
                {(membres ?? []).map((m) => (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-black/5 bg-white shadow-sm p-4 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none"
                  >
                    <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {m.nom ?? m.email ?? t.equip.senseNom}
                      <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {ROL_LABEL[m.rol] ?? m.rol}
                      </span>
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{m.email}</p>
                    {m.rol === "user" && (
                      <PermisosEditor
                        profileId={m.id}
                        permisosInicials={m.permisos ?? []}
                        idioma={idioma}
                      />
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
