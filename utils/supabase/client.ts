import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para uso em Client Components (navegador).
//
// A checagem das env vars fica DENTRO da função (não no topo do módulo) de
// propósito: o Next.js importa o módulo de toda rota durante o build (fase
// "Collecting page data") só para inspecionar seus exports, mesmo em rotas
// dinâmicas — um throw no topo do módulo derruba o build inteiro nesse
// momento. Aqui o erro só acontece quando createClient() é de fato chamado,
// em tempo de requisição.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY nas variáveis de ambiente."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
