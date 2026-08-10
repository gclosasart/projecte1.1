"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import {
  calcularPreusBase,
  generarDates,
  textCondicioFinal,
  textFrequencia,
  type CondicioTipus,
} from "./recurrencia";

export type NovaReservaState = {
  error: string | null;
  conflictes: string[] | null;
  exit: { numOcurrencies: number } | null;
};

const ESTAT_INICIAL: NovaReservaState = { error: null, conflictes: null, exit: null };

export async function crearReserva(
  _prevState: NovaReservaState,
  formData: FormData,
): Promise<NovaReservaState> {
  const t = await getDict();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  const tenant_id = profile?.tenant_id as string | null | undefined;
  if (!tenant_id) {
    return { ...ESTAT_INICIAL, error: t.recursos.errorSenseTenant };
  }

  const recurs_ids = formData.getAll("recurs_ids").filter((v): v is string => typeof v === "string" && v !== "");
  if (recurs_ids.length === 0) {
    return { ...ESTAT_INICIAL, error: t.reservaNova.errorSeleccionaRecurs };
  }

  const { data: recursos } = await supabase
    .from("recursos")
    .select("preu, unitat_preu")
    .in("id", recurs_ids);

  if (!recursos || recursos.length !== recurs_ids.length) {
    return { ...ESTAT_INICIAL, error: t.reservaNova.errorRecursTrobat };
  }

  let client_id: string;
  const clientMode = formData.get("client_mode");

  if (clientMode === "nou") {
    const nom = formData.get("client_nom");
    if (typeof nom !== "string" || !nom.trim()) {
      return { ...ESTAT_INICIAL, error: t.reservaNova.errorNomClientObligatori };
    }
    const nif = formData.get("client_nif");
    const email = formData.get("client_email");
    const adreca = formData.get("client_adreca");

    const { data: novClient, error: errClient } = await supabase
      .from("clients")
      .insert({
        tenant_id,
        nom: nom.trim(),
        nif: typeof nif === "string" && nif.trim() ? nif.trim() : null,
        email: typeof email === "string" && email.trim() ? email.trim() : null,
        adreca: typeof adreca === "string" && adreca.trim() ? adreca.trim() : null,
      })
      .select("id")
      .single();

    if (errClient || !novClient) {
      return { ...ESTAT_INICIAL, error: t.reservaNova.errorCrearClient };
    }
    client_id = novClient.id;
  } else {
    const existentId = formData.get("client_id");
    if (typeof existentId !== "string" || !existentId) {
      return { ...ESTAT_INICIAL, error: t.reservaNova.errorSeleccionaClient };
    }
    client_id = existentId;
  }

  const tipus = formData.get("tipus");
  if (tipus !== "puntual" && tipus !== "recurrent") {
    return { ...ESTAT_INICIAL, error: t.reservaNova.errorTipusInvalid };
  }

  const data_inici = formData.get("data_inici");
  const hora_inici = formData.get("hora_inici");
  const hora_fi = formData.get("hora_fi");

  if (typeof data_inici !== "string" || !data_inici) {
    return { ...ESTAT_INICIAL, error: t.reservaNova.errorFaltaData };
  }
  if (
    typeof hora_inici !== "string" ||
    typeof hora_fi !== "string" ||
    !hora_inici ||
    !hora_fi ||
    hora_inici >= hora_fi
  ) {
    return { ...ESTAT_INICIAL, error: t.reservaNova.errorFranjaHoraria };
  }

  let dates: string[];
  let frequenciaText: string | null = null;
  let condicioFinalText: string | null = null;
  let modelPreu: "per_ocurrencia" | "abonament_fix" = "per_ocurrencia";
  let preuAbonament: number | undefined;

  if (tipus === "puntual") {
    dates = [data_inici];
  } else {
    const diesRaw = formData.getAll("dies").filter((d): d is string => typeof d === "string");
    const diesNum = diesRaw.map(Number).filter((n) => !Number.isNaN(n));
    if (diesNum.length === 0) {
      return { ...ESTAT_INICIAL, error: t.reservaNova.errorSeleccionaDia };
    }

    const condicioTipus = formData.get("condicio_tipus");
    if (condicioTipus !== "data" && condicioTipus !== "sessions" && condicioTipus !== "obert") {
      return { ...ESTAT_INICIAL, error: t.reservaNova.errorSeleccionaCondicio };
    }
    const condicioData = formData.get("condicio_data");
    const condicioSessions = formData.get("condicio_sessions");
    const numSessions =
      typeof condicioSessions === "string" && condicioSessions ? Number(condicioSessions) : undefined;

    dates = generarDates({
      dataInici: data_inici,
      diesNum,
      condicioTipus: condicioTipus as CondicioTipus,
      dataFi: typeof condicioData === "string" ? condicioData : undefined,
      numSessions,
    });

    if (dates.length === 0) {
      return { ...ESTAT_INICIAL, error: t.reservaNova.errorCapOcurrencia };
    }

    frequenciaText = textFrequencia(diesNum, t.reservaNova.diesSetmana, {
      cada: t.reservaNova.connectorCada,
      i: t.reservaNova.connectorI,
    });
    condicioFinalText = textCondicioFinal(
      condicioTipus as CondicioTipus,
      {
        finsAl: t.reservaNova.finsAl,
        sessionsText: t.reservaNova.sessionsText,
        finsCancelacio: t.reservaNova.finsCancelacio,
      },
      typeof condicioData === "string" ? condicioData : undefined,
      numSessions,
    );

    const modelPreuRaw = formData.get("model_preu");
    if (modelPreuRaw === "abonament_fix") {
      modelPreu = "abonament_fix";
      const preuAbonamentRaw = formData.get("preu_abonament");
      preuAbonament = typeof preuAbonamentRaw === "string" ? Number(preuAbonamentRaw) : NaN;
      if (Number.isNaN(preuAbonament) || preuAbonament <= 0) {
        return { ...ESTAT_INICIAL, error: t.reservaNova.errorPreuAbonament };
      }
    }
  }

  const preusBase = calcularPreusBase({
    dates,
    recursos: recursos.map((r) => ({ preu: r.preu, unitat_preu: r.unitat_preu as "hora" | "dia" })),
    horaInici: hora_inici,
    horaFi: hora_fi,
    modelPreu,
    preuAbonament,
  });

  const { data: resultat, error: rpcError } = await supabase.rpc("crear_reserva", {
    p_tenant_id: tenant_id,
    p_recurs_ids: recurs_ids,
    p_client_id: client_id,
    p_creat_per: user!.id,
    p_tipus: tipus,
    p_frequencia: frequenciaText,
    p_data_inici: data_inici,
    p_condicio_final: condicioFinalText,
    p_model_preu: tipus === "recurrent" ? modelPreu : null,
    p_dates: dates,
    p_hora_inici: hora_inici,
    p_hora_fi: hora_fi,
    p_preus_base: preusBase,
  });

  if (rpcError) {
    return { ...ESTAT_INICIAL, error: t.reservaNova.errorCrearReserva };
  }

  const resposta = resultat as { ok: boolean; conflictes?: string[]; num_ocurrencies?: number };

  if (!resposta.ok) {
    return { ...ESTAT_INICIAL, conflictes: resposta.conflictes ?? [] };
  }

  revalidatePath("/dashboard");
  return { ...ESTAT_INICIAL, exit: { numOcurrencies: resposta.num_ocurrencies ?? dates.length } };
}
