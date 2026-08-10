"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

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

async function llegirCamps(
  formData: FormData,
): Promise<{ ok: true; camps: CampsClient } | { ok: false; error: string }> {
  const t = await getDict();
  const nom = formData.get("nom");
  const nif = formData.get("nif");
  const email = formData.get("email");
  const adreca = formData.get("adreca");

  if (typeof nom !== "string" || !nom.trim()) {
    return { ok: false, error: t.clients.errorNomObligatori };
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
  const t = await getDict();
  const resultat = await llegirCamps(formData);
  if (!resultat.ok) return { error: resultat.error };

  const tenant_id = await tenantIdActual();
  if (!tenant_id) {
    return { error: t.clients.errorSenseTenant };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({ ...resultat.camps, tenant_id });

  if (error) {
    return { error: t.clients.errorCrear };
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function eliminarClient(
  id: string,
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const t = await getDict();
  const confirmacio = formData.get("confirmacio");
  if (typeof confirmacio !== "string" || confirmacio.trim().toUpperCase() !== "ELIMINA") {
    return { error: t.clients.errorConfirmacio };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return { error: t.clients.errorReservesAssociades };
    }
    return { error: t.clients.errorEliminar };
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function actualitzarClient(
  id: string,
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const t = await getDict();
  const resultat = await llegirCamps(formData);
  if (!resultat.ok) return { error: resultat.error };

  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(resultat.camps).eq("id", id);

  if (error) {
    return { error: t.clients.errorDesar };
  }

  revalidatePath("/clients");
  redirect("/clients");
}
