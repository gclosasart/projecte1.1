"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

export async function marcarPagada(id: string, metodePagament: string) {
  const supabase = await createClient();
  await supabase
    .from("factures")
    .update({ estat: "pagada", metode_pagament: metodePagament })
    .eq("id", id)
    .eq("estat", "pendent");
  revalidatePath("/factures");
  revalidatePath("/dashboard");
}

export type RectificativaState = {
  error: string | null;
  novaId: string | null;
};

export async function crearRectificativa(id: string): Promise<RectificativaState> {
  const t = await getDict();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("crear_factura_rectificativa", {
    p_factura_id: id,
  });

  if (error || !data?.ok) {
    return { error: t.factures.errorCrearRectificativa, novaId: null };
  }

  revalidatePath("/factures");
  revalidatePath(`/factures/${id}`);
  return { error: null, novaId: data.id as string };
}
