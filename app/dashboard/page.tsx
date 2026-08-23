import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { NotesDelDia } from "./NotesDelDia";
import { ForecastChart } from "./ForecastChart";
import { NavSecundariaPills, NavSecundariaMenu } from "./NavSecundaria";
import { AccionsCapcaleraDesktop, AccionsCapcaleraMobil } from "./AccionsCapcalera";

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
  { navKey: "gestionaReserves", href: "/reserves/gestio", modul: "reserves" },
  { navKey: "calendari", href: "/calendari", modul: "reserves" },
  { navKey: "planning", href: "/planning", modul: "reserves" },
  { navKey: "recursos", href: "/recursos", modul: "recursos" },
  { navKey: "clients", href: "/clients", modul: "clients" },
  { navKey: "factures", href: "/factures", modul: "factures" },
] as const;


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
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
      <p className="text-3xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">{valor}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{etiqueta}</p>
    </div>
  );
}

function StatLinkTile({ href, etiqueta }: { href: string; etiqueta: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-black/5 bg-white shadow-sm p-5 transition-colors hover:border-rose-600 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none dark:hover:border-rose-500"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white transition-transform group-hover:translate-x-0.5 dark:bg-rose-500">
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
          <path
            d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{etiqueta}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getDict();
  const idioma = await getIdioma();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, rol, permisos, tenant_id")
    .eq("id", user!.id)
    .single();

  const rol = profile?.rol ?? "user";

  // El tècnic no té cap tenant propi: el dashboard operatiu no li diu res.
  if (rol === "tecnic") {
    redirect("/tecnic");
  }

  const permisos = (profile?.permisos as string[] | null) ?? [];
  const potNovaReserva = potAccedir(rol, permisos, "reserves");
  const accionsCompte = [
    ...(rol === "tecnic" ? [{ href: "/tecnic", label: t.nav.panellTecnic }] : []),
    ...(rol === "tenant_admin" || rol === "tecnic"
      ? [
          { href: "/configuracio", label: t.nav.empresa },
          { href: "/equip", label: t.nav.equip },
        ]
      : []),
  ];

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

  // Bloc 5: llista negra (només lectura, per als qui tenen accés a Clients)
  const potClients = potAccedir(rol, permisos, "clients");
  const { data: llistaNegraRaw } = potClients
    ? await supabase.from("llista_negra").select("id, nif, nom").order("nif")
    : { data: [] as { id: string; nif: string; nom: string | null }[] };

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
    const label = `${t.comu.diesCurts[d.getDay()]} ${d.getDate()}`;
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
    <div className="flex flex-1 flex-col bg-rose-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-10 px-6 py-10">
        {/* Salutació + accions de compte */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                {t.dashboard.bonDia(profile?.nom)}
              </h1>
              <AccionsCapcaleraMobil
                items={accionsCompte}
                idioma={idioma}
                textosIdiomes={t.comu.idiomes}
                tancaSessio={t.comu.surt}
                menuLabel={t.comu.compte}
              />
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t.dashboard.situacioAvui}
            </p>
          </div>
          <AccionsCapcaleraDesktop
            items={accionsCompte}
            idioma={idioma}
            textosIdiomes={t.comu.idiomes}
            tancaSessio={t.comu.surt}
          />
        </section>

        {/* Mòbil: Nova reserva + menú de seccions */}
        <div className="flex w-full items-center justify-between gap-3 sm:hidden">
          {potNovaReserva && (
            <Link
              href="/reserves/nova"
              className="rounded-full bg-rose-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
            >
              {t.dashboard.novaReserva}
            </Link>
          )}
          <NavSecundariaMenu
            items={SECUNDARIS.filter((e) => potAccedir(rol, permisos, e.modul)).map((e) => ({
              href: e.href,
              label: t.nav[e.navKey],
            }))}
            menuLabel={t.comu.menu}
          />
        </div>

        {/* Escriptori: Nova reserva al costat de la navegació secundària */}
        <div className="hidden items-center gap-4 sm:flex">
          {potNovaReserva && (
            <Link
              href="/reserves/nova"
              className="rounded-full bg-rose-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
            >
              {t.dashboard.novaReserva}
            </Link>
          )}
          <NavSecundariaPills
            items={SECUNDARIS.filter((e) => potAccedir(rol, permisos, e.modul)).map((e) => ({
              href: e.href,
              label: t.nav[e.navKey],
            }))}
          />
        </div>

        {/* Bloc 1: situació d'avui */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.dashboard.situacioDelDia}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile valor={comencenAvui} etiqueta={t.dashboard.comencenReserves} />
            <StatTile valor={recursosReservatsAvui} etiqueta={t.dashboard.recursosReservats} />
            <StatTile valor={ocupatsAraMateix} etiqueta={t.dashboard.ocupatsAraMateix} />
            {potAccedir(rol, permisos, "reserves") && (
              <StatLinkTile href="/disponibilitat" etiqueta={t.dashboard.disponibilitat} />
            )}
          </div>
        </section>

        <div className="grid min-w-0 gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0 flex flex-col gap-10">
            {/* Bloc 2: taula de reserves d'avui */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t.dashboard.reservesAvui}
              </h2>
              {!ocurrenciesAvui || ocurrenciesAvui.length === 0 ? (
                <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-8 text-center dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.dashboard.capReservaAvui}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                        <th className="px-4 py-3 font-medium">{t.dashboard.client}</th>
                        <th className="px-4 py-3 font-medium">{t.dashboard.recurs}</th>
                        <th className="px-4 py-3 font-medium">{t.dashboard.hora}</th>
                        <th className="px-4 py-3 font-medium">{t.dashboard.estat}</th>
                        <th className="px-4 py-3 font-medium">{t.dashboard.factura}</th>
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
                                {t.comu.estats[oc.estat] ?? oc.estat}
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
                {t.dashboard.previsio7dies}
              </h2>
              <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-6 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
                <ForecastChart
                  dies={diesForecast}
                  textos={{
                    reservesNoves: t.dashboard.reservesNoves,
                    novesCurt: t.dashboard.novesCurt,
                    sessionsCurt: t.dashboard.sessionsCurt,
                    sessionsDelDia: t.dashboard.sessionsDelDia,
                    ocupacioEstimada: t.dashboard.ocupacioEstimada,
                    capActivitat: t.dashboard.capActivitatSetmana,
                  }}
                />
              </div>
            </section>
          </div>

          <div className="min-w-0 flex flex-col gap-10">
            {/* Bloc 3: notes del dia */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t.dashboard.notesDelDia}
              </h2>
              <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
                <NotesDelDia notes={notes} textos={{ ...t.notesDia, elimina: t.comu.elimina }} />
              </div>
            </section>

            {/* Bloc 5: llista negra */}
            {potClients && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {t.llistaNegra.titol}
                </h2>
                <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
                  {!llistaNegraRaw || llistaNegraRaw.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.llistaNegra.capEntrada}</p>
                  ) : (
                    <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
                      {llistaNegraRaw.map((e) => (
                        <li key={e.id} className="text-sm text-zinc-900 dark:text-zinc-100">
                          {e.nif} {e.nom ? t.llistaNegra.afegitPer(e.nom) : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/clients/llista-negra"
                    className="mt-3 inline-block text-sm font-medium text-rose-700 hover:underline dark:text-rose-400"
                  >
                    {t.llistaNegra.titol} →
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
