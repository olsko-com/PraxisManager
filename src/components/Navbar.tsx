'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Auth states
  const [session, setSession] = useState<any>(null);
  const [practiceName, setPracticeName] = useState('Gast');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchPracticeName(session.user.id);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchPracticeName(session.user.id);
      } else {
        setPracticeName('Gast');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPracticeName = async (userId: string) => {
    const { data, error } = await supabase
      .from('practices')
      .select('name')
      .eq('user_id', userId)
      .single();
      
    if (data && data.name && !error) {
      setPracticeName(data.name);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const navLinks = [
    { name: 'About', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-zinc-200/80 py-1'
          : 'bg-transparent border-b border-zinc-200/20 py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          
          {/* Logo - Dáhon Leaf */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-[#003527] hover:opacity-90 transition-opacity">
              <Leaf className="h-6 w-6 fill-current text-[#003527] rotate-[-15deg]" />
            </div>
            <span className="font-sans font-bold text-2xl tracking-tight text-[#003527]">
              Dáhon
            </span>
          </Link>

          {/* Desktop Nav Links (Perfect Centering) */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-[#404944] hover:text-[#003527] transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center relative">
            {session ? (
              // Logged In State
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-[#f3f4f3] hover:bg-[#e4e9e8] text-[#003527] pr-4 pl-1.5 py-1.5 rounded-full transition-colors font-bold text-sm cursor-pointer border border-[#bfc9c3]/30"
                >
                  <div className="w-7 h-7 rounded-full bg-[#003527] text-white flex items-center justify-center text-xs font-black">
                    {practiceName.charAt(0).toUpperCase()}
                  </div>
                  {practiceName}
                </button>
                
                {isProfileOpen && (
                  <div className="absolute top-12 right-0 w-48 bg-white border border-[#bfc9c3]/50 rounded-2xl shadow-none overflow-hidden py-2 flex flex-col z-50">
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsProfileOpen(false)}
                      className="px-4 py-2.5 text-sm text-[#003527] hover:bg-[#f3f4f3] font-semibold text-left flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold text-left flex items-center gap-2 cursor-pointer border-t border-zinc-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Logged Out State
              <div className="flex items-center gap-6">
                <Link
                  href="/login?mode=signin"
                  className="text-sm font-semibold text-[#404944] hover:text-[#003527] transition-colors"
                >
                  Anmelden
                </Link>
                <Link
                  href="/onboarding"
                  className="flex items-center bg-[#003527] hover:bg-[#0b513d] text-white pl-2 pr-5 py-1.5 rounded-full transition-all duration-300 cursor-pointer group"
                >
                  {/* White circle with arrow */}
                  <div className="w-7 h-7 rounded-full bg-white text-[#003527] flex items-center justify-center mr-2.5 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold tracking-wide">
                    Jetzt starten
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-[#003527] hover:bg-zinc-200/50 focus:outline-none transition-colors cursor-pointer"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Hauptmenü öffnen</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 bg-white/95 backdrop-blur-md border-b border-zinc-200' : 'max-h-0 opacity-0'
        }`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-6 space-y-2 bg-white/95">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-semibold text-[#404944] hover:text-[#003527] hover:bg-zinc-100 transition-all"
            >
              {link.name}
            </a>
          ))}
          
          <div className="pt-4 border-t border-zinc-200 flex flex-col px-2">
            {session ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 py-3 px-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#003527] text-white flex items-center justify-center font-bold text-lg">
                    {practiceName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-[#003527] block">{practiceName}</span>
                    <span className="text-xs text-zinc-500 font-semibold">{session.user.email}</span>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex justify-center items-center gap-2 bg-[#f3f4f3] text-[#003527] font-bold py-3.5 rounded-xl transition-colors active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Zum Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center items-center gap-2 text-red-600 font-bold py-3.5 rounded-xl border border-red-100 bg-red-50 transition-colors active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Link
                  href="/onboarding"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center bg-[#003527] text-white pl-2 pr-5 py-2 rounded-full transition-all duration-300 justify-center group"
                >
                  <div className="w-7 h-7 rounded-full bg-white text-[#003527] flex items-center justify-center mr-2.5">
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold tracking-wide">
                    Jetzt starten
                  </span>
                </Link>
                <Link
                  href="/login?mode=signin"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center border border-[#003527] text-[#003527] py-2.5 rounded-full font-bold text-sm hover:bg-[#003527]/5 transition-colors"
                >
                  Anmelden
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
