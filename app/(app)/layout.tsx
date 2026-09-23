import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserCreditsSummary } from "@/lib/credits";
import { getCategories } from "@/lib/psd";
import { PlatformShell } from "@/components/app/platform-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, is_admin")
    .eq("id", user.id)
    .single();

  const [credits, categories] = await Promise.all([
    getUserCreditsSummary(supabase, user.id),
    getCategories(supabase),
  ]);

  return (
    <PlatformShell
      user={{
        name: profile?.full_name || user.email || "Usuário",
        email: user.email ?? undefined,
        avatarUrl: profile?.avatar_url ?? undefined,
      }}
      planName={credits?.planName ?? null}
      credits={credits?.available ?? null}
      categories={categories}
      isAdmin={profile?.is_admin ?? false}
    >
      {children}
    </PlatformShell>
  );
}
