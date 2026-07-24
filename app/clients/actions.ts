"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ClientFormState = {
  error: string | null;
};

type CampsClient = {
  nom: string;
  nif: string | null;
  email: string | null;
  adreca: string | null;
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

function llegirCamps(formData: FormData): { ok: true; camps: CampsClient } | { ok: false; error: string } {
  const nom = formData.get("nom");
  const nif = formData.get("nif");
  const email = formData.get("email");
  const adreca = formData.get("adreca");

  if (typeof nom !== "string" || !nom.trim()) {
    return { ok: false, error: "El nom és obligatori." };
  }

  return {
    ok: true,
    camps: {
      nom: nom.trim(),
      nif: typeof nif === "string" && nif.trim() ? nif.trim() : null,
      email: typeof email === "string" && email.trim() ? email.trim() : null,
      adreca: typeof adreca === "string" && adreca.trim() ? adreca.trim() : null,
    },
  };
}

export async function crearClient(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const resultat = llegirCamps(formData);
  if (!resultat.ok) return { error: resultat.error };

  const tenant_id = await tenantIdActual();
  if (!tenant_id) {
    return { error: "El teu usuari no té cap tenant assignat." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({ ...resultat.camps, tenant_id });

  if (error) {
    return { error: "No s'ha pogut crear el client." };
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function eliminarClient(
  id: string,
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const confirmacio = formData.get("confirmacio");
  if (typeof confirmacio !== "string" || confirmacio.trim().toUpperCase() !== "ELIMINA") {
    return { error: 'Has d\'escriure "ELIMINA" per confirmar.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return { error: "No es pot eliminar: aquest client té reserves associades." };
    }
    return { error: "No s'ha pogut eliminar el client." };
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function actualitzarClient(
  id: string,
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const resultat = llegirCamps(formData);
  if (!resultat.ok) return { error: resultat.error };

  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(resultat.camps).eq("id", id);

  if (error) {
    return { error: "No s'ha pogut desar el client." };
  }

  revalidatePath("/clients");
  redirect("/clients");
}
