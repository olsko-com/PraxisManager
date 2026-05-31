'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] lg:h-[85vh] bg-[#D1DCDB] pt-32 pb-20 flex items-center overflow-hidden">
      
      {/* Decorative subtle texture overlays or light flows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: TEXT CONTENT */}
          <div className="lg:col-span-6 space-y-6 text-[#003527] animate-fade-in-up">
            
            {/* Rating Badge */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-[#003527]">
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="text-sm font-semibold tracking-wide font-sans">
                4.9 Rating on Trustpilot
              </span>
            </div>

             {/* Headline */}
             <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-semibold font-sans leading-[1.08] tracking-tight text-[#003527] max-w-xl">
               Die moderne Praxisverwaltung
             </h1>
 
             {/* Subtext */}
             <p className="text-base text-[#404944] leading-relaxed max-w-md font-sans">
               Termine, Patientenakten, SOAP-Notes und Abrechnung in einem einzigen Tool. Einfach, effizient und DSGVO-konform für Therapeuten und Freelancer.
             </p>
 
             {/* CTA Button */}
             <div className="pt-2">
               <Link
                 href="/onboarding"
                 className="inline-flex items-center bg-[#003527] hover:bg-[#0b513d] text-white pl-2 pr-6 py-2.5 rounded-full transition-all duration-300 group cursor-pointer"
               >
                 {/* White circle with arrow */}
                 <div className="w-9 h-9 rounded-full bg-white text-[#003527] flex items-center justify-center mr-3 group-hover:translate-x-1 transition-transform">
                   <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                 </div>
                 <span className="text-sm font-bold tracking-wide">
                   Praxis einrichten
                 </span>
               </Link>
             </div>

          </div>

          {/* RIGHT COLUMN: COMPOSITE GRID */}
          <div className="lg:col-span-6 w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-2 gap-6 items-stretch">
              
              {/* Column 1 of composite: Stack of two cards */}
              <div className="flex flex-col gap-6 justify-between">
                
                {/* Card 1: Stats block (Dark Green) */}
                <div className="bg-[#003527] text-white p-7 rounded-[2rem] flex flex-col justify-between h-[220px]">
                  <div className="flex justify-between items-start">
                    <span className="text-4xl sm:text-5xl font-semibold tracking-tight font-sans">
                      40+
                    </span>
                    
                    {/* Overlapping profile avatars */}
                    <div className="flex -space-x-3.5 overflow-hidden">
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#003527] bg-[#bfc9c3] flex items-center justify-center text-[10px] font-bold text-[#003527]">M</div>
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#003527] bg-white flex items-center justify-center text-[10px] font-bold text-[#003527]">J</div>
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#003527] bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-[#003527]">K</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-zinc-300 font-sans leading-normal">
                    We grow with our talented team members
                  </p>
                </div>

                {/* Card 2: Succulent image + floating tags */}
                <div className="relative rounded-[2rem] overflow-hidden h-[240px] group">
                  <Image
                    src="/hero-sub.png"
                    alt="Minimal succulent plant"
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-500"
                    priority
                  />
                  {/* Floating Tags at the bottom */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-20">
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/70 backdrop-blur-md border border-white/20 text-[#003527] uppercase tracking-wide">
                      Manage
                    </span>
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/70 backdrop-blur-md border border-white/20 text-[#003527] uppercase tracking-wide">
                      Grow fast
                    </span>
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/70 backdrop-blur-md border border-white/20 text-[#003527] uppercase tracking-wide">
                      Sell
                    </span>
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/70 backdrop-blur-md border border-white/20 text-[#003527] uppercase tracking-wide">
                      Learn
                    </span>
                  </div>
                </div>

              </div>

              {/* Column 2 of composite: Tall portrait card */}
              <div className="relative rounded-[2rem] overflow-hidden h-[486px] group">
                <Image
                  src="/hero-main.png"
                  alt="Minimal editorial layout main model"
                  fill
                  sizes="(max-w-768px) 100vw, 50vw"
                  className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-500"
                  priority
                />
              </div>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
