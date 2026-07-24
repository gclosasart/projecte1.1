"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ConvidaState = {
  error: string | null;
  success: boolean;
};

const ESTAT_INICIAL: ConvidaState = { error: null, success: false };

async function perfilActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, rol")
    .eq("id", user!.id)
    .single();

  return profile as { tenant_id: string | null; rol: string } | null;
}

export async function convidarStaff(
  _prevState: ConvidaState,
  formData: FormData,
): Promise<ConvidaState> {
  const perfil = await perfilActual();
  if (!perfil || (perfil.rol !== "tenant_admin" && perfil.rol !== "tecnic")) {
    return { ...ESTAT_INICIAL, error: "No tens permisos per convidar personal." };
  }
  if (!perfil.tenant_id) {
    return { ...ESTAT_INICIAL, error: "El teu usuari no té cap tenant assignat." };
  }

  const email = formData.get("email");
  const nom = formData.get("nom");
  const rol = formData.get("rol");
  const permisos = formData.getAll("permisos").filter((p): p is string => typeof p === "string");

  if (typeof email !== "string" || !email.trim()) {
    return { ...ESTAT_INICIAL, error: "Introdueix un email vàlid." };
  }
  if (rol !== "tenant_admin" && rol !== "user") {
    return { ...ESTAT_INICIAL, error: "Selecciona un rol vàlid." };
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
    redirectTo: `${siteUrl}/invitat`,
    data: {
      tenant_id: perfil.tenant_id,
      rol,
      nom: typeof nom === "string" && nom.trim() ? nom.trim() : undefined,
      permisos: rol === "user" ? permisos : [],
    },
  });

  if (error) {
    return { ...ESTAT_INICIAL, error: `No s'ha pogut enviar la invitació: ${error.message}` };
  }

  revalidatePath("/equip");
  return { ...ESTAT_INICIAL, success: true };
}

export async function actualitzarPermisos(profileId: string, permisos: string[]) {
  const perfil = await perfilActual();
  if (!perfil || (perfil.rol !== "tenant_admin" && perfil.rol !== "tecnic")) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ permisos })
    .eq("id", profileId)
    .eq("tenant_id", perfil.tenant_id);

  revalidatePath("/equip");
}
