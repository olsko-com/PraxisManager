'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Clock, ClipboardList, CreditCard, Activity, 
  MessageSquare, Star, Calendar, Video, LayoutGrid, Check, Sparkles, Mail 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import BookingConfig from './BookingConfig';

interface AddonItem {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  priceTag?: string;
  isPremium?: boolean;
}

export default function AddonsPage() {
  const { showToast } = useDashboard();
  const [activeAddons, setActiveAddons] = useState<Record<string, boolean>>({});
  const [loadingAddonId, setLoadingAddonId] = useState<string | null>(null);
  
  // Navigation & Scroll states
  const [activeCategory, setActiveCategory] = useState<string>('booking');
  const [addonsSubTab, setAddonsSubTab] = useState<'catalog' | 'booking-config'>('catalog');
  const containerRef = useRef<HTMLDivElement>(null);

  // Define addons metadata
  const addons: AddonItem[] = [
    // Category 1: Booking & Client Flow
    {
      id: 'public-booking',
      category: 'Buchung & Klientenfluss',
      title: 'Online-Buchungsseite',
      description: 'Erlaube Klienten, Termine selbstständig online über deinen öffentlichen Link zu vereinbaren. Ausschaltbar, falls ausgebucht.',
      icon: Globe,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50 border border-emerald-200/40',
      priceTag: 'Inklusive'
    },
    {
      id: 'waitlist',
      category: 'Buchung & Klientenfluss',
      title: 'Wartelisten-Automatik',
      description: 'Lasse Klienten sich bei vollen Wochen eintragen. Das System benachrichtigt Nachrücker vollautomatisch bei kurzfristigen Absagen.',
      icon: Clock,
      iconColor: 'text-blue-700',
      iconBg: 'bg-blue-50 border border-blue-200/40',
      priceTag: 'Premium',
      isPremium: true
    },
    {
      id: 'intake-forms',
      category: 'Buchung & Klientenfluss',
      title: 'Digitale Anamnesebögen',
      description: 'Sende Klienten nach der Buchung direkt einen Link zum Ausfüllen des Anamnesebogens. Das ausgefüllte Profil liegt sofort vor.',
      icon: ClipboardList,
      iconColor: 'text-purple-700',
      iconBg: 'bg-purple-50 border border-purple-200/40',
      priceTag: 'Inklusive'
    },
    // Category 2: Cashflow & Payment
    {
      id: 'stripe-payments',
      category: 'Finanzen & Cashflow',
      title: 'Stripe Online-Zahlungen',
      description: 'Verknüpfe Stripe und minimiere No-Shows vollständig, indem du Buchungen an Online-Anzahlungen per Apple Pay/Kreditkarte koppelst.',
      icon: CreditCard,
      iconColor: 'text-indigo-700',
      iconBg: 'bg-indigo-50 border border-indigo-200/40',
      priceTag: 'Premium',
      isPremium: true
    },
    {
      id: 'packages-abos',
      category: 'Finanzen & Cashflow',
      title: '10er-Karten & Abonnements',
      description: 'Verkaufe Zehnerkarten und Abos direkt online. Das System zieht Einheiten bei jeder weiteren Terminbuchung automatisch ab.',
      icon: Activity,
      iconColor: 'text-teal-700',
      iconBg: 'bg-teal-50 border border-teal-200/40',
      priceTag: 'Inklusive'
    },
    // Category 3: Growth & Marketing
    {
      id: 'sms-reminders',
      category: 'Marketing & Kommunikation',
      title: 'Premium SMS-Erinnerungen',
      description: 'Erreiche Klienten direkt per SMS statt E-Mail. SMS haben eine Öffnungsrate von 98% und schützen extrem effektiv vor Ausfällen.',
      icon: MessageSquare,
      iconColor: 'text-amber-700',
      iconBg: 'bg-amber-50 border border-amber-200/40',
      priceTag: '5 € / 100 SMS',
      isPremium: true
    },
    {
      id: 'mail-center',
      category: 'Marketing & Kommunikation',
      title: 'Mail Center (Kommunikation)',
      description: 'Sende Rechnungs- und Terminerinnerungen oder Fragebögen direkt aus der Patientenakte. Nutzt Liquid-Tags für vollautomatische Personalisierung.',
      icon: Mail,
      iconColor: 'text-purple-700',
      iconBg: 'bg-purple-50 border border-purple-200/40',
      priceTag: 'Inklusive'
    },
    {
      id: 'google-reviews',
      category: 'Marketing & Kommunikation',
      title: 'Google Review Autopilot',
      description: 'Fordere zufriedenstellende Klienten automatisch 24h nach dem ersten Behandlungstermin per Mail auf, eine Google-Bewertung abzugeben.',
      icon: Star,
      iconColor: 'text-rose-700',
      iconBg: 'bg-rose-50 border border-rose-200/40',
      priceTag: 'Inklusive'
    },
    // Category 4: Ecosystem
    {
      id: 'calendar-sync',
      category: 'Schnittstellen & Ecosystem',
      title: 'iCloud & Google Calendar Sync',
      description: 'Synchronisiere deine privaten Kalender mit HManager. Blockiere Slots für Online-Buchungen automatisch, um Doppelungen zu vermeiden.',
      icon: Calendar,
      iconColor: 'text-orange-700',
      iconBg: 'bg-orange-50 border border-orange-200/40',
      priceTag: 'Inklusive'
    },
    {
      id: 'zoom-integration',
      category: 'Schnittstellen & Ecosystem',
      title: 'Zoom Auto-Links',
      description: 'Generiere bei Online-Buchungen für Videosprechstunden automatisch Zoom-Einladungslinks und füge sie in die Terminbestätigung ein.',
      icon: Video,
      iconColor: 'text-sky-700',
      iconBg: 'bg-sky-50 border border-sky-200/40',
      priceTag: 'Inklusive'
    }
  ];

  // Category mapping
  const categories = [
    { id: 'booking', label: 'Buchung & Klientenfluss' },
    { id: 'finance', label: 'Finanzen & Cashflow' },
    { id: 'marketing', label: 'Marketing & Kommunikation' },
    { id: 'ecosystem', label: 'Schnittstellen & Ecosystem' }
  ];

  const catIdMap: Record<string, string> = {
    'Buchung & Klientenfluss': 'booking',
    'Finanzen & Cashflow': 'finance',
    'Marketing & Kommunikation': 'marketing',
    'Schnittstellen & Ecosystem': 'ecosystem'
  };

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeStates: Record<string, boolean> = {};
      
      // Default public-booking to true
      if (localStorage.getItem('addon_public-booking') === null) {
        localStorage.setItem('addon_public-booking', 'true');
      }

      addons.forEach(addon => {
        activeStates[addon.id] = localStorage.getItem(`addon_${addon.id}`) === 'true';
      });
      setActiveAddons(activeStates);
    }
  }, []);

  // Check URL query param or hash on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'booking-config') {
        setAddonsSubTab('booking-config');
      }
    }
  }, []);

  // Listen for custom sub-tab switch event (e.g. from sidebar clicks)
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setAddonsSubTab(customEvent.detail);
      }
    };
    window.addEventListener('switch-addons-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-addons-tab', handleSwitchTab);
  }, []);

  // Monitor Scroll Position to Highlight active tab title
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop;
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 20;
      
      if (isAtBottom) {
        setActiveCategory('ecosystem');
        return;
      }

      let currentCat = 'booking';
      
      const bookingEl = document.getElementById('booking');
      const financeEl = document.getElementById('finance');
      const marketingEl = document.getElementById('marketing');
      const ecosystemEl = document.getElementById('ecosystem');
      
      const buffer = 120; // top offset
      
      if (ecosystemEl && scrollPos >= (ecosystemEl.offsetTop - buffer)) {
        currentCat = 'ecosystem';
      } else if (marketingEl && scrollPos >= (marketingEl.offsetTop - buffer)) {
        currentCat = 'marketing';
      } else if (financeEl && scrollPos >= (financeEl.offsetTop - buffer)) {
        currentCat = 'finance';
      } else if (bookingEl && scrollPos >= (bookingEl.offsetTop - buffer)) {
        currentCat = 'booking';
      }
      
      setActiveCategory(currentCat);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to target category
  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    const container = containerRef.current;
    if (element && container) {
      const elementTop = element.offsetTop;
      container.scrollTo({
        top: elementTop - 30, // 30px buffer below header
        behavior: 'smooth'
      });
      setActiveCategory(id);
    }
  };

  const handleToggleAddon = (id: string, title: string) => {
    setLoadingAddonId(id);
    const nextState = !activeAddons[id];

    // Simulate instant Apple-like execution delay
    setTimeout(() => {
      localStorage.setItem(`addon_${id}`, String(nextState));
      setActiveAddons(prev => ({
        ...prev,
        [id]: nextState
      }));
      setLoadingAddonId(null);
      
      // Notify sidebar layout
      window.dispatchEvent(new Event('addons-updated'));

      if (nextState) {
        showToast(`„${title}“ wurde aktiviert.`, 'success');
      } else {
        showToast(`„${title}“ wurde deaktiviert.`, 'info');
      }
    }, 400);
  };

  const groupedCategories = Array.from(new Set(addons.map(a => a.category)));

  return (
    <div 
      ref={containerRef}
      className="flex-grow overflow-y-auto px-12 py-8 space-y-6 text-left font-sans select-none relative scroll-smooth hide-scrollbar"
    >
      
      {/* Sticky Header Group */}
      <div className="space-y-3 flex-shrink-0 bg-[#f9f9f8]/95 backdrop-blur-md sticky top-0 -mx-12 px-12 pt-1 pb-4 z-30">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h2 className="text-lg font-bold text-[#043F2D] flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-[#003527]" />
              Erweiterungen
            </h2>
          </div>
        </div>

        {/* Sub-Tab Navigation (Matches Abrechnung header tabs design exactly) */}
        <div className="flex justify-between items-end border-b border-[#bfc9c3]/20 pb-0 select-none -mx-12 px-12 h-[42px]">
          <div className="flex gap-6">
            <button
              onClick={() => setAddonsSubTab('catalog')}
              className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                addonsSubTab === 'catalog' 
                  ? 'text-[#003527]' 
                  : 'text-zinc-400 hover:text-[#003527]'
              }`}
            >
              Katalog
              {addonsSubTab === 'catalog' && (
                <motion.div 
                  layoutId="addonsSubTabLine" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003527]" 
                />
              )}
            </button>
            <button
              onClick={() => setAddonsSubTab('booking-config')}
              className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                addonsSubTab === 'booking-config' 
                  ? 'text-[#003527]' 
                  : 'text-zinc-400 hover:text-[#003527]'
              }`}
            >
              Online-Buchung
              {addonsSubTab === 'booking-config' && (
                <motion.div 
                  layoutId="addonsSubTabLine" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003527]" 
                />
              )}
            </button>
          </div>
        </div>

        {/* Category Anchor Navigation (Only shown when catalog is selected) */}
        {addonsSubTab === 'catalog' && (
          <div className="flex gap-6 border-b border-[#bfc9c3]/10 pt-3 pb-3 select-none overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`text-[10px] font-extrabold uppercase tracking-wider transition-all relative cursor-pointer ${
                  activeCategory === cat.id 
                    ? 'text-[#003527]' 
                    : 'text-zinc-400 hover:text-[#003527]'
                }`}
              >
                {cat.label}
                {activeCategory === cat.id && (
                  <motion.div 
                    layoutId="addonsCategoryTabLine" 
                    className="absolute -bottom-3 left-0 right-0 h-[1.5px] bg-[#003527]" 
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {addonsSubTab === 'catalog' ? (
        /* Bento Grid Content */
        <div className="space-y-12 max-w-6xl pt-2 pb-24 animate-fade-in">
          {groupedCategories.map((catName) => {
            const catAddons = addons.filter(a => a.category === catName);
            const catId = catIdMap[catName];

            return (
              <div key={catName} id={catId} className="space-y-4 scroll-mt-28">
                {/* Category Divider Title */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold tracking-widest text-[#003527]/70 uppercase">
                    {catName}
                  </span>
                  <div className="h-px bg-[#bfc9c3]/20 flex-1" />
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catAddons.map((addon) => {
                    const Icon = addon.icon;
                    const isActive = activeAddons[addon.id] || false;
                    const isLoading = loadingAddonId === addon.id;

                    return (
                      <div 
                        key={addon.id} 
                        className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                          isActive 
                            ? 'border-[#003527]/30 shadow-[0_4px_20px_rgba(0,53,39,0.02)]' 
                            : 'border-[#bfc9c3]/30 hover:border-[#bfc9c3]/60'
                        }`}
                      >
                        {/* Top Header Row */}
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-2 rounded-xl ${addon.iconBg}`}>
                            <Icon className={`w-4 h-4 ${addon.iconColor}`} />
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {addon.isPremium && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-800 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                <Sparkles className="w-2 h-2 text-amber-600" /> Pro
                              </span>
                            )}
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                              {addon.priceTag}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5 mb-6 text-left">
                          <h4 className="font-extrabold text-xs text-[#003527]">{addon.title}</h4>
                          <p className="text-[10px] leading-relaxed text-zinc-400 font-semibold min-h-[40px] line-clamp-3">
                            {addon.description}
                          </p>
                        </div>

                        {/* Divider line inside card */}
                        <div className="w-full h-px bg-zinc-50 mb-4" />

                        {/* Switch Row */}
                        <div className="flex justify-between items-center text-xs font-semibold text-[#404944]">
                          <span className={`text-[10px] font-bold transition-colors ${
                            isActive ? 'text-[#003527]' : 'text-zinc-400'
                          }`}>
                            {isActive ? 'Aktiviert' : 'Deaktiviert'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleAddon(addon.id, addon.title)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isActive ? 'bg-[#003527]' : 'bg-zinc-200'
                            } ${isLoading ? 'opacity-65 cursor-wait' : ''}`}
                          >
                            <motion.span
                              animate={{ x: isActive ? 20 : 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 flex items-center justify-center"
                            >
                              {isLoading && (
                                <svg className="animate-spin h-2.5 w-2.5 text-zinc-400" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              )}
                            </motion.span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <BookingConfig 
          isAddonActive={activeAddons['public-booking'] || false} 
          onActivate={() => handleToggleAddon('public-booking', 'Online-Buchungsseite')}
        />
      )}

    </div>
  );
}
