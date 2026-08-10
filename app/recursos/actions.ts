"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

export type RecursFormState = {
  error: string | null;
};

async function tenantIdActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  return profile?.tenant_id as string | null | undefined;
}

type CampsRecurs = {
  nom: string;
  capacitat: number | null;
  preu: number;
  unitat_preu: "hora" | "dia";
  quantitat: number;
};

async function llegirCamps(
  formData: FormData,
): Promise<{ ok: true; camps: CampsRecurs } | { ok: false; error: string }> {
  const t = await getDict();
  const nom = formData.get("nom");
  const capacitat = formData.get("capacitat");
  const preu = formData.get("preu");
  const unitat_preu = formData.get("unitat_preu");
  const quantitat = formData.get("quantitat");

  if (typeof nom !== "string" || !nom.trim()) {
    return { ok: false, error: t.recursos.errorNomObligatori };
  }
  const preuNum = Number(preu);
  if (typeof preu !== "string" || preu === "" || Number.isNaN(preuNum) || preuNum < 0) {
    return { ok: false, error: t.recursos.errorPreu };
  }
  const capacitatNum = capacitat ? Number(capacitat) : null;
  if (capacitat && (Number.isNaN(capacitatNum) || (capacitatNum ?? 0) < 0)) {
    return { ok: false, error: t.recursos.errorCapacitat };
  }
  if (unitat_preu !== "hora" && unitat_preu !== "dia") {
    return { ok: false, error: t.recursos.errorUnitatPreu };
  }
  const quantitatNum = Number(quantitat);
  if (typeof quantitat !== "string" || quantitat === "" || !Number.isInteger(quantitatNum) || quantitatNum < 1) {
    return { ok: false, error: t.recursos.errorQuantitat };
  }

  return {
    ok: true,
    camps: { nom: nom.trim(), capacitat: capacitatNum, preu: preuNum, unitat_preu, quantitat: quantitatNum },
  };
}

export async function crearRecurs(
  _prevState: RecursFormState,
  formData: FormData,
): Promise<RecursFormState> {
  const t = await getDict();
  const resultat = await llegirCamps(formData);
  if (!resultat.ok) return { error: resultat.error };

  const tenant_id = await tenantIdActual();
  if (!tenant_id) {
    return { error: t.recursos.errorSenseTenant };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("recursos")
    .insert({ ...resultat.camps, tenant_id });

  if (error) {
    return { error: t.recursos.errorCrear };
  }

  revalidatePath("/recursos");
  redirect("/recursos");
}

export async function actualitzarRecurs(
  id: string,
  _prevState: RecursFormState,
  formData: FormData,
): Promise<RecursFormState> {
  const t = await getDict();
  const resultat = await llegirCamps(formData);
  if (!resultat.ok) return { error: resultat.error };

  const supabase = await createClient();
  const { error } = await supabase.from("recursos").update(resultat.camps).eq("id", id);

  if (error) {
    return { error: t.recursos.errorDesar };
  }

  revalidatePath("/recursos");
  redirect("/recursos");
}

export async function eliminarRecurs(
  id: string,
  _prevState: RecursFormState,
  formData: FormData,
): Promise<RecursFormState> {
  const t = await getDict();
  const confirmacio = formData.get("confirmacio");
  if (typeof confirmacio !== "string" || confirmacio.trim().toUpperCase() !== "ELIMINA") {
    return { error: t.recursos.errorConfirmacio };
  }

  const supabase = await createClient();

  const { data: recurs } = await supabase
    .from("recursos")
    .select("bloquejat")
    .eq("id", id)
    .single();

  if (!recurs?.bloquejat) {
    return { error: t.recursos.errorCalBloquejar };
  }

  const { count } = await supabase
    .from("reserva_recursos")
    .select("reserva_id", { count: "exact", head: true })
    .eq("recurs_id", id);

  if (count && count > 0) {
    return { error: t.recursos.errorReservesAssociades(count) };
  }

  const { error } = await supabase.from("recursos").delete().eq("id", id);

  if (error) {
    return { error: t.recursos.errorEliminar };
  }

  revalidatePath("/recursos");
  redirect("/recursos");
}

export async function canviarBloquejat(id: string, nouEstat: boolean) {
  const supabase = await createClient();
  await supabase
    .from("recursos")
    .update(nouEstat ? { bloquejat: true, actiu: false } : { bloquejat: false, actiu: true })
    .eq("id", id);
  revalidatePath("/recursos");
}
