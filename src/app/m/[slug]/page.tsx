'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { Leaf, Flame, Info, BellRing, MapPin, Tag } from 'lucide-react';

// Helper to check if current time is within a range
const isTimeInRange = (start: string, end: string) => {
  if (!start || !end) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [sH, sM] = start.split(':').map(Number);
  const startMinutes = sH * 60 + sM;
  
  const [eH, eM] = end.split(':').map(Number);
  const endMinutes = eH * 60 + eM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Crosses midnight
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
};

const isScheduleActive = (schedule: any) => {
  if (!schedule?.isActive) return true;
  const now = new Date();
  const currentDay = now.getDay() || 7; // Convert 0 (Sun) to 7, so 1=Mon...7=Sun
  if (!schedule.days.includes(currentDay)) return false;
  return isTimeInRange(schedule.start, schedule.end);
};

const isHappyHourActive = (happyHour: any) => {
  if (!happyHour?.isActive) return false;
  return isTimeInRange(happyHour.start, happyHour.end);
};

export default function GuestMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const restaurantName = resolvedParams.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const [activeCategory, setActiveCategory] = useState('Vorspeisen');
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    
    // Update time every minute to refresh happy hour/schedule
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    }
  }, []);

  const categories = ['Vorspeisen', 'Hauptspeisen', 'Desserts', 'Getränke'];

  // Mock data integrating the new Smart Menu Engine fields
  const allMenuItems = {
    'Vorspeisen': [
      {
        id: '1', name: 'Bruschetta Classica', description: 'Geröstetes Hausbrot mit marinierten Tomaten, Knoblauch, frischem Basilikum und feinstem Olivenöl.', price: 7.50,
        imageUrl: 'https://images.pexels.com/photos/541216/pexels-photo-541216.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['veggie'],
        status: 'sold_out', // 86'd
        happyHour: { isActive: false, price: 5.00, start: '17:00', end: '19:00' },
        schedule: { isActive: false, days: [], start: '', end: '' }
      },
      {
        id: '2', name: 'Carpaccio di Manzo', description: 'Hauchdünnes Rinderfilet mit Rucola, gehobeltem Parmesan und Zitronen-Olivenöl-Dressing.', price: 13.90,
        imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600', tags: [] as string[],
        status: 'active', happyHour: null, schedule: null
      }
    ],
    'Hauptspeisen': [
      {
        id: '3', name: 'Hausgemachte Trüffel-Tagliatelle', description: 'Frische Bandnudeln geschwenkt in cremiger Trüffelsauce, verfeinert mit gehobeltem schwarzen Trüffel.', price: 16.80,
        imageUrl: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['veggie'],
        status: 'active',
        // Example: Only visible for Lunch Mon-Fri 11:30-14:30. 
        // For testing, you might want to change this to active times or toggle isActive to false.
        schedule: { isActive: true, days: [1,2,3,4,5], start: '11:30', end: '14:30' },
        happyHour: null
      },
      {
        id: '4', name: 'Pizza Diavola', description: 'Steinofenpizza mit San Marzano Tomaten, Fior di Latte, scharfer Salami und Chili-Öl.', price: 14.50,
        imageUrl: 'https://images.pexels.com/photos/1049620/pexels-photo-1049620.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['spicy'],
        status: 'active', happyHour: null, schedule: null
      }
    ],
    'Desserts': [
      {
        id: '5', name: 'Tiramisu della Casa', description: 'Klassisches italienisches Dessert mit Löffelbiskuits, Espresso, Mascarpone und Kakao.', price: 6.50,
        imageUrl: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['veggie'],
        status: 'active', happyHour: null, schedule: null
      }
    ],
    'Getränke': [
      {
        id: '6', name: 'Aperol Spritz', description: 'Aperol, Prosecco, Soda und eine frische Orangenscheibe auf Eis.', price: 7.50,
        imageUrl: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=600', tags: [] as string[],
        status: 'active',
        // Example Happy Hour 16:00 to 20:00
        happyHour: { isActive: true, price: 5.00, start: '16:00', end: '20:00' },
        schedule: null
      }
    ]
  };

  // Filter items based on schedule logic
  const visibleItems = (allMenuItems[activeCategory as keyof typeof allMenuItems] || []).filter(item => isScheduleActive(item.schedule));

  return (
    <div className="min-h-screen bg-[#f9f9f8] font-sans text-[#191c1c] pb-24 selection:bg-[#003527]/20">
      {/* HEADER / COVER */}
      <div className="relative h-64 w-full">
        <Image src="https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Restaurant Cover" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest border border-white/30">Geöffnet</span>
            <span className="flex items-center text-white/80 text-xs font-medium"><MapPin className="w-3 h-3 mr-1" />Tisch 04</span>
          </div>
          <h1 className="text-4xl font-black !text-white drop-shadow-md tracking-tight leading-none mb-1">{restaurantName}</h1>
          <p className="text-white/80 text-sm font-medium">Authentische Küche & entspanntes Ambiente</p>
        </div>
      </div>

      {/* STICKY CATEGORY NAV */}
      <div className={`sticky top-0 z-40 bg-[#f9f9f8]/90 backdrop-blur-xl transition-all duration-300 border-b border-[#bfc9c3]/30 ${isScrolled ? 'py-2 shadow-sm' : 'py-4'}`}>
        <div className="flex overflow-x-auto px-6 gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 ${activeCategory === cat ? 'bg-[#003527] text-white shadow-md' : 'bg-white text-[#003527]/70 border border-[#bfc9c3]/50 hover:bg-[#f3f4f3] hover:text-[#003527]'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MENU ITEMS LIST */}
      <div className="px-6 py-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-black text-[#043F2D]">{activeCategory}</h2>
          <div className="h-px bg-[#bfc9c3]/40 flex-1 mt-1"></div>
        </div>

        {visibleItems.length === 0 ? (
          <div className="text-center py-12 text-[#003527]/50 font-medium">
            Zurzeit gibt es hier keine verfügbaren Gerichte.
          </div>
        ) : (
          visibleItems.map((item) => {
            const isSoldOut = item.status === 'sold_out';
            const hhActive = isHappyHourActive(item.happyHour);
            const displayPrice = hhActive ? item.happyHour!.price : item.price;

            return (
              <div key={item.id} className={`bg-white rounded-[2rem] p-4 flex gap-4 border border-[#bfc9c3]/50 transition-colors ${isSoldOut ? 'opacity-60 grayscale' : 'hover:border-[#003527]/30'}`}>
                {/* Image */}
                {item.imageUrl && (
                  <div className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-[#f3f4f3]">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    {isSoldOut && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>}
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 flex flex-col justify-center py-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`font-bold text-[#043F2D] leading-tight line-clamp-2 ${isSoldOut ? 'line-through text-[#003527]/50' : ''}`}>{item.name}</h3>
                    
                    {/* Price Logic */}
                    <div className="flex flex-col items-end shrink-0">
                      {hhActive ? (
                        <>
                          <span className="font-black text-rose-600">{displayPrice.toFixed(2)} €</span>
                          <span className="font-bold text-[10px] text-[#003527]/40 line-through">{item.price.toFixed(2)} €</span>
                        </>
                      ) : (
                        <span className="font-black text-[#003527]">{displayPrice.toFixed(2)} €</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-[#003527]/70 line-clamp-2 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  
                  {/* Badges / Status */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {isSoldOut ? (
                      <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-200 text-zinc-600 border border-zinc-300">
                        Heute leider ausverkauft
                      </span>
                    ) : (
                      <>
                        {item.tags.includes('veggie') && <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#D1DCDB]/40 text-[#003527] border border-[#bfc9c3]/30"><Leaf className="w-3 h-3 mr-1 text-[#003527]" /> Veggie</span>}
                        {item.tags.includes('spicy') && <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100"><Flame className="w-3 h-3 mr-1 text-red-500" /> Scharf</span>}
                        {hhActive && <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200"><Tag className="w-3 h-3 mr-1 text-rose-500" /> Happy Hour</span>}
                        {item.tags.length === 0 && !hhActive && <span className="inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded-lg text-transparent">-</span>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        <div className="mt-10 p-5 bg-[#f3f4f3] rounded-3xl border border-[#bfc9c3]/30 flex gap-3 text-[#003527]/70">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-xs leading-relaxed font-medium">Informationen zu Allergenen und Zusatzstoffen erhältst du jederzeit gerne bei unserem Service-Personal.</p>
        </div>
      </div>

      {/* FLOATING ACTION BAR */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-end">
          <button className="pointer-events-auto bg-[#003527] text-white p-4 rounded-full shadow-2xl hover:bg-[#0b513d] transition-transform active:scale-95 flex items-center justify-center">
            <BellRing className="w-6 h-6" />
          </button>
        </div>
      </div>

    </div>
  );
}
