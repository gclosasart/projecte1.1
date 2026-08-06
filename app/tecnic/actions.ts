"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type TecnicFormState = {
  error: string | null;
  success: boolean;
};

const ESTAT_INICIAL: TecnicFormState = { error: null, success: false };

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

export async function crearTenant(
  _prevState: TecnicFormState,
  formData: FormData,
): Promise<TecnicFormState> {
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: "Només el tècnic pot crear tenants." };
  }

  const nom_comercial = formData.get("nom_comercial");
  const rao_social = formData.get("rao_social");
  const nif = formData.get("nif");
  const adreca_fiscal = formData.get("adreca_fiscal");

  if (typeof nom_comercial !== "string" || !nom_comercial.trim()) {
    return { ...ESTAT_INICIAL, error: "El nom comercial és obligatori." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tenants").insert({
    nom_comercial: nom_comercial.trim(),
    rao_social: typeof rao_social === "string" && rao_social.trim() ? rao_social.trim() : null,
    nif: typeof nif === "string" && nif.trim() ? nif.trim() : null,
    adreca_fiscal:
      typeof adreca_fiscal === "string" && adreca_fiscal.trim() ? adreca_fiscal.trim() : null,
  });

  if (error) {
    return { ...ESTAT_INICIAL, error: "No s'ha pogut crear el tenant." };
  }

  revalidatePath("/tecnic");
  return { ...ESTAT_INICIAL, success: true };
}

export async function eliminarTenant(
  tenantId: string,
  _prevState: TecnicFormState,
  formData: FormData,
): Promise<TecnicFormState> {
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: "Només el tècnic pot eliminar tenants." };
  }

  const confirmacio = formData.get("confirmacio");
  if (typeof confirmacio !== "string" || confirmacio.trim().toUpperCase() !== "ELIMINA") {
    return { ...ESTAT_INICIAL, error: 'Has d\'escriure "ELIMINA" per confirmar.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tenants").delete().eq("id", tenantId);

  if (error) {
    if (error.code === "23503") {
      return {
        ...ESTAT_INICIAL,
        error: "No es pot eliminar: aquest tenant té equip, recursos, clients o reserves associats.",
      };
    }
    return { ...ESTAT_INICIAL, error: "No s'ha pogut eliminar el tenant." };
  }

  revalidatePath("/tecnic");
  return { ...ESTAT_INICIAL, success: true };
}

export async function convidarAdminTenant(
  tenantId: string,
  _prevState: TecnicFormState,
  formData: FormData,
): Promise<TecnicFormState> {
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: "Només el tècnic pot convidar administradors." };
  }

  const email = formData.get("email");
  const nom = formData.get("nom");

  if (typeof email !== "string" || !email.trim()) {
    return { ...ESTAT_INICIAL, error: "Introdueix un email vàlid." };
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
    redirectTo: `${siteUrl}/invitat`,
    data: {
      tenant_id: tenantId,
      rol: "tenant_admin",
      nom: typeof nom === "string" && nom.trim() ? nom.trim() : undefined,
      permisos: [],
    },
  });

  if (error) {
    return { ...ESTAT_INICIAL, error: `No s'ha pogut enviar la invitació: ${error.message}` };
  }

  revalidatePath("/tecnic");
  return { ...ESTAT_INICIAL, success: true };
}
