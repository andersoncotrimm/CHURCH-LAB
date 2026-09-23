import { PsdLibraryView, type PsdLibrarySearchParams } from "@/components/psd/psd-library-view";

export const dynamic = "force-dynamic";

export default async function PluginsPage({ searchParams }: { searchParams: PsdLibrarySearchParams }) {
  return (
    <PsdLibraryView
      contentType="plugins"
      title="Plugins"
      description="Extensões e plugins prontos para instalar."
      searchPlaceholder="Pesquisar plugins..."
      emptyTitle="Nenhum plugin publicado ainda"
      emptyDescription="Assim que a equipe publicar plugins no admin, eles aparecem aqui."
      searchParams={searchParams}
    />
  );
}
