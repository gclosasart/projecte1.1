import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { marcarPagada } from "./actions";

type Factura = {
  id: string;
  numero: number;
  data_emissio: string;
  base_imposable: number;
  iva_percent: number;
  total: number;
  estat: string;
  ocurrencies: {
    data: string;
    reserves: {
      recursos: { nom: string } | null;
      clients: { nom: string } | null;
    } | null;
  } | null;
};

const ESTAT_ESTIL: Record<string, string> = {
  pendent:
    "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  pagada:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "anul·lada":
    "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function FacturesPage() {
  const supabase = await createClient();

  const { data: factures } = await supabase
    .from("factures")
    .select(
      "id, numero, data_emissio, base_imposable, iva_percent, total, estat, ocurrencies(data, reserves(recursos(nom), clients(nom)))",
    )
    .order("numero", { ascending: false })
    .returns<Factura[]>();

  return (
    <div className="flex flex-1 flex-col bg-sky-50 dark:bg-black">
      <header className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Dashboard
        </Link>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Factures</h1>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {!factures || factures.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Encara no s&apos;ha generat cap factura.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {factures.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    Factura #{f.numero}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-normal ${ESTAT_ESTIL[f.estat] ?? ""}`}
                    >
                      {f.estat}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {f.ocurrencies?.reserves?.clients?.nom ?? "Client desconegut"} ·{" "}
                    {f.ocurrencies?.reserves?.recursos?.nom ?? "Recurs desconegut"} ·{" "}
                    {f.ocurrencies?.data ?? f.data_emissio}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Base {f.base_imposable} € + IVA {f.iva_percent}% = <strong>{f.total} €</strong>
                  </p>
                </div>

                {f.estat === "pendent" && (
                  <form action={marcarPagada.bind(null, f.id)}>
                    <button
                      type="submit"
                      className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
                    >
                      Marca com a pagada
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
