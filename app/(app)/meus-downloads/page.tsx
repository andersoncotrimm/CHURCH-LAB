import Link from "next/link";
import { Download, Zap, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RedownloadButton } from "@/components/psd/redownload-button";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function MeusDownloadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: downloads } = await supabase
    .from("downloads")
    .select("id, credits_spent, created_at, psd_files(id, title, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = downloads ?? [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meus Downloads</h1>
        <p className="text-sm text-muted-foreground">Histórico completo dos materiais que você já baixou.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Download className="h-6 w-6" />}
          title="Você ainda não baixou nenhum material"
          description="Seus downloads aparecem aqui assim que você baixar o primeiro PSD."
          action={
            <Link href="/psd">
              <Button variant="accent">Explorar biblioteca</Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PSD</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((download) => {
              const psd = download.psd_files as unknown as { id: string; title: string; slug: string } | null;
              return (
                <TableRow key={download.id}>
                  <TableCell className="font-medium">
                    {psd ? (
                      <Link href={`/psd/${psd.slug}`} className="hover:text-accent hover:underline">
                        {psd.title}
                      </Link>
                    ) : (
                      "Material removido"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(download.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      {download.credits_spent}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3" />
                      Concluído
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {psd && <RedownloadButton psdId={psd.id} variant="outline" size="sm" label="Baixar novamente" />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
