import { redirect } from "next/navigation";

// Redundante com o dynamic do layout pai (que já força toda a subárvore
// /admin/* a ser dinâmica), mas explícito aqui também por clareza e para
// não depender só da herança caso este arquivo mude no futuro.
export const dynamic = "force-dynamic";

export default function AdminIndexPage() {
  redirect("/admin/planos");
}
