"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancelar_ocurrencia", {
    p_ocurrencia_id: ocurrenciaId,
    p_abast: abast,
  });

  if (error) {
    return { ...ESTAT_INICIAL, error: "No s'ha pogut cancel·lar la reserva." };
  }

  const resposta = data as { ok: boolean; error?: string; avisos?: string[] };
  if (!resposta.ok) {
    return { ...ESTAT_INICIAL, error: resposta.error ?? "No s'ha pogut cancel·lar." };
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
  const supabase = await createClient();

  const recursIds = formData.getAll("recurs_ids").filter((v): v is string => typeof v === "string" && v !== "");
  if (recursIds.length === 0) {
    return { ...ESTAT_INICIAL_RECURSOS, error: "Selecciona almenys un recurs." };
  }

  const { data: reserva } = await supabase
    .from("reserves")
    .select("model_preu")
    .eq("id", reservaId)
    .single();

  if (!reserva) {
    return { ...ESTAT_INICIAL_RECURSOS, error: "Reserva no trobada." };
  }

  let ocurrenciaIds: string[] = [];
  let preus: number[] = [];

  if (reserva.model_preu !== "abonament_fix") {
    const { data: recursos } = await supabase
      .from("recursos")
      .select("preu, unitat_preu")
      .in("id", recursIds);

    if (!recursos || recursos.length !== recursIds.length) {
      return { ...ESTAT_INICIAL_RECURSOS, error: "Algun recurs seleccionat no s'ha trobat." };
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
    return { ...ESTAT_INICIAL_RECURSOS, error: "No s'han pogut actualitzar els recursos." };
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
