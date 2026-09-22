"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle, MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

export default function RecuperarSenhaPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para login
        </Link>

        <div className="mb-8">
          <Logo />
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Recuperar senha</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {sent ? (
          <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha em instantes.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="voce@igreja.com"
              autoComplete="email"
              startIcon={<Mail className="h-4 w-4" />}
              required
              disabled={loading}
            />
            <Button type="submit" variant="accent" size="lg" className="w-full" loading={loading}>
              Enviar link de recuperação
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
