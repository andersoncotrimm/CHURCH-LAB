import {
  CalendarDays,
  Users,
  MessageSquare,
  FolderOpen,
  Layers,
  ClipboardList,
  Ticket,
  BadgeCheck,
  LayoutDashboard,
  Workflow,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Eventos",
    description: "Planeje, publique e acompanhe cultos, conferências e encontros.",
  },
  {
    icon: Users,
    title: "Pessoas",
    description: "Um cadastro único para membros, visitantes e voluntários.",
  },
  {
    icon: MessageSquare,
    title: "Comunicação",
    description: "Centralize avisos e mensagens para toda a igreja e equipes.",
  },
  {
    icon: Layers,
    title: "Materiais",
    description: "Crie e organize conteúdos de comunicação em um só lugar.",
  },
  {
    icon: FolderOpen,
    title: "Biblioteca de arquivos",
    description: "Slides, áudios, artes e documentos sempre acessíveis.",
  },
  {
    icon: Workflow,
    title: "Ministérios",
    description: "Gerencie equipes, escalas e responsabilidades por ministério.",
  },
  {
    icon: ClipboardList,
    title: "Formulários",
    description: "Crie formulários personalizados para qualquer finalidade.",
  },
  {
    icon: Ticket,
    title: "Inscrições",
    description: "Abra inscrições para eventos e acompanhe vagas em tempo real.",
  },
  {
    icon: BadgeCheck,
    title: "Credenciamento",
    description: "Check-in e credenciais para eventos e conferências.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboards",
    description: "Indicadores claros sobre pessoas, eventos e engajamento.",
  },
];

function Features() {
  return (
    <section id="recursos" className="border-t border-border bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Recursos
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Tudo o que a sua equipe precisa, sem depender de planilhas
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Um sistema pensado para o dia a dia da igreja — dos bastidores ao altar.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}

          <div className="flex flex-col justify-center rounded-2xl border border-dashed border-accent-200 bg-accent-50/50 p-6">
            <p className="text-sm font-semibold text-accent-700">E muito mais em construção</p>
            <p className="mt-1.5 text-sm text-accent-700/80">
              Automações e integrações chegando nas próximas versões.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Features };
