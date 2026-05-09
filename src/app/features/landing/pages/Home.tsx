import { CTASection } from '../components/CTASection';
import { Footer } from '@/app/shared/layout/Footer';
import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { Navbar } from '@/app/shared/layout/Navbar';
import { TrustSection } from '../components/TrustSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground" id="krye">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}