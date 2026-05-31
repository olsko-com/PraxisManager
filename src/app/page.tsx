import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BrandStrip from '@/components/BrandStrip';
import BentoFeatures from '@/components/BentoFeatures';
import InnovationSplit from '@/components/InnovationSplit';
import InnovationTabs from '@/components/InnovationTabs';
import PricingSection from '@/components/PricingSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#D1DCDB] text-[#003527] flex flex-col selection:bg-emerald-500/20 selection:text-[#003527]">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />
        
        {/* Other Marketing sections */}
        <div className="bg-[#f9f9f8] text-[#191c1c]">
          <BrandStrip />
          <BentoFeatures />
          <InnovationSplit />
          <InnovationTabs />
          
          {/* Final CTA Banner inline as blueprint */}
          <section className="bg-[#003527] py-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
              <span className="text-[120px] md:text-[200px] lg:text-[300px] font-extrabold text-white select-none font-sans">
                PRAXIS
              </span>
            </div>
            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-sans text-white mb-6">
                Bereit für die Zukunft?
              </h2>
              <p className="text-base text-zinc-300 max-w-2xl mb-10 font-sans leading-relaxed">
                Schließe dich über 1.500 Therapeuten und Freelancern an, die ihre Praxisorganisation mit PraxisManager digitalisiert haben.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/onboarding" className="bg-white text-[#003527] px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 hover:bg-zinc-100 cursor-pointer flex items-center justify-center">
                  Jetzt kostenlos starten
                </Link>
                <button className="bg-[#0b513d] text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 hover:bg-[#12664e] cursor-pointer">
                  Demo buchen
                </button>
              </div>
            </div>
          </section>

          <PricingSection />
          <FaqSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
