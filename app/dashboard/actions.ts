"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
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

export async function afegirNota(contingut: string) {
  const text = contingut.trim();
  if (!text) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tenant_id = await tenantIdActual();
  if (!tenant_id) return;

  await supabase.from("notes_dia").insert({
    tenant_id,
    contingut: text,
    creat_per: user!.id,
  });

  revalidatePath("/dashboard");
}

export async function marcarNota(id: string, fet: boolean) {
  const supabase = await createClient();
  await supabase.from("notes_dia").update({ fet }).eq("id", id);
  revalidatePath("/dashboard");
}

export async function eliminarNota(id: string) {
  const supabase = await createClient();
  await supabase.from("notes_dia").delete().eq("id", id);
  revalidatePath("/dashboard");
}
