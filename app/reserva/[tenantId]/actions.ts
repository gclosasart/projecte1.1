"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getDict } from "@/lib/i18n";

export type SolicitudState = { error: string | null; exit: boolean };

const ESTAT_INICIAL: SolicitudState = { error: null, exit: false };

export async function crearSolicitud(
  _prevState: SolicitudState,
  formData: FormData,
): Promise<SolicitudState> {
  const t = await getDict();

  // Camp trampa anti-bots: invisible per a persones, si arriba emplenat descartem
  // la sol·licitud en silenci però responem com si hagués anat bé.
  if (typeof formData.get("empresa_web") === "string" && formData.get("empresa_web") !== "") {
    return { ...ESTAT_INICIAL, exit: true };
  }

  const tenant_id = formData.get("tenant_id");
  const recurs_ids = formData.getAll("recurs_ids").filter((v): v is string => typeof v === "string" && v !== "");
  const data = formData.get("data");
  const hora_inici = formData.get("hora_inici");
  const hora_fi = formData.get("hora_fi");
  const nom = formData.get("nom");
  const email = formData.get("email");
  const telefon = formData.get("telefon");
  const missatge = formData.get("missatge");

  if (typeof tenant_id !== "string" || !tenant_id) {
    return { ...ESTAT_INICIAL, error: t.reservaPublica.errorGeneric };
  }
  if (recurs_ids.length === 0) {
    return { ...ESTAT_INICIAL, error: t.reservaPublica.errorSeleccionaRecurs };
  }
  if (typeof nom !== "string" || !nom.trim()) {
    return { ...ESTAT_INICIAL, error: t.reservaPublica.errorNomObligatori };
  }
  if (typeof data !== "string" || !data) {
    return { ...ESTAT_INICIAL, error: t.reservaPublica.errorFaltaData };
  }
  if (
    typeof hora_inici !== "string" ||
    typeof hora_fi !== "string" ||
    !hora_inici ||
    !hora_fi ||
    hora_inici >= hora_fi
  ) {
    return { ...ESTAT_INICIAL, error: t.reservaPublica.errorFranjaHoraria };
  }

  const avui = new Date().toISOString().slice(0, 10);
  if (data < avui) {
    return { ...ESTAT_INICIAL, error: t.reservaPublica.errorDataPassada };
  }

  const admin = createAdminClient();

  const { data: recursos } = await admin
    .from("recursos")
    .select("id, actiu, bloquejat")
    .in("id", recurs_ids)
    .eq("tenant_id", tenant_id);

  if (
    !recursos ||
    recursos.length !== recurs_ids.length ||
    recursos.some((r) => !r.actiu || r.bloquejat)
  ) {
    return { ...ESTAT_INICIAL, error: t.reservaPublica.errorRecursNoDisponible };
  }

  const camps = {
    tenant_id,
    data,
    hora_inici,
    hora_fi,
    nom: nom.trim(),
    email: typeof email === "string" && email.trim() ? email.trim() : null,
    telefon: typeof telefon === "string" && telefon.trim() ? telefon.trim() : null,
    missatge: typeof missatge === "string" && missatge.trim() ? missatge.trim() : null,
  };

  const { error } = await admin
    .from("sol_licituds_reserva")
    .insert(recurs_ids.map((recurs_id) => ({ ...camps, recurs_id })));

  if (error) {
    return { ...ESTAT_INICIAL, error: t.reservaPublica.errorEnviar };
  }

  return { ...ESTAT_INICIAL, exit: true };
}
