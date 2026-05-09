import { companyLogos, trustItems } from '@/app/features/landing/data/landing';

export function TrustSection() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24" id="besim">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Company logos */}
        <div className="mb-16 text-center">
          <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Kompani që rekrutojnë
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {companyLogos.map((name) => (
              <span
                key={name}
                className="text-sm font-bold tracking-tight text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t pt-16">
          <div className="grid gap-10 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.title} className="flex flex-col gap-4">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
