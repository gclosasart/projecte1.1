"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

export type FacturaPlataformaState = {
  error: string | null;
  success: boolean;
};

const ESTAT_INICIAL: FacturaPlataformaState = { error: null, success: false };

async function assegurarTecnic() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user!.id)
    .single();

  return profile?.rol === "tecnic";
}

export async function generarEsborranys(): Promise<FacturaPlataformaState> {
  const t = await getDict();
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: t.tecnicFactures.errorNomesTecnic };
  }

  const ara = new Date();
  const supabase = await createClient();
  const { error } = await supabase.rpc("generar_esborranys_factures_plataforma", {
    p_any: ara.getFullYear(),
    p_mes: ara.getMonth() + 1,
  });

  if (error) {
    return { ...ESTAT_INICIAL, error: t.tecnicFactures.errorGenerar };
  }

  revalidatePath("/tecnic/factures");
  return { ...ESTAT_INICIAL, success: true };
}

export async function confirmarFactura(id: string): Promise<FacturaPlataformaState> {
  const t = await getDict();
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: t.tecnicFactures.errorNomesTecnic };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirmar_factura_plataforma", { p_id: id });

  if (error || !data?.ok) {
    return { ...ESTAT_INICIAL, error: t.tecnicFactures.errorConfirmar };
  }

  revalidatePath("/tecnic/factures");
  return { ...ESTAT_INICIAL, success: true };
}

export async function marcarPagadaPlataforma(
  id: string,
  metode_pagament: string,
): Promise<FacturaPlataformaState> {
  const t = await getDict();
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: t.tecnicFactures.errorNomesTecnic };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("factures_plataforma")
    .update({ estat: "pagada", metode_pagament })
    .eq("id", id)
    .eq("estat", "pendent");

  if (error) {
    return { ...ESTAT_INICIAL, error: t.tecnicFactures.errorDesar };
  }

  revalidatePath("/tecnic/factures");
  return { ...ESTAT_INICIAL, success: true };
}

export async function anularFacturaPlataforma(id: string): Promise<FacturaPlataformaState> {
  const t = await getDict();
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: t.tecnicFactures.errorNomesTecnic };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("factures_plataforma")
    .update({ estat: "anul·lada" })
    .eq("id", id)
    .in("estat", ["pendent", "pagada"]);

  if (error) {
    return { ...ESTAT_INICIAL, error: t.tecnicFactures.errorDesar };
  }

  revalidatePath("/tecnic/factures");
  return { ...ESTAT_INICIAL, success: true };
}
