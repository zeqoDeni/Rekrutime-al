import { howItWorksSteps } from '@/app/features/landing/data/landing';

export function HowItWorks() {
  return (
    <section className="bg-background py-20 sm:py-24" id="si-funksionon">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Si funksionon
          </h2>
          <p className="mt-3 max-w-lg text-base text-muted-foreground">
            E njëjta qartësi për kërkuesit e punës dhe ekipet që po punësojnë.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-0 md:divide-x">
          {howItWorksSteps.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col gap-5 md:px-10 first:pl-0 last:pr-0"
            >
              <span className="text-6xl font-black leading-none text-primary/15">
                0{i + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
