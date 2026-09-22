import { Check } from "lucide-react";

const AUDIENCES = [
  {
    title: "Liderança pastoral",
    description: "Visão consolidada da igreja para decisões mais rápidas e seguras.",
    points: ["Indicadores em tempo real", "Histórico de eventos e pessoas", "Visão por ministério"],
  },
  {
    title: "Equipes de comunicação",
    description: "Um fluxo único para criar, organizar e publicar conteúdo.",
    points: ["Biblioteca centralizada de materiais", "Organização por categoria", "Menos mensagens perdidas"],
  },
  {
    title: "Líderes de ministério",
    description: "Gestão simples de pessoas, escalas e atividades do time.",
    points: ["Cadastro de voluntários", "Formulários personalizados", "Comunicação direta com a equipe"],
  },
];

function ForTeams() {
  return (
    <section id="para-igrejas" className="border-t border-border bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Para igrejas e equipes
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Construído para como sua igreja realmente funciona
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <div
              key={audience.title}
              className="flex flex-col rounded-2xl border border-border bg-surface p-7 shadow-card"
            >
              <h3 className="text-lg font-semibold text-foreground">{audience.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {audience.description}
              </p>
              <ul className="mt-6 space-y-3">
                {audience.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { ForTeams };
