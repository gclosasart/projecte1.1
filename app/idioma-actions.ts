"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { IDIOMA_COOKIE, IDIOMES, type Idioma } from "@/lib/i18n";

export async function canviarIdioma(idioma: Idioma) {
  if (!(IDIOMES as string[]).includes(idioma)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("profiles").update({ idioma }).eq("id", user.id);
  }

  const cookieStore = await cookies();
  cookieStore.set(IDIOMA_COOKIE, idioma, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
