import { audienceCards, trustItems } from '@/app/features/landing/data/landing';

export function TrustSection() {
  return (
    <section className="bg-card py-16 sm:py-20" id="besim">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Ku startup-et dhe kandidatët lidhen drejtpërdrejt</h2>
            <p className="text-base leading-7 text-muted-foreground">
              Platforma është ndërtuar si marketplace modern punësimi, jo si portal klasik njoftimesh. Informacioni kryesor
              është i dukshëm që në hapin e parë.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {audienceCards.map((card) => (
                <div className="rounded-md border bg-background p-4" key={card.title}>
                  <card.icon className="size-5 text-primary" />
                  <div className="mt-4 text-sm font-semibold text-foreground">{card.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {trustItems.map((item) => (
              <article className="rounded-md border bg-background p-5 shadow-sm shadow-slate-950/4" key={item.title}>
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary/12 text-secondary">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
