'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const tiers = [
    {
      name: 'Starter',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Ideal für Kioske, Food-Trucks oder kleinere Cafés.',
      features: [
        'Bis zu 25 Gerichte & Getränke',
        '1 Tisch-QR-Code (Universell)',
        'Standard-Design (Dunkel/Hell)',
        'Allergen-Kennzeichnung',
        'PDF-Speisekarte Upload',
      ],
      cta: 'Kostenlos starten',
      popular: false,
    },
    {
      name: 'Professional',
      priceMonthly: 24,
      priceAnnual: 19,
      description: 'Perfekt für Restaurants, Bars und Pizzerien.',
      features: [
        'Unbegrenzte Gerichte & Getränke',
        'Tischgenaue QR-Codes (Dynamisch)',
        'Premium-Designs & eigene Logos',
        'Automatische Übersetzung (3 Sprachen)',
        'Zutaten- & Allergenfilter',
        'Gästebewertungen & Feedback-System',
        'Besucher-Statistiken',
      ],
      cta: 'Jetzt 14 Tage testen',
      popular: true,
    },
    {
      name: 'Premium',
      priceMonthly: 49,
      priceAnnual: 39,
      description: 'Für Restaurants, die Bestellungen & Zahlungen digitalisieren wollen.',
      features: [
        'Alles aus Professional',
        'Bestellfunktion direkt am Tisch',
        'Bezahlen am Tisch (Apple Pay, Karte, etc.)',
        'Kassensystem-Schnittstellen (POS)',
        'E-Mail & Live-Chat Support 24/7',
        'Eigene Domain (z.B. karte.ihr-restaurant.de)',
      ],
      cta: 'Jetzt starten',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-zinc-50 relative border-t border-zinc-200/80">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-amber-600 uppercase mb-3">
            Faire Preise
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Tarife für jede Restaurantgröße
          </p>
          <p className="text-lg text-zinc-500 mt-4 leading-relaxed">
            Keine Einrichtungsgebühr. Keine versteckten Kosten. Jederzeit monatlich kündbar.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center mt-10 space-x-4">
            <span className={`text-sm font-semibold ${!isAnnual ? 'text-zinc-900' : 'text-zinc-400'}`}>
              Monatlich
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              type="button"
              className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-200 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span className="sr-only">Abrechnungszeitraum ändern</span>
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center ${isAnnual ? 'text-zinc-900' : 'text-zinc-400'}`}>
              Jährlich <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600">Sparen Sie 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, index) => {
            const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;
            return (
              <div
                key={index}
                className={`relative flex flex-col justify-between bg-white border ${
                  tier.popular ? 'border-amber-500 shadow-xl shadow-zinc-200 scale-105 md:scale-105 z-10' : 'border-zinc-200/80 hover:border-zinc-300'
                } rounded-3xl p-8 sm:p-10 transition-all duration-300`}
              >
                {/* Popular Tag */}
                {tier.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                    Empfohlen
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">{tier.name}</h3>
                  <p className="text-xs text-zinc-500 min-h-8 mb-6">{tier.description}</p>
                  
                  {/* Price display */}
                  <div className="flex items-baseline text-zinc-900 mb-8">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {price} €
                    </span>
                    <span className="text-zinc-400 text-sm ml-2">/ Monat</span>
                  </div>

                  <hr className="border-zinc-100 mb-8" />

                  {/* Feature checklist */}
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-sm text-zinc-650">
                        <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#simulator"
                  className={`w-full py-4 text-center text-sm font-bold rounded-xl transition-all duration-200 ${
                    tier.popular
                      ? 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-orange-500/10 hover:opacity-95 active:scale-[0.98]'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 active:scale-[0.98]'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
