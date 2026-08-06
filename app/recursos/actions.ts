"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
};

function llegirCamps(formData: FormData): { ok: true; camps: CampsRecurs } | { ok: false; error: string } {
  const nom = formData.get("nom");
  const capacitat = formData.get("capacitat");
  const preu = formData.get("preu");
  const unitat_preu = formData.get("unitat_preu");

  if (typeof nom !== "string" || !nom.trim()) {
    return { ok: false, error: "El nom és obligatori." };
  }
  const preuNum = Number(preu);
  if (typeof preu !== "string" || preu === "" || Number.isNaN(preuNum) || preuNum < 0) {
    return { ok: false, error: "El preu no és vàlid." };
  }
  const capacitatNum = capacitat ? Number(capacitat) : null;
  if (capacitat && (Number.isNaN(capacitatNum) || (capacitatNum ?? 0) < 0)) {
    return { ok: false, error: "La capacitat no és vàlida." };
  }
  if (unitat_preu !== "hora" && unitat_preu !== "dia") {
    return { ok: false, error: "La unitat de preu no és vàlida." };
  }

  return {
    ok: true,
    camps: { nom: nom.trim(), capacitat: capacitatNum, preu: preuNum, unitat_preu },
  };
}

export async function crearRecurs(
  _prevState: RecursFormState,
  formData: FormData,
): Promise<RecursFormState> {
  const resultat = llegirCamps(formData);
  if (!resultat.ok) return { error: resultat.error };

  const tenant_id = await tenantIdActual();
  if (!tenant_id) {
    return { error: "El teu usuari no té cap tenant assignat." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("recursos")
    .insert({ ...resultat.camps, tenant_id });

  if (error) {
    return { error: "No s'ha pogut crear el recurs." };
  }

  revalidatePath("/recursos");
  redirect("/recursos");
}

export async function actualitzarRecurs(
  id: string,
  _prevState: RecursFormState,
  formData: FormData,
): Promise<RecursFormState> {
  const resultat = llegirCamps(formData);
  if (!resultat.ok) return { error: resultat.error };

  const supabase = await createClient();
  const { error } = await supabase.from("recursos").update(resultat.camps).eq("id", id);

  if (error) {
    return { error: "No s'ha pogut desar el recurs." };
  }

  revalidatePath("/recursos");
  redirect("/recursos");
}

export async function eliminarRecurs(
  id: string,
  _prevState: RecursFormState,
  formData: FormData,
): Promise<RecursFormState> {
  const confirmacio = formData.get("confirmacio");
  if (typeof confirmacio !== "string" || confirmacio.trim().toUpperCase() !== "ELIMINA") {
    return { error: 'Has d\'escriure "ELIMINA" per confirmar.' };
  }

  const supabase = await createClient();

  const { data: recurs } = await supabase
    .from("recursos")
    .select("bloquejat")
    .eq("id", id)
    .single();

  if (!recurs?.bloquejat) {
    return { error: "Cal bloquejar el recurs abans de poder eliminar-lo." };
  }

  // reserves.recurs_id té esborrat en cascada: cal bloquejar-ho manualment
  // per no perdre l'historial de reserves/factures (veure model de dades).
  const { count } = await supabase
    .from("reserves")
    .select("id", { count: "exact", head: true })
    .eq("recurs_id", id);

  if (count && count > 0) {
    return {
      error: `No es pot eliminar: aquest recurs té ${count} reserva${count === 1 ? "" : "s"} associada${count === 1 ? "" : "es"}.`,
    };
  }

  const { error } = await supabase.from("recursos").delete().eq("id", id);

  if (error) {
    return { error: "No s'ha pogut eliminar el recurs." };
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
