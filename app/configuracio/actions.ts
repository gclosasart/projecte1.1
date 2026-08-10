"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

export type TenantFormState = {
  error: string | null;
  success: boolean;
};

const ESTAT_INICIAL: TenantFormState = { error: null, success: false };

export async function actualitzarTenant(
  _prevState: TenantFormState,
  formData: FormData,
): Promise<TenantFormState> {
  const t = await getDict();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, rol")
    .eq("id", user!.id)
    .single();

  if (!profile || (profile.rol !== "tenant_admin" && profile.rol !== "tecnic")) {
    return { ...ESTAT_INICIAL, error: t.configuracio.errorSensePermisos };
  }
  if (!profile.tenant_id) {
    return { ...ESTAT_INICIAL, error: t.configuracio.errorSenseTenant };
  }

  const nom_comercial = formData.get("nom_comercial");
  const rao_social = formData.get("rao_social");
  const nif = formData.get("nif");
  const adreca_fiscal = formData.get("adreca_fiscal");

  if (typeof nom_comercial !== "string" || !nom_comercial.trim()) {
    return { ...ESTAT_INICIAL, error: t.configuracio.errorNomComercialObligatori };
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      nom_comercial: nom_comercial.trim(),
      rao_social: typeof rao_social === "string" && rao_social.trim() ? rao_social.trim() : null,
      nif: typeof nif === "string" && nif.trim() ? nif.trim() : null,
      adreca_fiscal:
        typeof adreca_fiscal === "string" && adreca_fiscal.trim() ? adreca_fiscal.trim() : null,
    })
    .eq("id", profile.tenant_id);

  if (error) {
    return { ...ESTAT_INICIAL, error: t.configuracio.errorDesar };
  }

  revalidatePath("/configuracio");
  revalidatePath("/dashboard");
  return { ...ESTAT_INICIAL, success: true };
}
