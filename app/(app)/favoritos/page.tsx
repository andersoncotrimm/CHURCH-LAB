import Link from "next/link";
import { Heart } from "lucide-react";
import { PsdCard } from "@/components/psd/psd-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import type { PsdFile } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: favorites } = await supabase
    .from("favorites")
    .select("psd_id, psd_files(*, psd_categories(categories(*)))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  interface FavoriteRow {
    psd_files:
      | (Omit<PsdFile, "categories" | "downloadsCount"> & {
          is_published: boolean;
          psd_categories: { categories: PsdFile["categories"][number] | null }[] | null;
        })
      | null;
  }

  const psds: PsdFile[] = [];
  for (const row of (favorites ?? []) as unknown as FavoriteRow[]) {
    const psdRow = row.psd_files;
    if (!psdRow || !psdRow.is_published) continue;
    psds.push({
      ...psdRow,
      categories: (psdRow.psd_categories ?? [])
        .map((pc) => pc.categories)
        .filter((c): c is PsdFile["categories"][number] => c !== null),
      downloadsCount: 0,
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Favoritos</h1>
        <p className="text-sm text-muted-foreground">Materiais que você marcou para encontrar rápido depois.</p>
      </div>

      {psds.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Nenhum favorito ainda"
          description="Toque no coração de um PSD na biblioteca para salvá-lo aqui."
          action={
            <Link href="/psd">
              <Button variant="accent">Explorar biblioteca</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {psds.map((psd) => (
            <PsdCard key={psd.id} psd={psd} isFavorited isLoggedIn />
          ))}
        </div>
      )}
    </div>
  );
}
