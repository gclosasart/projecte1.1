"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

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
  const t = await getDict();
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: t.tecnic.detall.errorNomesTecnic };
  }

  const especificacions = formData.get("especificacions");
  const quotaRaw = formData.get("quota_mensual");
  const quota_mensual =
    typeof quotaRaw === "string" && quotaRaw.trim() !== "" ? Number(quotaRaw) : null;

  if (quota_mensual !== null && (Number.isNaN(quota_mensual) || quota_mensual < 0)) {
    return { ...ESTAT_INICIAL, error: t.tecnic.detall.errorQuota };
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
    return { ...ESTAT_INICIAL, error: t.tecnic.detall.errorDesar };
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
  const t = await getDict();
  if (!(await assegurarTecnic())) {
    return { ...MEMBRE_ESTAT_INICIAL, error: t.tecnic.detall.errorNomesTecnicFer };
  }
  if (nouRol !== "tenant_admin" && nouRol !== "user") {
    return { ...MEMBRE_ESTAT_INICIAL, error: t.tecnic.detall.errorRolInvalid };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ rol: nouRol })
    .eq("id", profileId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { ...MEMBRE_ESTAT_INICIAL, error: t.tecnic.detall.errorCanviarRol };
  }

  revalidatePath(`/tecnic/${tenantId}`);
  return { ...MEMBRE_ESTAT_INICIAL, missatge: t.tecnic.detall.rolActualitzat };
}

export async function enviarResetContrasenya(email: string): Promise<MembreActionState> {
  const t = await getDict();
  if (!(await assegurarTecnic())) {
    return { ...MEMBRE_ESTAT_INICIAL, error: t.tecnic.detall.errorNomesTecnicFer };
  }
  if (!email) {
    return { ...MEMBRE_ESTAT_INICIAL, error: t.tecnic.detall.errorFaltaEmail };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/invitat`,
  });

  if (error) {
    return { ...MEMBRE_ESTAT_INICIAL, error: t.tecnic.detall.errorEnviarReset };
  }

  return { ...MEMBRE_ESTAT_INICIAL, missatge: t.tecnic.detall.resetEnviat };
}
