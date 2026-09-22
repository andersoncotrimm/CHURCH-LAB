"use client";

import Image from "next/image";
import { FileType, HardDrive, Ruler, Layers, ImageOff, Zap } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from "@/components/psd/download-button";
import { CanvaButton } from "@/components/psd/canva-button";
import { computeCtaState } from "@/lib/credits";
import type { PsdFile } from "@/lib/types/psd";

export interface PsdDetailModalProps {
  psd: PsdFile;
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  availableCredits: number | null;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function PsdDetailModal({ psd, open, onClose, isLoggedIn, availableCredits }: PsdDetailModalProps) {
  const fileSize = formatFileSize(psd.file_size);
  const ctaState = computeCtaState(isLoggedIn, availableCredits, psd.credit_cost);
  const hasPsd = !!psd.file_path;
  const hasCanva = !!psd.canva_url;

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
          {psd.preview_url || psd.thumbnail_url ? (
            <Image
              src={psd.preview_url ?? psd.thumbnail_url!}
              alt={psd.title}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ImageOff className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {psd.categories.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {psd.categories.map((c) => (
                <Badge key={c.id} variant="accent">
                  {c.name}
                </Badge>
              ))}
            </div>
          )}

          <h2 className="pr-8 text-lg font-semibold text-foreground">{psd.title}</h2>

          {psd.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{psd.description}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4">
            {psd.dimensions && (
              <div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Ruler className="h-3.5 w-3.5" />
                  Dimensões
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">{psd.dimensions}</p>
              </div>
            )}
            {psd.slides_count && (
              <div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  Slides
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">{psd.slides_count}</p>
              </div>
            )}
            {hasPsd && psd.file_format && (
              <div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileType className="h-3.5 w-3.5" />
                  Formato
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">{psd.file_format}</p>
              </div>
            )}
            {hasPsd && fileSize && (
              <div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HardDrive className="h-3.5 w-3.5" />
                  Tamanho
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">{fileSize}</p>
              </div>
            )}
          </div>

          {isLoggedIn && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Você tem{" "}
              <span className="font-semibold text-foreground">
                {availableCredits === null ? 0 : availableCredits}
              </span>{" "}
              créditos disponíveis
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2">
            {hasPsd && (
              <DownloadButton
                psdId={psd.id}
                creditCost={psd.credit_cost}
                initialState={ctaState}
                availableCredits={availableCredits}
              />
            )}
            {hasCanva && (
              <CanvaButton
                psdId={psd.id}
                creditCost={psd.credit_cost}
                initialState={ctaState}
                availableCredits={availableCredits}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
