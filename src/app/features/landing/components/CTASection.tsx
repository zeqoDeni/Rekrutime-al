import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/app/shared/ui/button';

export function CTASection() {
  return (
    <section className="bg-foreground px-4 py-16 text-background sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">Gjej çfarë vjen më pas në karrierë ose në hiring.</h2>
          <p className="mt-3 text-base leading-7 text-background/70">
            Shfleto role aktive dhe profile të verifikuara me të dhëna të plota, pa hapa të panevojshëm.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-md bg-primary px-6 text-primary-foreground hover:bg-primary/90">
            <a href="#jobs">
              <Search data-icon="inline-start" />
              Shfleto punët
            </a>
          </Button>
          <Button
            asChild
            className="h-12 rounded-md border-background/20 bg-background px-6 text-foreground hover:bg-background/90"
            variant="outline"
          >
            <a href="#candidates">
              Gjej kandidatë
              <ArrowRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
