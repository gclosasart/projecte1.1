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

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function hiHaClientDuplicat(
  supabase: SupabaseServerClient,
  tenant_id: string,
  camps: Pick<CampsClient, "nom" | "nif" | "email">,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase.from("clients").select("id").eq("tenant_id", tenant_id);

  if (camps.nif) {
    query = query.ilike("nif", camps.nif);
  } else {
    query = query.ilike("nom", camps.nom);
    query = camps.email ? query.ilike("email", camps.email) : query.is("email", null);
  }

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.limit(1);
  return Boolean(data && data.length > 0);
}

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

  if (await hiHaClientDuplicat(supabase, tenant_id, resultat.camps)) {
    return { error: t.clients.errorClientDuplicat };
  }

  const { error } = await supabase.from("clients").insert({ ...resultat.camps, tenant_id });

  if (error) {
    return { error: error.code === "23505" ? t.clients.errorClientDuplicat : t.clients.errorCrear };
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
  const { data, error } = await supabase.rpc("eliminar_client_segur", { p_client_id: id });

  if (error) {
    return { error: t.clients.errorEliminar };
  }

  const resposta = data as { ok: boolean; error?: string };
  if (!resposta.ok) {
    if (resposta.error === "arxivades") {
      return { error: t.clients.errorReservesArxivades };
    }
    if (resposta.error === "pagades") {
      return { error: t.clients.errorFacturesPagades };
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

  const tenant_id = await tenantIdActual();
  if (!tenant_id) {
    return { error: t.clients.errorSenseTenant };
  }

  const supabase = await createClient();

  if (await hiHaClientDuplicat(supabase, tenant_id, resultat.camps, id)) {
    return { error: t.clients.errorClientDuplicat };
  }

  const { error } = await supabase.from("clients").update(resultat.camps).eq("id", id);

  if (error) {
    return { error: error.code === "23505" ? t.clients.errorClientDuplicat : t.clients.errorDesar };
  }

  revalidatePath("/clients");
  redirect("/clients");
}
