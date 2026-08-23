"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { dictDe, type Idioma } from "@/lib/i18n/client";
import { crearReserva, type NovaReservaState } from "./actions";
import { calcularPreusBase, generarDates, type CondicioTipus } from "./recurrencia";

type Recurs = {
  id: string;
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: "hora" | "dia";
  quantitat: number;
};

type Client = {
  id: string;
  nom: string;
  nif: string | null;
  email: string | null;
};

const ESTAT_INICIAL: NovaReservaState = { error: null, conflictes: null, exit: null };

export function NovaReservaForm({
  recursos,
  clients,
  idioma,
}: {
  recursos: Recurs[];
  clients: Client[];
  idioma: Idioma;
}) {
  const t = dictDe(idioma).reservaNova;
  const [state, formAction, pending] = useActionState<NovaReservaState, FormData>(
    crearReserva,
    ESTAT_INICIAL,
  );

  const [recursIds, setRecursIds] = useState<string[]>(recursos[0] ? [recursos[0].id] : []);
  const recursosSeleccionats = recursos.filter((r) => recursIds.includes(r.id));

  function toggleRecurs(id: string) {
    setRecursIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  const [clientMode, setClientMode] = useState<"existent" | "nou">("existent");
  const [clientQuery, setClientQuery] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const clientsFiltrats = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.nif?.toLowerCase().includes(q),
    );
  }, [clients, clientQuery]);

  const [tipus, setTipus] = useState<"puntual" | "recurrent">("puntual");
  const [dataInici, setDataInici] = useState("");
  const [horaInici, setHoraInici] = useState("09:00");
  const [horaFi, setHoraFi] = useState("10:00");

  const [diesSetmana, setDiesSetmana] = useState<number[]>([]);
  const [condicioTipus, setCondicioTipus] = useState<CondicioTipus>("data");
  const [condicioData, setCondicioData] = useState("");
  const [condicioSessions, setCondicioSessions] = useState("4");
  const [modelPreu, setModelPreu] = useState<"per_ocurrencia" | "abonament_fix">("per_ocurrencia");
  const [preuAbonament, setPreuAbonament] = useState("");

  function toggleDia(num: number) {
    setDiesSetmana((prev) => (prev.includes(num) ? prev.filter((d) => d !== num) : [...prev, num]));
  }

  const datesPrevistes = useMemo(() => {
    if (!dataInici) return [];
    if (tipus === "puntual") return [dataInici];
    return generarDates({
      dataInici,
      diesNum: diesSetmana,
      condicioTipus,
      dataFi: condicioData || undefined,
      numSessions: condicioSessions ? Number(condicioSessions) : undefined,
    });
  }, [tipus, dataInici, diesSetmana, condicioTipus, condicioData, condicioSessions]);

  const preusPrevistos = useMemo(() => {
    if (recursosSeleccionats.length === 0 || datesPrevistes.length === 0 || horaInici >= horaFi) return [];
    return calcularPreusBase({
      dates: datesPrevistes,
      recursos: recursosSeleccionats.map((r) => ({ preu: r.preu, unitat_preu: r.unitat_preu })),
      horaInici,
      horaFi,
      modelPreu: tipus === "recurrent" ? modelPreu : "per_ocurrencia",
      preuAbonament: preuAbonament ? Number(preuAbonament) : undefined,
    });
  }, [recursosSeleccionats, datesPrevistes, horaInici, horaFi, tipus, modelPreu, preuAbonament]);

  const totalPrevist = preusPrevistos.reduce((acc, p) => acc + p, 0);

  if (state.exit) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
          {t.reservaCreada(state.exit.numOcurrencies)}
        </p>
        <Link
          href="/reserves/gestio"
          className="mt-4 inline-block rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
        >
          {t.veuReserves}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {/* Recurs */}
      <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t.pas1Recursos}</h2>
        {recursos.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.capRecursActiu}{" "}
            <Link href="/recursos/nou" className="underline">
              {t.creaPrimerRecurs}
            </Link>
            .
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {recursos.map((r) => (
              <label
                key={r.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${recursIds.includes(r.id) ? "border-rose-600 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/20" : "border-black/10 dark:border-white/10"}`}
              >
                <input
                  type="checkbox"
                  name="recurs_ids"
                  value={r.id}
                  checked={recursIds.includes(r.id)}
                  onChange={() => toggleRecurs(r.id)}
                />
                <span className="text-zinc-950 dark:text-zinc-50">
                  {r.nom} — {t.personesCurt(r.capacitat ?? 0)} — {r.preu} €/
                  {r.unitat_preu === "hora" ? "h" : t.perDiaCurt}
                  {r.quantitat > 1 ? ` — ${t.unitatsCurt(r.quantitat)}` : ""}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Client */}
      <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t.pas2Client}</h2>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setClientMode("existent")}
            className={`rounded-full px-3 py-1 text-sm font-medium ${clientMode === "existent" ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-white" : "bg-rose-100 text-rose-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
          >
            {t.clientExistent}
          </button>
          <button
            type="button"
            onClick={() => setClientMode("nou")}
            className={`rounded-full px-3 py-1 text-sm font-medium ${clientMode === "nou" ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-white" : "bg-rose-100 text-rose-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
          >
            {t.creaClientNou}
          </button>
        </div>

        {clientMode === "existent" ? (
          <div className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="client_mode" value="existent" />
            <input type="hidden" name="client_id" value={clientId} />
            <input
              type="text"
              placeholder={t.cercaClient}
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <div className="max-h-40 overflow-y-auto rounded-lg border border-black/10 dark:border-white/10">
              {clientsFiltrats.length === 0 ? (
                <p className="p-3 text-sm text-zinc-500 dark:text-zinc-400">{t.capClientTrobat}</p>
              ) : (
                clientsFiltrats.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setClientId(c.id)}
                    className={`block w-full px-3 py-2 text-left text-sm ${clientId === c.id ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-white" : "hover:bg-rose-50 dark:hover:bg-zinc-900"}`}
                  >
                    {c.nom} {c.nif ? `· ${c.nif}` : ""} {c.email ? `· ${c.email}` : ""}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="client_mode" value="nou" />
            <input
              name="client_nom"
              placeholder={t.nomClientPlaceholder}
              required={clientMode === "nou"}
              autoComplete="off"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <input
              name="client_nif"
              placeholder={t.nifPlaceholder}
              autoComplete="off"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <input
              name="client_email"
              type="email"
              placeholder={t.emailPlaceholder}
              autoComplete="off"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <input
              name="client_adreca"
              placeholder={t.adrecaPlaceholder}
              autoComplete="off"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        )}
      </section>

      {/* Puntual / Recurrent */}
      <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t.pas3Quan}</h2>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTipus("puntual")}
            className={`rounded-full px-3 py-1 text-sm font-medium ${tipus === "puntual" ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-white" : "bg-rose-100 text-rose-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
          >
            {t.puntual}
          </button>
          <button
            type="button"
            onClick={() => setTipus("recurrent")}
            className={`rounded-full px-3 py-1 text-sm font-medium ${tipus === "recurrent" ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-white" : "bg-rose-100 text-rose-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
          >
            {t.recurrent}
          </button>
        </div>
        <input type="hidden" name="tipus" value={tipus} />

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {tipus === "puntual" ? t.data : t.dataInici}
            </label>
            <input
              type="date"
              name="data_inici"
              value={dataInici}
              onChange={(e) => setDataInici(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              required
              className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.horaInici}</label>
            <input
              type="time"
              name="hora_inici"
              value={horaInici}
              onChange={(e) => setHoraInici(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              required
              className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.horaFi}</label>
            <input
              type="time"
              name="hora_fi"
              value={horaFi}
              onChange={(e) => setHoraFi(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              required
              className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        {tipus === "recurrent" && (
          <div className="mt-5 flex flex-col gap-4 border-t border-black/5 pt-4 dark:border-white/5">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.frequencia}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {t.diesSetmana.map((d) => (
                  <label
                    key={d.num}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm ${diesSetmana.includes(d.num) ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-white" : "bg-rose-100 text-rose-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
                  >
                    <input
                      type="checkbox"
                      name="dies"
                      value={d.num}
                      checked={diesSetmana.includes(d.num)}
                      onChange={() => toggleDia(d.num)}
                      className="sr-only"
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.condicioFinal}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="condicio_tipus"
                    value="data"
                    checked={condicioTipus === "data"}
                    onChange={() => setCondicioTipus("data")}
                  />
                  {t.dataConcreta}
                  <input
                    type="date"
                    name="condicio_data"
                    value={condicioData}
                    onChange={(e) => setCondicioData(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    disabled={condicioTipus !== "data"}
                    className="cursor-pointer rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-zinc-950 outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="condicio_tipus"
                    value="sessions"
                    checked={condicioTipus === "sessions"}
                    onChange={() => setCondicioTipus("sessions")}
                  />
                  {t.numSessions}
                  <input
                    type="number"
                    name="condicio_sessions"
                    min={1}
                    value={condicioSessions}
                    onChange={(e) => setCondicioSessions(e.target.value)}
                    disabled={condicioTipus !== "sessions"}
                    className="w-20 rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-zinc-950 outline-none disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="condicio_tipus"
                    value="obert"
                    checked={condicioTipus === "obert"}
                    onChange={() => setCondicioTipus("obert")}
                  />
                  {t.finsCancelacioLabel}
                </label>
              </div>
              {condicioTipus === "obert" && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t.avisObert}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.modelDePreu}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="model_preu"
                    value="per_ocurrencia"
                    checked={modelPreu === "per_ocurrencia"}
                    onChange={() => setModelPreu("per_ocurrencia")}
                  />
                  {t.preuPerOcurrencia}
                </label>
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="model_preu"
                    value="abonament_fix"
                    checked={modelPreu === "abonament_fix"}
                    onChange={() => setModelPreu("abonament_fix")}
                  />
                  {t.abonamentFixMensual}
                  <input
                    type="number"
                    name="preu_abonament"
                    min={0}
                    step="0.01"
                    placeholder={t.perMesPlaceholder}
                    value={preuAbonament}
                    onChange={(e) => setPreuAbonament(e.target.value)}
                    disabled={modelPreu !== "abonament_fix"}
                    className="w-24 rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-zinc-950 outline-none disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Previsualització */}
      <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t.pas4Previsualitzacio}</h2>
        {datesPrevistes.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t.ompleData}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {t.ocurrenciesGenerades(datesPrevistes.length)}
              {datesPrevistes.slice(0, 6).join(", ")}
              {datesPrevistes.length > 6 ? "…" : ""}
            </p>
            {preusPrevistos.length > 0 && (
              <p className="mt-1 text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {t.importTotalEstimat(totalPrevist.toFixed(2))}
              </p>
            )}
          </>
        )}

        {state.conflictes && state.conflictes.length > 0 && (
          <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {t.conflicteHorari(state.conflictes.join(", "))}
          </div>
        )}
        {state.error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending || recursos.length === 0}
          className="mt-4 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
        >
          {pending ? t.creant : t.confirmaReserva}
        </button>
      </section>
    </form>
  );
}
