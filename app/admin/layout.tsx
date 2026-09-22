import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

// Usa cookies (sessão do Supabase) em toda requisição — nunca deve ser
// pré-renderizado estaticamente no build. Aplica-se a todo o subgrupo
// /admin/*, já que o dynamic de um layout é herdado pelas páginas filhas.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return (
    <AdminShell user={{ name: profile.full_name || user.email || "Admin", email: user.email ?? "" }}>
      {children}
    </AdminShell>
  );
}
