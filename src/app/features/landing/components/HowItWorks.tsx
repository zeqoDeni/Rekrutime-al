import { howItWorksSteps } from '@/app/features/landing/data/landing';

export function HowItWorks() {
  return (
    <section className="bg-background py-16 sm:py-20" id="si-funksionon">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Si funksionon Rekrutime</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            E njëjta qartësi për kërkuesit e punës dhe për ekipet që po punësojnë.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <article className="rounded-md border bg-card p-6 shadow-sm shadow-slate-950/4" key={step.title}>
              <div className="flex items-center justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
