"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { getRedownloadUrl } from "@/app/actions/redownload";

export interface RedownloadButtonProps extends Omit<ButtonProps, "onClick" | "loading"> {
  psdId: string;
  label?: string;
}

function RedownloadButton({ psdId, label = "Baixar novamente", ...buttonProps }: RedownloadButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await getRedownloadUrl(psdId);
    setLoading(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button onClick={handleClick} loading={loading} {...buttonProps}>
        <Download className="h-4 w-4" />
        {label}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export { RedownloadButton };
