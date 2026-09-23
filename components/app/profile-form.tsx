"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/actions/profile";

export function ProfileForm({
  fullName,
  phone,
  email,
  username,
}: {
  fullName: string;
  phone: string;
  email: string;
  username: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await updateProfile(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error) setError(result.error);
    else setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Dados atualizados.
        </div>
      )}

      <Input
        label="E-mail"
        name="email"
        defaultValue={email}
        disabled
        readOnly
        hint="O e-mail não pode ser alterado por aqui."
      />
      <Input label="Nome completo" name="full_name" defaultValue={fullName} required disabled={loading} />
      <Input label="Telefone" name="phone" defaultValue={phone} placeholder="(00) 00000-0000" disabled={loading} />
      <Input
        label="Nome de usuário (opcional)"
        name="username"
        defaultValue={username}
        placeholder="Ex: joao.silva"
        hint="Se preenchido, você pode entrar digitando só ele em vez do e-mail completo."
        disabled={loading}
      />

      <Button type="submit" variant="accent" loading={loading}>
        Salvar alterações
      </Button>
    </form>
  );
}
