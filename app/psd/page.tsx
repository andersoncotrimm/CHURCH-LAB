import { PsdLibraryView, type PsdLibrarySearchParams } from "@/components/psd/psd-library-view";

export const dynamic = "force-dynamic";

export default async function PsdLibraryPage({ searchParams }: { searchParams: PsdLibrarySearchParams }) {
  return (
    <PsdLibraryView
      contentType="psd"
      title="Biblioteca PSD"
      description="Materiais profissionais prontos para editar."
      searchPlaceholder="Pesquisar PSDs..."
      emptyTitle="Nenhum PSD publicado ainda"
      emptyDescription="Assim que a equipe publicar materiais no admin, eles aparecem aqui."
      searchParams={searchParams}
    />
  );
}
