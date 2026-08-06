"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DetallTenantState = {
  error: string | null;
  success: boolean;
};

const ESTAT_INICIAL: DetallTenantState = { error: null, success: false };

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

export async function actualitzarDetallsTenant(
  tenantId: string,
  _prevState: DetallTenantState,
  formData: FormData,
): Promise<DetallTenantState> {
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: "Només el tècnic pot editar això." };
  }

  const especificacions = formData.get("especificacions");
  const quotaRaw = formData.get("quota_mensual");
  const quota_mensual =
    typeof quotaRaw === "string" && quotaRaw.trim() !== "" ? Number(quotaRaw) : null;

  if (quota_mensual !== null && (Number.isNaN(quota_mensual) || quota_mensual < 0)) {
    return { ...ESTAT_INICIAL, error: "La quota no és vàlida." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tenants")
    .update({
      especificacions:
        typeof especificacions === "string" && especificacions.trim() ? especificacions.trim() : null,
      quota_mensual,
    })
    .eq("id", tenantId);

  if (error) {
    return { ...ESTAT_INICIAL, error: "No s'ha pogut desar." };
  }

  revalidatePath(`/tecnic/${tenantId}`);
  return { ...ESTAT_INICIAL, success: true };
}

export async function afegirNotaTenant(tenantId: string, contingut: string) {
  const text = contingut.trim();
  if (!text || !(await assegurarTecnic())) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("notes_tenant").insert({
    tenant_id: tenantId,
    contingut: text,
    creat_per: user!.id,
  });

  revalidatePath(`/tecnic/${tenantId}`);
}

export async function eliminarNotaTenant(tenantId: string, id: string) {
  if (!(await assegurarTecnic())) return;
  const supabase = await createClient();
  await supabase.from("notes_tenant").delete().eq("id", id);
  revalidatePath(`/tecnic/${tenantId}`);
}

export type MembreActionState = {
  error: string | null;
  missatge: string | null;
};

const MEMBRE_ESTAT_INICIAL: MembreActionState = { error: null, missatge: null };

export async function canviarRolMembre(
  tenantId: string,
  profileId: string,
  nouRol: "tenant_admin" | "user",
): Promise<MembreActionState> {
  if (!(await assegurarTecnic())) {
    return { ...MEMBRE_ESTAT_INICIAL, error: "Només el tècnic pot fer això." };
  }
  if (nouRol !== "tenant_admin" && nouRol !== "user") {
    return { ...MEMBRE_ESTAT_INICIAL, error: "Rol no vàlid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ rol: nouRol })
    .eq("id", profileId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { ...MEMBRE_ESTAT_INICIAL, error: "No s'ha pogut canviar el rol." };
  }

  revalidatePath(`/tecnic/${tenantId}`);
  return { ...MEMBRE_ESTAT_INICIAL, missatge: "Rol actualitzat." };
}

export async function enviarResetContrasenya(email: string): Promise<MembreActionState> {
  if (!(await assegurarTecnic())) {
    return { ...MEMBRE_ESTAT_INICIAL, error: "Només el tècnic pot fer això." };
  }
  if (!email) {
    return { ...MEMBRE_ESTAT_INICIAL, error: "Falta l'email." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/invitat`,
  });

  if (error) {
    return { ...MEMBRE_ESTAT_INICIAL, error: "No s'ha pogut enviar l'email de restabliment." };
  }

  return { ...MEMBRE_ESTAT_INICIAL, missatge: "Email de restabliment enviat." };
}
