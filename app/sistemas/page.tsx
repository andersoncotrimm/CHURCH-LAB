import { PsdLibraryView, type PsdLibrarySearchParams } from "@/components/psd/psd-library-view";

export const dynamic = "force-dynamic";

export default async function SistemasPage({ searchParams }: { searchParams: PsdLibrarySearchParams }) {
  return (
    <PsdLibraryView
      contentType="sistemas"
      title="Sistemas"
      description="Templates de sistemas e painéis prontos."
      searchPlaceholder="Pesquisar sistemas..."
      emptyTitle="Nenhum sistema publicado ainda"
      emptyDescription="Assim que a equipe publicar sistemas no admin, eles aparecem aqui."
      searchParams={searchParams}
    />
  );
}
