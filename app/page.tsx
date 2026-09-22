import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { PsdHighlights } from "@/components/landing/psd-highlights";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ForTeams } from "@/components/landing/for-teams";
import { Cta } from "@/components/landing/cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { createClient } from "@/utils/supabase/server";
import { getPublishedPsds } from "@/lib/psd";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allPsds = await getPublishedPsds(supabase);
  const highlighted = [...allPsds]
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 8);

  let favoritedIds = new Set<string>();
  if (user) {
    const { data: favorites } = await supabase.from("favorites").select("psd_id").eq("user_id", user.id);
    favoritedIds = new Set((favorites ?? []).map((f) => f.psd_id));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <PsdHighlights psds={highlighted} favoritedIds={favoritedIds} isLoggedIn={!!user} />
        <Features />
        <HowItWorks />
        <ForTeams />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  );
}
