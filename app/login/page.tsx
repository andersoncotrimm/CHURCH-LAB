"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";

export default function LoginPage() {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = React.useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: integrar com Supabase Auth (sign in / sign up).
  }

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-foreground px-12 py-10 text-background lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_theme(colors.accent.700)_0%,_transparent_55%)] opacity-50"
        />
        <Link href="/" className="relative z-10">
          <Logo inverted />
        </Link>

        <div className="relative z-10 max-w-sm">
          <p className="text-2xl font-semibold leading-snug tracking-tight text-balance">
            “Tudo o que nossa equipe precisa para organizar a igreja, em um
            só lugar.”
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-background/15" />
            <div>
              <p className="text-sm font-medium">Camila Souza</p>
              <p className="text-xs text-background/60">Coordenadora de Comunicação</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-background/50">
          © {new Date().getFullYear()} CHURCH-LAB. Todos os direitos reservados.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <Tabs
            className="mb-8 w-full"
            value={mode}
            onValueChange={(value) => setMode(value as "login" | "signup")}
            items={[
              { value: "login", label: "Entrar" },
              { value: "signup", label: "Criar conta" },
            ]}
          />

          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "login"
                ? "Entre com seu e-mail para continuar no CHURCH-LAB."
                : "Comece a organizar a sua igreja em minutos."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <Input label="Nome completo" name="name" placeholder="Seu nome" autoComplete="name" />
            )}

            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="voce@igreja.com"
              autoComplete="email"
              startIcon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label="Senha"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              startIcon={<Lock className="h-4 w-4" />}
              required
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pointer-events-auto text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {mode === "login" ? (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  Lembrar acesso
                </label>
                <Link href="#" className="text-sm font-medium text-accent hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
            ) : (
              <label className="flex items-start gap-2 pt-1 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
                />
                Concordo com os termos de uso e a política de privacidade.
              </label>
            )}

            <Button type="submit" variant="accent" size="lg" className="w-full">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Ainda não tem uma conta?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="font-medium text-accent hover:underline"
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-medium text-accent hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
