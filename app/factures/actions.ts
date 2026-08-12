"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function marcarPagada(id: string, metodePagament: string) {
  const supabase = await createClient();
  await supabase
    .from("factures")
    .update({ estat: "pagada", metode_pagament: metodePagament })
    .eq("id", id)
    .eq("estat", "pendent");
  revalidatePath("/factures");
  revalidatePath("/dashboard");
}
