'use client';

import { useState, useEffect } from 'react';
import { Gauge, Languages, Sparkles } from 'lucide-react';
import Image from 'next/image';

const tabs = [
  {
    id: 0,
    title: 'Performance',
    description: 'Automatisiere Bestellungen, Tischbelegungen und Abläufe. Konzentriere dich auf leckeres Essen, nicht auf lästigen Papierkram.',
    icon: Gauge,
    image: 'https://images.pexels.com/photos/1015568/pexels-photo-1015568.jpeg?auto=compress&cs=tinysrgb&w=800',
    floatingBadge: {
      title: 'Bestellungen heute',
      meta: '284 Bestellungen verarbeitet',
      avatars: ['M', 'J', 'K'],
    },
  },
  {
    id: 1,
    title: 'Barrierefreiheit',
    description: 'Biete eine sofortige, mehrsprachige Speisekarte für jeden Gast direkt am Tisch – weil Gastfreundschaft global ist.',
    icon: Languages,
    image: 'https://images.pexels.com/photos/5412437/pexels-photo-5412437.jpeg?auto=compress&cs=tinysrgb&w=800',
    floatingBadge: {
      title: 'Mehrsprachigkeit',
      meta: '8 Sprachen übersetzt',
      avatars: ['DE', 'EN', 'FR'],
    },
  },
  {
    id: 2,
    title: 'Innovation',
    description: 'Aktualisiere Speisekarten in Echtzeit, passe das Design an dein Branding an und sammle direktes Feedback.',
    icon: Sparkles,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    floatingBadge: {
      title: 'Live-Updates',
      meta: 'Zuletzt aktualisiert vor 2 Min.',
      avatars: ['★', '★', '★'],
    },
  },
];

export default function InnovationTabs() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-6 lg:px-8 max-w-7xl mx-auto py-20 bg-transparent">
      
      {/* Title block matching layout */}
      <div className="text-center mb-16 flex flex-col items-center">
        <span className="bg-[#d1dcdb] text-[#043f2d] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4 font-sans inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 fill-current" /> Innovative Module
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-sans text-[#003527] tracking-tight">
          Unsere neuesten Module im Einsatz
        </h2>
        <p className="text-base text-[#404944] mt-3 max-w-2xl font-sans">
          Erlebe, wie unsere interaktiven Speisekarten-Module die Gästezufriedenheit und die Bestellprozesse optimieren.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left side: Interactive Tab list */}
        <div className="lg:col-span-5 space-y-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-6 rounded-[1.5rem] border transition-all duration-300 flex items-start gap-4 cursor-pointer focus:outline-none ${
                  isActive
                    ? 'bg-[#f3f4f3] border-[#bfc9c3]/60 text-[#003527]'
                    : 'bg-transparent border-transparent hover:bg-[#f3f4f3]/50 text-[#404944]'
                }`}
              >
                <div
                  className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[#003527] text-white' : 'bg-[#bfc9c3]/30 text-[#003527]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-bold text-base font-sans">
                    {tab.title}
                  </h4>
                  <p className="text-sm text-[#404944] font-sans leading-relaxed">
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right side: Dynamic Image Container */}
        <div className="lg:col-span-7 relative h-[450px] lg:h-[500px] w-full rounded-[2.5rem] overflow-hidden">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <div
                key={tab.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  alt={tab.title}
                  src={tab.image}
                  fill
                  sizes="(max-w-768px) 100vw, 50vw"
                  className="object-cover w-full h-full"
                  priority={tab.id === 0}
                />
                
                {/* Floating Glass Badges */}
                {isActive && (
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20">
                    <div className="bg-white/75 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {tab.floatingBadge.avatars.map((av, avIdx) => (
                          <div
                            key={avIdx}
                            className="w-6 h-6 rounded-full bg-[#003527] text-white text-[8px] font-bold flex items-center justify-center border border-white"
                          >
                            {av}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#003527] uppercase tracking-wide">
                          {tab.floatingBadge.title}
                        </p>
                        <p className="text-[9px] text-[#404944]">
                          {tab.floatingBadge.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
