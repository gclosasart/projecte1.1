import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDict, getIdioma } from "@/lib/i18n";
import { GeneraEsborranysButton } from "./GeneraEsborranysButton";
import { AccionsFacturaPlataforma } from "./AccionsFacturaPlataforma";
import { BackButton } from "@/app/BackButton";

type FacturaPlataforma = {
  id: string;
  numero: number | null;
  periode_any: number;
  periode_mes: number;
  base_imposable: number;
  iva_percent: number;
  total: number;
  estat: string;
  tenants: { nom_comercial: string } | null;
};

const ESTAT_ESTIL: Record<string, string> = {
  esborrany: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  pendent: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  pagada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "anul·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function TecnicFacturesPage() {
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

  const { data: factures } = await supabase
    .from("factures_plataforma")
    .select(
      "id, numero, periode_any, periode_mes, base_imposable, iva_percent, total, estat, tenants(nom_comercial)",
    )
    .order("created_at", { ascending: false })
    .returns<FacturaPlataforma[]>();

  return (
    <div className="flex flex-1 flex-col bg-office-blur dark:bg-black">
      <header className="flex flex-wrap items-center gap-4 px-6 py-5">
        <BackButton href="/tecnic" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.tecnicFactures.titol}
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-6 py-10">
        <GeneraEsborranysButton idioma={idioma} />

        {!factures || factures.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.tecnicFactures.capFactura}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {factures.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white shadow-sm p-4 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none"
              >
                <Link href={`/factures/plataforma/${f.id}`} className="min-w-0 flex-1 hover:underline">
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {f.tenants?.nom_comercial ?? t.tecnicFactures.tenantDesconegut}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_ESTIL[f.estat] ?? ""}`}
                    >
                      {t.comu.estats[f.estat] ?? f.estat}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t.tecnicFactures.periode(f.periode_mes, f.periode_any)}
                    {f.numero != null && ` · ${t.tecnicFactures.numero(f.numero)}`}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t.tecnicFactures.basePrefix(String(f.base_imposable), String(f.iva_percent))}
                    <strong>{f.total} €</strong>
                  </p>
                </Link>

                <AccionsFacturaPlataforma id={f.id} estat={f.estat} idioma={idioma} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
