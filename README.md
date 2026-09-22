# CHURCH-LAB

Plataforma digital para igrejas, ministérios, líderes e equipes de comunicação.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- Sistema de design próprio (`components/ui`)

## Status atual

Esta é a **fundação visual** do produto: telas e componentes de interface,
sem integrações de backend. Pontos de integração futura (autenticação,
dados reais, upload de arquivos, etc.) estão sinalizados no código com
comentários `// TODO: integrar`.

## Rotas

| Rota          | Descrição                                   |
| ------------- | -------------------------------------------- |
| `/`           | Landing page                                 |
| `/login`      | Autenticação (visual, sem backend)           |
| `/dashboard`  | Painel administrativo com dados fictícios    |
| `/biblioteca` | Biblioteca de arquivos e materiais           |
| `/eventos`    | Gestão visual de eventos                     |

## Desenvolvimento

```bash
npm install
npm run dev
```
