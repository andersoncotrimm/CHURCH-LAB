import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserCreditsSummary } from "@/lib/credits";

export interface ShellUser {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface ShellContext {
  isLoggedIn: boolean;
  user: ShellUser | null;
  planName: string | null;
  credits: number | null;
  isAdmin: boolean;
}

const LOGGED_OUT_CONTEXT: ShellContext = {
  isLoggedIn: false,
  user: null,
  planName: null,
  credits: null,
  isAdmin: false,
};

/**
 * Dados do menu/cabeçalho que dependem de quem está logado — usado pelas
 * páginas que compartilham a mesma URL entre visitante e membro (/psd,
 * /elementos, /categorias, /referencias, /planos, etc.), pra elas mostrarem
 * o menu de membro (créditos, downloads, conta) em vez do menu de
 * visitante quando a pessoa já estiver logada. Antes disso, PublicShell
 * sempre mostrava o menu/rodapé de visitante nessas páginas, mesmo pra
 * quem já tinha feito login — parecia que a pessoa tinha sido desconectada
 * ao navegar pra qualquer uma delas.
 */
export async function getShellContext(supabase: SupabaseClient): Promise<ShellContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return LOGGED_OUT_CONTEXT;

  const [{ data: profile }, creditsSummary] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url, is_admin").eq("id", user.id).maybeSingle(),
    getUserCreditsSummary(supabase, user.id),
  ]);

  return {
    isLoggedIn: true,
    user: {
      name: profile?.full_name || user.email || "Usuário",
      email: user.email ?? undefined,
      avatarUrl: profile?.avatar_url ?? undefined,
    },
    planName: creditsSummary?.planName ?? null,
    credits: creditsSummary?.available ?? null,
    isAdmin: profile?.is_admin ?? false,
  };
}
