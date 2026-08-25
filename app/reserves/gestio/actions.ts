"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { calcularHores } from "../nova/recurrencia";

export type CancelState = {
  error: string | null;
  avisos: string[] | null;
};

const ESTAT_INICIAL: CancelState = { error: null, avisos: null };

export async function cancelarOcurrencia(
  ocurrenciaId: string,
  abast: "nomes_aquesta" | "aquesta_i_futures",
  reservaId: string,
): Promise<CancelState> {
  const t = await getDict();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancelar_ocurrencia", {
    p_ocurrencia_id: ocurrenciaId,
    p_abast: abast,
  });

  if (error) {
    return { ...ESTAT_INICIAL, error: t.reservaGestio.detall.errorCancelar };
  }

  const resposta = data as { ok: boolean; error?: string; avisos?: string[] };
  if (!resposta.ok) {
    return { ...ESTAT_INICIAL, error: resposta.error ?? t.reservaGestio.detall.errorCancelarGeneric };
  }

  revalidatePath("/reserves/gestio");
  revalidatePath(`/reserves/gestio/${reservaId}`);
  revalidatePath("/calendari");
  revalidatePath("/dashboard");

  return { ...ESTAT_INICIAL, avisos: resposta.avisos && resposta.avisos.length > 0 ? resposta.avisos : null };
}

export async function arxivarReserva(id: string, arxivada: boolean) {
  const supabase = await createClient();
  await supabase.from("reserves").update({ arxivada }).eq("id", id);
  revalidatePath("/reserves/gestio");
}

export async function canviarEstatReserva(id: string, nouEstat: "activa" | "cancel·lada") {
  const supabase = await createClient();
  await supabase.from("reserves").update({ estat: nouEstat }).eq("id", id);
  revalidatePath("/reserves/gestio");
  revalidatePath(`/reserves/gestio/${id}`);
  revalidatePath("/calendari");
  revalidatePath("/dashboard");
}

export async function processarSollicitud(id: string, estat: "acceptada" | "rebutjada") {
  const supabase = await createClient();
  await supabase.from("sol_licituds_reserva").update({ estat }).eq("id", id);
  revalidatePath("/reserves/gestio");
}

export async function canviarNoShow(ocurrenciaId: string, reservaId: string, marcar: boolean) {
  const supabase = await createClient();
  await supabase.from("ocurrencies").update({ no_show: marcar }).eq("id", ocurrenciaId);
  await supabase.from("factures").update({ no_show: marcar }).eq("ocurrencia_id", ocurrenciaId);
  revalidatePath("/reserves/gestio");
  revalidatePath(`/reserves/gestio/${reservaId}`);
  revalidatePath("/factures");
  revalidatePath("/dashboard");
}

export type ModificarRecursosState = {
  error: string | null;
  conflictes: string[] | null;
  exit: boolean;
};

const ESTAT_INICIAL_RECURSOS: ModificarRecursosState = { error: null, conflictes: null, exit: false };

export async function actualitzarRecursosReserva(
  reservaId: string,
  _prevState: ModificarRecursosState,
  formData: FormData,
): Promise<ModificarRecursosState> {
  const t = await getDict();
  const supabase = await createClient();

  const recursIds = formData.getAll("recurs_ids").filter((v): v is string => typeof v === "string" && v !== "");
  if (recursIds.length === 0) {
    return { ...ESTAT_INICIAL_RECURSOS, error: t.reservaGestio.errorSeleccionaRecurs };
  }

  const { data: reserva } = await supabase
    .from("reserves")
    .select("model_preu")
    .eq("id", reservaId)
    .single();

  if (!reserva) {
    return { ...ESTAT_INICIAL_RECURSOS, error: t.reservaGestio.errorReservaNoTrobada };
  }

  let ocurrenciaIds: string[] = [];
  let preus: number[] = [];

  if (reserva.model_preu !== "abonament_fix") {
    const { data: recursos } = await supabase
      .from("recursos")
      .select("preu, unitat_preu")
      .in("id", recursIds);

    if (!recursos || recursos.length !== recursIds.length) {
      return { ...ESTAT_INICIAL_RECURSOS, error: t.reservaGestio.errorRecursTrobat };
    }

    const { data: activa } = await supabase
      .from("ocurrencies")
      .select("id, hora_inici, hora_fi")
      .eq("reserva_id", reservaId)
      .eq("estat", "activa");

    if (activa && activa.length > 0) {
      ocurrenciaIds = activa.map((o) => o.id);
      preus = activa.map((o) => {
        const hores = calcularHores(o.hora_inici, o.hora_fi);
        const total = recursos.reduce((acc, r) => acc + r.preu * (r.unitat_preu === "hora" ? hores : 1), 0);
        return Math.round(total * 100) / 100;
      });
    }
  }

  const { data, error } = await supabase.rpc("modificar_recursos_reserva", {
    p_reserva_id: reservaId,
    p_recurs_ids: recursIds,
    p_ocurrencia_ids: ocurrenciaIds,
    p_preus: preus,
  });

  if (error) {
    return { ...ESTAT_INICIAL_RECURSOS, error: t.reservaGestio.errorActualitzarRecursos };
  }

  const resposta = data as { ok: boolean; conflictes?: string[] };
  if (!resposta.ok) {
    return { ...ESTAT_INICIAL_RECURSOS, conflictes: resposta.conflictes ?? [] };
  }

  revalidatePath("/reserves/gestio");
  revalidatePath(`/reserves/gestio/${reservaId}`);
  revalidatePath("/calendari");
  revalidatePath("/dashboard");

  return { ...ESTAT_INICIAL_RECURSOS, exit: true };
}
