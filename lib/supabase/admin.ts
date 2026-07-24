import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Servidor NOMÉS: fa servir la clau service_role, que salta totes les RLS.
// Mai importar aquest fitxer des d'un Client Component ni exposar la clau amb NEXT_PUBLIC_.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
