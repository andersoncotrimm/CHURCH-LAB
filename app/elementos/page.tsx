import { PsdLibraryView, type PsdLibrarySearchParams } from "@/components/psd/psd-library-view";

export const dynamic = "force-dynamic";

export default async function ElementosPage({ searchParams }: { searchParams: PsdLibrarySearchParams }) {
  return (
    <PsdLibraryView
      contentType="elementos"
      title="Elementos"
      description="Ícones, formas e peças avulsas para compor suas artes."
      searchPlaceholder="Pesquisar elementos..."
      emptyTitle="Nenhum elemento publicado ainda"
      emptyDescription="Assim que a equipe publicar elementos no admin, eles aparecem aqui."
      searchParams={searchParams}
    />
  );
}
