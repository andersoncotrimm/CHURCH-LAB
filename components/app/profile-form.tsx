"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { updateProfile } from "@/app/actions/profile";

export function ProfileForm({
  fullName,
  phone,
  email,
  username,
  avatarUrl,
  userId,
}: {
  fullName: string;
  phone: string;
  email: string;
  username: string;
  avatarUrl: string;
  userId: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState(avatarUrl);
  const [displayName, setDisplayName] = React.useState(fullName);

  function handleAvatarChange(file: File | null) {
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const supabase = createClient();
        const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/avatar-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type || undefined });
        if (uploadError) throw new Error(`Falha ao enviar a foto: ${uploadError.message}`);
        newAvatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }

      formData.set("avatar_url", newAvatarUrl);

      const result = await updateProfile(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setAvatarFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
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

      <div className="flex items-center gap-4">
        <Avatar name={displayName || email || "Usuário"} src={avatarPreview || undefined} size="lg" />
        <div>
          <label
            htmlFor="avatar"
            className="inline-flex cursor-pointer items-center rounded-lg border border-input bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            Trocar foto
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            disabled={loading}
            onChange={(event) => handleAvatarChange(event.target.files?.[0] ?? null)}
            className="sr-only"
          />
          {avatarFile && <p className="mt-1 text-xs text-success">Selecionada: {avatarFile.name}</p>}
        </div>
      </div>

      <Input
        label="E-mail"
        name="email"
        defaultValue={email}
        disabled
        readOnly
        hint="O e-mail não pode ser alterado por aqui."
      />
      <Input
        label="Nome completo"
        name="full_name"
        defaultValue={fullName}
        required
        disabled={loading}
        onChange={(event) => setDisplayName(event.target.value)}
      />
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
