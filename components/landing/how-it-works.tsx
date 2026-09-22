const STEPS = [
  {
    number: "01",
    title: "Configure sua igreja",
    description:
      "Crie o espaço da sua igreja, defina ministérios e convide sua equipe de liderança.",
  },
  {
    number: "02",
    title: "Organize o essencial",
    description:
      "Cadastre pessoas, publique eventos e centralize os materiais de comunicação.",
  },
  {
    number: "03",
    title: "Acompanhe em um painel só",
    description:
      "Dashboards, inscrições e atividades da igreja sempre visíveis para a liderança.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Como funciona
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Comece em três passos simples
          </h2>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block"
          />
          {STEPS.map((step) => (
            <div key={step.number} className="relative flex flex-col items-start">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-sm font-semibold text-accent shadow-subtle">
                {step.number}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HowItWorks };
