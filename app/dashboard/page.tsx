import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

type OcurrenciaAmbReserva = {
  id: string;
  data: string;
  hora_inici: string;
  hora_fi: string;
  reserves: {
    recursos: { nom: string } | null;
    clients: { nom: string } | null;
  } | null;
};

const MODUL_PER_ENLLAÇ: Record<string, string> = {
  Reserves: "reserves",
  Calendari: "reserves",
  Recursos: "recursos",
  Clients: "clients",
  Factures: "factures",
};

const ENLLACOS = [
  { label: "Reserves", href: "/reserves" },
  { label: "Calendari", href: "/calendari" },
  { label: "Recursos", href: "/recursos" },
  { label: "Clients", href: "/clients" },
  { label: "Factures", href: "/factures" },
];

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function potAccedir(rol: string, permisos: string[], modul: string) {
  if (rol === "tecnic" || rol === "tenant_admin") return true;
  return permisos.includes(modul);
}

function OcurrenciaItem({ oc }: { oc: OcurrenciaAmbReserva }) {
  const recurs = oc.reserves?.recursos?.nom ?? "Recurs desconegut";
  const client = oc.reserves?.clients?.nom ?? "Client desconegut";
  return (
    <li className="flex items-center justify-between border-b border-black/5 py-2 text-sm last:border-0 dark:border-white/5">
      <span className="text-zinc-900 dark:text-zinc-100">
        {recurs} — {client}
      </span>
      <span className="text-zinc-500 dark:text-zinc-400">
        {oc.hora_inici.slice(0, 5)}–{oc.hora_fi.slice(0, 5)}
      </span>
    </li>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, rol, permisos, tenants(nom_comercial)")
    .eq("id", user!.id)
    .single();

  const rol = profile?.rol ?? "user";
  const permisos = (profile?.permisos as string[] | null) ?? [];
  const tenantNom = (profile?.tenants as unknown as { nom_comercial: string } | null)
    ?.nom_comercial;

  const avui = new Date();
  const finSetmana = new Date(avui);
  finSetmana.setDate(avui.getDate() + 6);
  const avuiISO = toISODate(avui);
  const finSetmanaISO = toISODate(finSetmana);

  const { data: ocurrencies } = await supabase
    .from("ocurrencies")
    .select("id, data, hora_inici, hora_fi, reserves(recursos(nom), clients(nom))")
    .eq("estat", "activa")
    .gte("data", avuiISO)
    .lte("data", finSetmanaISO)
    .order("data")
    .order("hora_inici")
    .returns<OcurrenciaAmbReserva[]>();

  const deAvui = ocurrencies?.filter((oc) => oc.data === avuiISO) ?? [];
  const restaSetmana = ocurrencies?.filter((oc) => oc.data !== avuiISO) ?? [];

  const enllaçosVisibles = ENLLACOS.filter((e) =>
    potAccedir(rol, permisos, MODUL_PER_ENLLAÇ[e.label]),
  );

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <div>
          <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
            {tenantNom ?? "Plataforma"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {profile?.nom ?? user?.email} · {rol}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(rol === "tenant_admin" || rol === "tecnic") && (
            <>
              <Link
                href="/configuracio"
                className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Empresa
              </Link>
              <Link
                href="/equip"
                className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Equip
              </Link>
            </>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
            >
              Tanca sessió
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Accessos directes
          </h2>
          <div className="flex flex-wrap gap-3">
            {enllaçosVisibles.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
              >
                {e.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Reserves d&apos;avui
            </h2>
            {deAvui.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                Cap reserva avui.
              </p>
            ) : (
              <ul className="mt-3">
                {deAvui.map((oc) => (
                  <OcurrenciaItem key={oc.id} oc={oc} />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Resta de la setmana
            </h2>
            {restaSetmana.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                Cap reserva més aquesta setmana.
              </p>
            ) : (
              <ul className="mt-3">
                {restaSetmana.map((oc) => (
                  <OcurrenciaItem key={oc.id} oc={oc} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
