import { Check, X } from 'lucide-react';
import Link from 'next/link';

export default function PricingSection() {
  const tiers = [
    {
      name: 'Free / Kostenlos',
      price: '0,00 €',
      description: 'Ideal für kleine Betriebe & zum Testen',
      features: [
        { text: '1 Digitale Speisekarte', included: true },
        { text: 'Bis zu 15 Gerichte & Getränke', included: true },
        { text: 'Standard QR-Code zum Scannen', included: true },
        { text: 'Allergen-Kennzeichnung', included: true },
        { text: 'Markenfarben & eigenes Logo', included: false },
      ],
      cta: 'Kostenlos starten',
      popular: false,
    },
    {
      name: 'Starter',
      price: '6,99 €',
      description: 'Für wachsende Bistros und Cafés',
      features: [
        { text: '1 Digitale Speisekarte', included: true },
        { text: 'Unbegrenzte Gerichte & Getränke', included: true },
        { text: 'Tischgenaue QR-Codes', included: true },
        { text: 'Eigenes Logo & Markenfarben', included: true },
        { text: 'E-Mail-Support', included: true },
      ],
      cta: 'Jetzt starten',
      popular: false,
    },
    {
      name: 'Premium',
      price: '14,99 €',
      description: 'Die Komplettlösung für volle Digitalisierung',
      features: [
        { text: 'Unbegrenzte Speisekarten', included: true },
        { text: 'White-Labeling (Kein Dáhon-Logo)', included: true },
        { text: 'Bestellungen & Zahlungen am Tisch', included: true },
        { text: 'Automatische Übersetzung (3 Sprachen)', included: true },
        { text: '24/7 Premium-Support', included: true },
      ],
      cta: 'Premium wählen',
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="px-6 lg:px-8 max-w-7xl mx-auto py-20 bg-transparent">
      {/* Header */}
      <div className="text-center mb-16 flex flex-col items-center">
        <span className="bg-[#d1dcdb] text-[#043f2d] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4 font-sans">
          Preise
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold font-sans text-[#003527] tracking-tight">
          Einfache, transparente Preise
        </h2>
        <p className="text-base text-[#404944] mt-3 max-w-2xl font-sans">
          Wähle den passenden Tarif und starte noch heute mit deiner digitalen Speisekarte.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier, idx) => {
          return (
            <div
              key={idx}
              className={`p-8 rounded-[2.5rem] flex flex-col justify-between border relative transition-all duration-300 ${
                tier.popular
                  ? 'bg-white border-[#003527] shadow-none'
                  : 'bg-[#f3f4f3] border-[#bfc9c3]/30 hover:border-[#003527]/20'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#003527] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Beliebteste Wahl
                </span>
              )}

              <div>
                <h3 className="text-xl font-semibold font-sans text-[#003527] mb-1">
                  {tier.name}
                </h3>
                <p className="text-xs text-[#404944] mb-8 font-sans">
                  {tier.description}
                </p>
                <div className="mb-8 flex items-baseline">
                  <span className="text-4xl lg:text-5xl font-semibold font-sans text-[#003527] tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[#404944] ml-2 font-sans">/ Monat</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {tier.features.map((feat, fidx) => (
                    <li
                      key={fidx}
                      className={`flex items-center gap-3 text-sm font-sans ${
                        feat.included ? 'text-[#404944]' : 'text-[#404944]/40'
                      }`}
                    >
                      {feat.included ? (
                        <Check className="h-4.5 w-4.5 text-[#003527] shrink-0" />
                      ) : (
                        <X className="h-4.5 w-4.5 text-[#404944]/40 shrink-0" />
                      )}
                      <span>{feat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/onboarding"
                className="w-full"
              >
                <button
                  className={`w-full py-4 rounded-2xl font-sans text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                    tier.popular
                      ? 'bg-[#003527] text-white hover:bg-[#0b513d]'
                      : 'border border-[#003527] text-[#003527] hover:bg-[#003527] hover:text-white'
                  }`}
                >
                  {tier.cta}
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
