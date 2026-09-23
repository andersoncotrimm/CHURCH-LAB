import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/app/profile-form";
import { createClient } from "@/utils/supabase/server";
import { getUserCreditsSummary } from "@/lib/credits";

export const dynamic = "force-dynamic";

export default async function MinhaContaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, credits] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, avatar_url, created_at, username").eq("id", user.id).single(),
    getUserCreditsSummary(supabase, user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Minha Conta</h1>
        <p className="text-sm text-muted-foreground">Seus dados de perfil e assinatura.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar name={profile?.full_name || user.email || "Usuário"} src={profile?.avatar_url ?? undefined} size="lg" />
          <div>
            <CardTitle>{profile?.full_name || "Sem nome cadastrado"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {credits?.planName ? `Plano ${credits.planName}` : "Sem plano ativo"} · Membro desde{" "}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                : "—"}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
            email={user.email ?? ""}
            username={profile?.username ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
