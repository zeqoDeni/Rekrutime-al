import { Link } from 'react-router-dom';
import { Button } from '@/app/shared/ui/button';

export function CTASection() {
  return (
    <section className="bg-foreground px-4 py-20 text-background sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Gati për hapin tjetër?
        </h2>
        <p className="mt-4 text-base leading-7 text-background/60">
          Shfleto role aktive ose krijo llogarinë tënde falas — pa karta krediti.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-12 rounded-lg bg-primary px-8 text-base text-white hover:bg-primary/90"
          >
            <Link to="/jobs">Shiko rolet</Link>
          </Button>
          <Button
            asChild
            className="h-12 rounded-lg border border-background/20 bg-transparent px-8 text-base text-background hover:bg-background/10"
            variant="ghost"
          >
            <Link to="/signup">Regjistrohu falas</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
