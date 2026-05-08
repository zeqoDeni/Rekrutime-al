import { CTASection } from '../components/CTASection';
import { FeaturedCandidates } from '../components/FeaturedCandidates';
import { FeaturedJobs } from '../components/FeaturedJobs';
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
        <FeaturedJobs />
        <HowItWorks />
        <FeaturedCandidates />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}