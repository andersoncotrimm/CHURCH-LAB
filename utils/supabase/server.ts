import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase para uso em Server Components, Route Handlers e Server Actions.
//
// A checagem das env vars fica DENTRO da função (não no topo do módulo) de
// propósito: o Next.js importa o módulo de toda rota durante o build (fase
// "Collecting page data") só para inspecionar seus exports, mesmo em rotas
// dinâmicas — um throw no topo do módulo derruba o build inteiro nesse
// momento, mesmo numa rota já marcada force-dynamic. Aqui o erro só
// acontece quando createClient() é de fato chamado, em tempo de requisição.
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY nas variáveis de ambiente."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // `setAll` chamado a partir de um Server Component.
          // Pode ser ignorado porque o middleware já cuida do refresh de sessão.
        }
      },
    },
  });
}
