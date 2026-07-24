"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
