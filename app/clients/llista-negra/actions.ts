"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

export type LlistaNegraState = {
  error: string | null;
};

const ESTAT_INICIAL: LlistaNegraState = { error: null };

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

export async function afegirALlistaNegra(
  _prevState: LlistaNegraState,
  formData: FormData,
): Promise<LlistaNegraState> {
  const t = await getDict();
  const nif = formData.get("nif");
  const nom = formData.get("nom");
  const motiu = formData.get("motiu");

  if (typeof nif !== "string" || !nif.trim()) {
    return { ...ESTAT_INICIAL, error: t.llistaNegra.errorNifObligatori };
  }

  const tenant_id = await tenantIdActual();
  if (!tenant_id) {
    return { ...ESTAT_INICIAL, error: t.llistaNegra.errorSenseTenant };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("llista_negra").insert({
    tenant_id,
    nif: nif.trim().toUpperCase(),
    nom: typeof nom === "string" && nom.trim() ? nom.trim() : null,
    motiu: typeof motiu === "string" && motiu.trim() ? motiu.trim() : null,
    creat_per: user!.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { ...ESTAT_INICIAL, error: t.llistaNegra.errorJaExisteix };
    }
    return { ...ESTAT_INICIAL, error: t.llistaNegra.errorAfegir };
  }

  revalidatePath("/clients/llista-negra");
  return { ...ESTAT_INICIAL };
}

export async function eliminarDeLlistaNegra(id: string) {
  const supabase = await createClient();
  await supabase.from("llista_negra").delete().eq("id", id);
  revalidatePath("/clients/llista-negra");
}
