import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Cridat pel cron de Vercel (vercel.json) el dia 1 de cada mes: genera un
// esborrany de factura de plataforma per a cada tenant amb quota_mensual
// definida, si encara no n'hi ha una per aquest període. Idempotent.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const ara = new Date();
  const periode_any = ara.getFullYear();
  const periode_mes = ara.getMonth() + 1;

  const { data: plataforma } = await supabase
    .from("plataforma")
    .select("iva_percent")
    .limit(1)
    .single();
  const iva = plataforma?.iva_percent ?? 21;

  const { data: tenants, error: errorTenants } = await supabase
    .from("tenants")
    .select("id, quota_mensual")
    .not("quota_mensual", "is", null)
    .gt("quota_mensual", 0);

  if (errorTenants) {
    return NextResponse.json({ error: errorTenants.message }, { status: 500 });
  }

  let creades = 0;
  for (const tenant of tenants ?? []) {
    const base = tenant.quota_mensual as number;
    const total = Math.round(base * (1 + iva / 100) * 100) / 100;

    const { data, error } = await supabase
      .from("factures_plataforma")
      .upsert(
        {
          tenant_id: tenant.id,
          periode_any,
          periode_mes,
          base_imposable: base,
          iva_percent: iva,
          total,
          estat: "esborrany",
        },
        { onConflict: "tenant_id,periode_any,periode_mes", ignoreDuplicates: true },
      )
      .select("id");

    if (!error && data && data.length > 0) creades++;
  }

  return NextResponse.json({ ok: true, creades });
}
