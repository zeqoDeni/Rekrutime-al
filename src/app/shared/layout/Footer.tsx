import { footerLinks } from '@/app/features/landing/data/landing';
import { Button } from '@/app/shared/ui/button';

export function Footer() {
  return (
    <footer className="border-t bg-background" id="kompani">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-b pb-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Kompanitë më të mira po punësojnë këtu.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Nëse po kërkon talent ose po kërkon rolin e radhës, ky është vendi ku procesi është i qartë dhe i shpejtë.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button asChild variant="outline">
              <a href="#candidates">Shiko kandidatët</a>
            </Button>
            <Button asChild>
              <a href="#jobs">Shiko punët</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 pt-10 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div className="flex flex-col gap-3" key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">{group.title}</h3>
                <div className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <a
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      href={link.href}
                      key={link.label}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; 2026 Rekrutime. Të gjitha të drejtat e rezervuara.</span>
            <span>Ndërtuar për tregun e punës në Shqipëri.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
