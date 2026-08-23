"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

export type PlataformaFormState = {
  error: string | null;
  success: boolean;
};

const ESTAT_INICIAL: PlataformaFormState = { error: null, success: false };

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

export async function actualitzarPlataforma(
  _prevState: PlataformaFormState,
  formData: FormData,
): Promise<PlataformaFormState> {
  const t = await getDict();
  if (!(await assegurarTecnic())) {
    return { ...ESTAT_INICIAL, error: t.plataforma.errorSensePermisos };
  }

  const nom_comercial = formData.get("nom_comercial");
  const rao_social = formData.get("rao_social");
  const nif = formData.get("nif");
  const adreca_fiscal = formData.get("adreca_fiscal");
  const iva_percent_raw = formData.get("iva_percent");

  if (typeof nom_comercial !== "string" || !nom_comercial.trim()) {
    return { ...ESTAT_INICIAL, error: t.plataforma.errorNomObligatori };
  }

  const iva_percent =
    typeof iva_percent_raw === "string" && iva_percent_raw.trim() !== ""
      ? Number(iva_percent_raw)
      : 21;

  if (Number.isNaN(iva_percent) || iva_percent < 0) {
    return { ...ESTAT_INICIAL, error: t.plataforma.errorIva };
  }

  const supabase = await createClient();
  const { data: fila } = await supabase.from("plataforma").select("id").limit(1).single();

  if (!fila) {
    return { ...ESTAT_INICIAL, error: t.plataforma.errorDesar };
  }

  const { error } = await supabase
    .from("plataforma")
    .update({
      nom_comercial: nom_comercial.trim(),
      rao_social: typeof rao_social === "string" && rao_social.trim() ? rao_social.trim() : null,
      nif: typeof nif === "string" && nif.trim() ? nif.trim() : null,
      adreca_fiscal:
        typeof adreca_fiscal === "string" && adreca_fiscal.trim() ? adreca_fiscal.trim() : null,
      iva_percent,
    })
    .eq("id", fila.id);

  if (error) {
    return { ...ESTAT_INICIAL, error: t.plataforma.errorDesar };
  }

  revalidatePath("/plataforma");
  return { ...ESTAT_INICIAL, success: true };
}
