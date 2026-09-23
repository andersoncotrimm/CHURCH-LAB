import { PsdLibraryView, type PsdLibrarySearchParams } from "@/components/psd/psd-library-view";

export const dynamic = "force-dynamic";

export default async function FerramentasPage({ searchParams }: { searchParams: PsdLibrarySearchParams }) {
  return (
    <PsdLibraryView
      contentType="ferramentas"
      title="Ferramentas"
      description="Utilitários e ferramentas para o dia a dia da equipe."
      searchPlaceholder="Pesquisar ferramentas..."
      emptyTitle="Nenhuma ferramenta publicada ainda"
      emptyDescription="Assim que a equipe publicar ferramentas no admin, elas aparecem aqui."
      searchParams={searchParams}
    />
  );
}
