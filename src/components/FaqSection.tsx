'use client';

import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const faqs = [
    {
      q: 'Wofür wird das System genutzt?',
      a: 'Dáhon ist eine Plattform für digitale Speisekarten, die Restaurants dabei hilft, ihre Speisekarten kontaktlos anzubieten, Abläufe zu beschleunigen und Gästen ein modernes Bestellerlebnis direkt am Smartphone zu bieten.',
    },
    {
      q: 'Lässt es sich an Kassen (POS) anbinden?',
      a: 'Ja! Wir unterstützen Schnittstellen zu den gängigsten Kassen- und Abrechnungssystemen (POS) sowie Warenwirtschaftssystemen für einen reibungslosen Ablauf.',
    },
    {
      q: 'Ist es auch für Food-Trucks oder Cafés geeignet?',
      a: 'Absolut. Dáhon ist extrem flexibel skalierbar und eignet sich hervorragend für einzelne Food-Trucks, kleine Cafés bis hin zu großen Restaurantketten.',
    },
  ];

  return (
    <section className="px-6 lg:px-8 max-w-4xl mx-auto py-20 bg-transparent">
      {/* Header */}
      <div className="text-center mb-12 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-semibold font-sans text-[#003527] tracking-tight">
          Häufig gestellte Fragen
        </h2>
        <p className="text-base text-[#404944] mt-3 max-w-xl font-sans">
          Hier findest du Antworten auf die wichtigsten Fragen rund um unsere digitale Speisekarte.
        </p>
      </div>

      {/* Collapsible details */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-[#f3f4f3] rounded-3xl border border-[#bfc9c3]/30 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
            open={idx === 0}
          >
            <summary className="flex justify-between items-center p-6 cursor-pointer list-none select-none">
              <span className="text-base font-bold font-sans text-[#003527]">
                {faq.q}
              </span>
              <ChevronDown className="h-5 w-5 text-[#003527] transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 text-sm text-[#404944] leading-relaxed font-sans">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      {/* Support Box */}
      <div className="mt-12 bg-[#D1DCDB]/30 rounded-[2.5rem] p-8 text-center border border-[#D1DCDB]">
        <div className="flex justify-center -space-x-2.5 mb-4">
          <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#bfc9c3] flex items-center justify-center text-[10px] font-bold text-[#003527]">M</div>
          <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#f3f4f3] flex items-center justify-center text-[10px] font-bold text-[#003527]">J</div>
          <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#003527] text-white flex items-center justify-center text-[10px] font-bold">K</div>
        </div>
        <h3 className="text-xl font-semibold font-sans text-[#003527]">
          Haben Sie noch weitere Fragen?
        </h3>
        <p className="text-sm text-[#404944] mt-2 mb-6 font-sans">
          Unser freundliches Support-Team steht Ihnen jederzeit gerne zur Seite.
        </p>
        <button className="bg-[#003527] text-white px-8 py-3 rounded-full text-sm font-bold tracking-wide hover:bg-[#0b513d] transition-all cursor-pointer">
          Kontakt aufnehmen
        </button>
      </div>
    </section>
  );
}
