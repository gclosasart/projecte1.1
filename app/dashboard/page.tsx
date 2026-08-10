import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { NotesDelDia } from "./NotesDelDia";
import { ForecastChart } from "./ForecastChart";

type OcurrenciaAvui = {
  id: string;
  hora_inici: string;
  hora_fi: string;
  estat: string;
  reserves: {
    reserva_recursos: { recursos: { nom: string } | null }[];
    clients: { nom: string } | null;
  } | null;
};

type OcurrenciaSetmana = {
  data: string;
  reserves: { reserva_recursos: { recurs_id: string }[] } | null;
};

function nomsRecursosOcurrencia(oc: OcurrenciaAvui): string {
  const noms = (oc.reserves?.reserva_recursos ?? [])
    .map((rr) => rr.recursos?.nom)
    .filter((n): n is string => Boolean(n));
  return noms.length > 0 ? noms.join(" + ") : "—";
}

const SECUNDARIS = [
  { label: "Gestiona reserves", href: "/reserves/gestio", modul: "reserves" },
  { label: "Calendari", href: "/calendari", modul: "reserves" },
  { label: "Disponibilitat", href: "/disponibilitat", modul: "reserves" },
  { label: "Recursos", href: "/recursos", modul: "recursos" },
  { label: "Clients", href: "/clients", modul: "clients" },
  { label: "Factures", href: "/factures", modul: "factures" },
];

const DIES_CURTS = ["dg", "dl", "dt", "dc", "dj", "dv", "ds"];

const ESTAT_ESTIL: Record<string, string> = {
  activa: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  "cancel·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const FACTURA_ESTIL: Record<string, string> = {
  pendent: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  pagada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "anul·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function araHHMMSS(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function potAccedir(rol: string, permisos: string[], modul: string) {
  if (rol === "tecnic" || rol === "tenant_admin") return true;
  return permisos.includes(modul);
}

function StatTile({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <p className="text-3xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">{valor}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{etiqueta}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, rol, permisos, tenant_id, tenants(nom_comercial)")
    .eq("id", user!.id)
    .single();

  const rol = profile?.rol ?? "user";

  // El tècnic no té cap tenant propi: el dashboard operatiu no li diu res.
  if (rol === "tecnic") {
    redirect("/tecnic");
  }

  const permisos = (profile?.permisos as string[] | null) ?? [];
  const tenantNom = (profile?.tenants as unknown as { nom_comercial: string } | null)
    ?.nom_comercial;
  const potNovaReserva = potAccedir(rol, permisos, "reserves");

  const ara = new Date();
  const avui = new Date(ara);
  avui.setHours(0, 0, 0, 0);
  const avuiISO = toISODate(avui);
  const araStr = araHHMMSS(ara);

  const finSetmana = new Date(avui);
  finSetmana.setDate(avui.getDate() + 6);
  const finSetmanaISO = toISODate(finSetmana);

  // Bloc 1 i 2: ocurrències d'avui
  const { data: ocurrenciesAvui } = await supabase
    .from("ocurrencies")
    .select("id, hora_inici, hora_fi, estat, reserves(reserva_recursos(recursos(nom)), clients(nom))")
    .eq("data", avuiISO)
    .order("hora_inici")
    .returns<OcurrenciaAvui[]>();

  const ocIds = (ocurrenciesAvui ?? []).map((o) => o.id);
  const { data: facturesAvui } =
    ocIds.length > 0
      ? await supabase
          .from("factures")
          .select("id, ocurrencia_id, numero, estat")
          .in("ocurrencia_id", ocIds)
      : { data: [] as { id: string; ocurrencia_id: string; numero: number; estat: string }[] };

  const facturaPerOc = new Map((facturesAvui ?? []).map((f) => [f.ocurrencia_id, f]));

  const activesAvui = (ocurrenciesAvui ?? []).filter((o) => o.estat === "activa");
  const comencenAvui = activesAvui.filter((o) => o.hora_inici > araStr).length;
  const recursosReservatsAvui = activesAvui.length;
  const ocupatsAraMateix = activesAvui.filter(
    (o) => o.hora_inici <= araStr && o.hora_fi > araStr,
  ).length;

  // Bloc 3: notes del dia
  const { data: notesRaw } = await supabase
    .from("notes_dia")
    .select("id, contingut, fet, created_at, profiles(nom, email)")
    .eq("data", avuiISO)
    .order("created_at")
    .returns<
      { id: string; contingut: string; fet: boolean; created_at: string; profiles: { nom: string | null; email: string | null } | null }[]
    >();

  const notes = (notesRaw ?? []).map((n) => {
    const d = new Date(n.created_at);
    return {
      id: n.id,
      contingut: n.contingut,
      fet: n.fet,
      hora: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      autorNom: n.profiles?.nom ?? n.profiles?.email ?? null,
    };
  });

  // Bloc 4: previsió 7 dies
  const { data: reservesNoves } = await supabase
    .from("reserves")
    .select("data_inici")
    .gte("data_inici", avuiISO)
    .lte("data_inici", finSetmanaISO);

  const { data: ocurrenciesSetmana } = await supabase
    .from("ocurrencies")
    .select("data, reserves(reserva_recursos(recurs_id))")
    .eq("estat", "activa")
    .gte("data", avuiISO)
    .lte("data", finSetmanaISO)
    .returns<OcurrenciaSetmana[]>();

  const { count: totalRecursosActius } = await supabase
    .from("recursos")
    .select("id", { count: "exact", head: true })
    .eq("actiu", true);

  const novesPerDia = new Map<string, number>();
  for (const r of reservesNoves ?? []) {
    if (!r.data_inici) continue;
    novesPerDia.set(r.data_inici, (novesPerDia.get(r.data_inici) ?? 0) + 1);
  }

  const sessionsPerDia = new Map<string, number>();
  const recursosPerDia = new Map<string, Set<string>>();
  for (const o of ocurrenciesSetmana ?? []) {
    sessionsPerDia.set(o.data, (sessionsPerDia.get(o.data) ?? 0) + 1);
    const recursIds = o.reserves?.reserva_recursos.map((rr) => rr.recurs_id) ?? [];
    if (recursIds.length > 0) {
      const set = recursosPerDia.get(o.data) ?? new Set<string>();
      for (const rid of recursIds) set.add(rid);
      recursosPerDia.set(o.data, set);
    }
  }

  const diesForecast = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(avui);
    d.setDate(avui.getDate() + i);
    const iso = toISODate(d);
    const label = `${DIES_CURTS[d.getDay()]} ${d.getDate()}`;
    const ocupacioPercent =
      totalRecursosActius && totalRecursosActius > 0
        ? Math.round(((recursosPerDia.get(iso)?.size ?? 0) / totalRecursosActius) * 100)
        : null;
    return {
      label,
      comencen: novesPerDia.get(iso) ?? 0,
      sessions: sessionsPerDia.get(iso) ?? 0,
      ocupacioPercent,
    };
  });

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
          {rol === "tecnic" && (
            <Link
              href="/tecnic"
              className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
            >
              Panell de tècnic
            </Link>
          )}
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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
        {/* Acció principal + navegació secundària */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              Bon dia{profile?.nom ? `, ${profile.nom}` : ""}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Aquesta és la situació d&apos;avui al teu coworking.
            </p>
          </div>
          {potNovaReserva && (
            <Link
              href="/reserves/nova"
              className="rounded-full bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
            >
              + Nova reserva
            </Link>
          )}
        </section>

        <nav className="-mt-6 flex flex-wrap gap-2">
          {SECUNDARIS.filter((e) => potAccedir(rol, permisos, e.modul)).map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:border-sky-600 hover:text-sky-700 dark:border-white/10 dark:text-zinc-400 dark:hover:border-sky-500 dark:hover:text-sky-400"
            >
              {e.label}
            </Link>
          ))}
        </nav>

        {/* Bloc 1: situació d'avui */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Situació d&apos;avui
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile valor={comencenAvui} etiqueta="Reserves que comencen" />
            <StatTile valor={recursosReservatsAvui} etiqueta="Recursos reservats avui" />
            <StatTile valor={ocupatsAraMateix} etiqueta="Ocupats ara mateix" />
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-10">
            {/* Bloc 2: taula de reserves d'avui */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Reserves d&apos;avui
              </h2>
              {!ocurrenciesAvui || ocurrenciesAvui.length === 0 ? (
                <div className="rounded-xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-zinc-950">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Cap reserva per avui.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                        <th className="px-4 py-3 font-medium">Client</th>
                        <th className="px-4 py-3 font-medium">Recurs</th>
                        <th className="px-4 py-3 font-medium">Hora</th>
                        <th className="px-4 py-3 font-medium">Estat</th>
                        <th className="px-4 py-3 font-medium">Factura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ocurrenciesAvui.map((oc) => {
                        const factura = facturaPerOc.get(oc.id);
                        return (
                          <tr
                            key={oc.id}
                            className="border-b border-black/5 last:border-0 dark:border-white/5"
                          >
                            <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                              {oc.reserves?.clients?.nom ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                              {nomsRecursosOcurrencia(oc)}
                            </td>
                            <td className="px-4 py-3 tabular-nums text-zinc-500 dark:text-zinc-400">
                              {oc.hora_inici.slice(0, 5)}–{oc.hora_fi.slice(0, 5)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_ESTIL[oc.estat] ?? ""}`}
                              >
                                {oc.estat}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {factura ? (
                                <Link
                                  href="/factures"
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium hover:underline ${FACTURA_ESTIL[factura.estat] ?? ""}`}
                                >
                                  #{factura.numero}
                                </Link>
                              ) : (
                                <span className="text-zinc-400 dark:text-zinc-600">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Bloc 4: previsió */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Previsió dels propers 7 dies
              </h2>
              <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
                <ForecastChart dies={diesForecast} />
              </div>
            </section>
          </div>

          {/* Bloc 3: notes del dia */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Notes del dia
            </h2>
            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
              <NotesDelDia notes={notes} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
