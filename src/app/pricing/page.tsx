'use client';

import Navbar from '@/components/Navbar';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import { Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const faqs = [
    {
      q: 'Kann ich meinen Tarif jederzeit wechseln?',
      a: 'Ja, du kannst deinen Tarif jederzeit im Dashboard upgraden, downgraden oder monatlich kündigen. Änderungen werden sofort wirksam.'
    },
    {
      q: 'Gibt es Einrichtungs- oder versteckte Gebühren?',
      a: 'Nein, es gibt keine Einrichtungsgebühren und keine versteckten Kosten. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.'
    },
    {
      q: 'Wie funktionieren die tischgenauen QR-Codes?',
      a: 'Jedem Tisch wird ein eindeutiger QR-Code zugeordnet. Wenn Gäste diesen scannen, wissen das System und dein Servicepersonal sofort, von welchem Tisch bestellt wurde.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#D1DCDB] text-[#003527] flex flex-col selection:bg-emerald-500/20 selection:text-[#003527]">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 bg-[#f9f9f8] text-[#191c1c]">
        {/* Short Hero Page Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-10 mt-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2 bg-[#003527]/10 text-[#003527] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#003527]/10">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Tarife & Preise
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold font-sans text-[#003527] tracking-tight leading-none mb-4">
              Finde den passenden Plan.
            </h1>
            <p className="text-base text-[#404944] max-w-2xl font-sans">
              Egal ob kleiner Imbiss, gemütliches Café oder etabliertes Restaurant – wir haben das passende Paket für deinen Erfolg.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#f9f9f8] via-[#e4e9e8]/30 to-[#f9f9f8] pointer-events-none" />
          <div className="relative z-10">
            <PricingSection />
          </div>
        </div>

        {/* Short FAQ Section */}
        <section className="max-w-3xl mx-auto px-6 py-12 border-t border-[#bfc9c3]/30">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <HelpCircle className="w-5 h-5 text-[#003527]/70" />
            <h2 className="text-xl font-bold text-[#003527] tracking-tight font-sans">
              Häufig gestellte Fragen
            </h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/30 hover:border-[#003527]/20 transition-all">
                <h3 className="font-bold text-sm text-[#003527] mb-2 font-sans flex items-start gap-2">
                  <span className="text-emerald-600 font-extrabold">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-xs text-[#404944] leading-relaxed font-sans pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
