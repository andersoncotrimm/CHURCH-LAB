import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a chave service_role — ignora RLS por completo.
 *
 * Só pode ser usado em código que roda inteiramente no servidor e nunca
 * recebe input direto do navegador sem validação prévia forte (ex.: o
 * webhook do Mercado Pago, que valida a assinatura antes de chamar isso).
 * Nunca importar este módulo num Client Component nem expor o que ele
 * retorna pro navegador sem filtrar.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase service role não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
