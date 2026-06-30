'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, Users, FileText, Settings, LogOut, Search, Plus, 
  CheckCircle2, AlertCircle, Clock, LayoutGrid, CreditCard, TrendingUp, Activity, ExternalLink,
  Globe, ChevronsUpDown, Mail, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from '@/components/CommandPalette';
import { DashboardProvider, useDashboard } from './context';
import dynamic from 'next/dynamic';

const AppointmentDetailsSheet = dynamic(() => import('./components/AppointmentDetailsSheet'), { ssr: false });
const NewClientModal = dynamic(() => import('./components/NewClientModal'), { ssr: false });
const MailModal = dynamic(() => import('./components/MailModal'), { ssr: false });
const NewInvoiceSheet = dynamic(() => import('./components/NewInvoiceSheet'), { ssr: false });
const ContextMenu = dynamic(() => import('./components/ContextMenu'), { ssr: false });
const GdprConsentModal = dynamic(() => import('./components/GdprConsentModal'), { ssr: false });

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    therapistName,
    clients,
    services,
    toast,
    isCmdkOpen,
    setIsCmdkOpen,
    isNewClientModalOpen,
    setIsNewClientModalOpen,
    isMailModalOpen,
    isNewInvoiceSheetOpen,
    isSheetOpen,
    setSheetMode,
    setNewAppDate,
    setNewAppHour,
    setNewAppClientId,
    setNewAppServiceId,
    setIsSheetOpen,
    contextMenu,
    showToast,
    handleSignOut,
    isGdprModalOpen
  } = useDashboard();

  // Local state for active addons
  const [activeAddons, setActiveAddons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadAddons = () => {
      const addons: Record<string, boolean> = {};
      const addonKeys = [
        'public-booking', 'waitlist', 'intake-forms', 
        'stripe-payments', 'packages-abos', 'sms-reminders', 
        'google-reviews', 'calendar-sync', 'zoom-integration', 'mail-center'
      ];
      addonKeys.forEach(key => {
        addons[key] = localStorage.getItem(`addon_${key}`) === 'true';
      });
      setActiveAddons(addons);
    };

    loadAddons();
    window.addEventListener('addons-updated', loadAddons);
    return () => window.removeEventListener('addons-updated', loadAddons);
  }, []);

  // Local state for workspace/profile dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cmdkActions = [
    {
      id: 'calendar',
      title: 'Kalender anzeigen',
      icon: CalendarIcon,
      onSelect: () => router.push('/dashboard/calendar')
    },
    {
      id: 'new-app',
      title: 'Neuen Termin eintragen',
      icon: Plus,
      onSelect: () => {
        setSheetMode('new');
        setNewAppDate(new Date().toISOString().slice(0, 10));
        setNewAppHour(9);
        if (clients.length > 0) setNewAppClientId(clients[0].id);
        if (services.length > 0) setNewAppServiceId(services[0].id);
        setIsSheetOpen(true);
      }
    },
    {
      id: 'patients',
      title: 'Klienten anzeigen',
      icon: Users,
      onSelect: () => router.push('/dashboard/clients')
    },
    {
      id: 'new-patient',
      title: 'Neuen Klienten anlegen',
      icon: Plus,
      onSelect: () => {
        setIsNewClientModalOpen(true);
      }
    },
    {
      id: 'invoices',
      title: 'Abrechnung anzeigen',
      icon: FileText,
      onSelect: () => router.push('/dashboard/invoices')
    },
    {
      id: 'settings',
      title: 'Einstellungen öffnen',
      icon: Settings,
      onSelect: () => router.push('/dashboard/settings')
    }
  ];

  // CMD+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdkOpen(!isCmdkOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdkOpen, setIsCmdkOpen]);

  return (
    <div className="min-h-screen bg-white text-[#191c1c] font-sans antialiased overflow-hidden flex">
      {/* SideNavBar Shell */}      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white flex-col p-6 z-50 justify-between">
        
        {/* TOP SECTION */}
        <div className="flex flex-col flex-grow min-h-0">
          {/* Workspace Switcher / Profile Card */}
          <div ref={profileDropdownRef} className="relative mb-4">
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-3 px-2.5 py-2 hover:bg-zinc-50 rounded-lg transition-all text-left w-full cursor-pointer group border border-transparent hover:border-zinc-200"
            >
              <div className="w-8 h-8 rounded-md bg-[#003527] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-extrabold text-white">
                  {therapistName ? getInitials(therapistName) : 'PM'}
                </span>
              </div>
              <div className="flex-grow overflow-hidden">
                <h2 className="text-[12px] font-extrabold text-[#043F2D] leading-none tracking-tight">HManager</h2>
                <p className="text-[10px] text-zinc-400 font-semibold truncate leading-none mt-0.5">{therapistName}</p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#003527] transition-colors shrink-0" />
            </div>
 
            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-[#bfc9c3]/30 rounded-lg shadow-lg py-1.5 z-[100] text-left">
                <div className="px-3 py-1.5 border-b border-[#bfc9c3]/15 mb-1 select-none">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Workspace</p>
                  <p className="text-[11px] font-extrabold text-[#003527] truncate mt-0.5">{therapistName}</p>
                </div>
 
                {/* Quick Action: Neuer Termin */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    setSheetMode('new');
                    setNewAppDate(new Date().toISOString().slice(0, 10));
                    setNewAppHour(9);
                    if (clients.length > 0) setNewAppClientId(clients[0].id);
                    if (services.length > 0) setNewAppServiceId(services[0].id);
                    setIsSheetOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527] transition-all cursor-pointer border-none bg-transparent text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-[#003527]" />
                  <span>Neuer Termin</span>
                </button>
 
                {/* Settings Quick Link */}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527] transition-all cursor-pointer text-left block"
                >
                  <Settings className="w-3.5 h-3.5 text-[#404944]" />
                  <span>Einstellungen</span>
                </Link>
 
                <div className="h-px bg-[#bfc9c3]/15 my-1" />
 
                {/* LogOut Action */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50/50 transition-all cursor-pointer border-none bg-transparent text-left"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Abmelden</span>
                </button>
              </div>
            )}
          </div>
 
          {/* Primary Navigation */}
          <nav className="space-y-1 text-left flex-shrink-0 mb-4">
            <Link
              href="/dashboard"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                pathname === '/dashboard'
                  ? 'bg-[#003527]/5 text-[#003527]'
                  : 'text-[#404944] hover:bg-zinc-50 hover:text-[#003527]'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" /> Übersicht
            </Link>
            <Link
              href="/dashboard/calendar"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                pathname === '/dashboard/calendar'
                  ? 'bg-[#003527]/5 text-[#003527]'
                  : 'text-[#404944] hover:bg-zinc-50 hover:text-[#003527]'
              }`}
            >
              <CalendarIcon className="w-4 h-4 shrink-0" /> Kalender
            </Link>
 
            <Link
              href="/dashboard/clients"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                pathname === '/dashboard/clients'
                  ? 'bg-[#003527]/5 text-[#003527]'
                  : 'text-[#404944] hover:bg-zinc-50 hover:text-[#003527]'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" /> Klienten
            </Link>
 
            <Link
              href="/dashboard/invoices"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                pathname === '/dashboard/invoices'
                  ? 'bg-[#003527]/5 text-[#003527]'
                  : 'text-[#404944] hover:bg-zinc-50 hover:text-[#003527]'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" /> Abrechnung
            </Link>
          </nav>
 
          {/* Dynamic Active Modules (Add-ons) */}
          {Object.values(activeAddons).some(Boolean) && (
            <div className="pt-5 border-t border-[#bfc9c3]/20 mt-5 space-y-1.5 overflow-y-auto hide-scrollbar flex-grow text-left">
              <span className="block px-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Aktive Module
              </span>
              <AnimatePresence>
                {activeAddons['public-booking'] && (
                  <motion.div
                    key="public-booking"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href="/dashboard/addons?tab=booking-config"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('switch-addons-tab', { detail: 'booking-config' }));
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-zinc-50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Buchungsseite</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </Link>
                  </motion.div>
                )}
                {activeAddons['waitlist'] && (
                  <motion.div
                    key="waitlist"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => showToast('Die Warteliste läuft im Hintergrund und informiert automatisch Nachrücker.', 'info')}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-zinc-50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Warteliste</span>
                      </div>
                    </button>
                  </motion.div>
                )}
                {activeAddons['intake-forms'] && (
                  <motion.div
                    key="intake-forms"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => showToast('Digitale Anamnesebögen werden bei neuen Buchungen mitgeschickt.', 'info')}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-zinc-50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Anamnesebögen</span>
                      </div>
                    </button>
                  </motion.div>
                )}
                {activeAddons['stripe-payments'] && (
                  <motion.div
                    key="stripe"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => showToast('Stripe Online-Zahlungen und Anzahlungen sind im Buchungsprozess aktiv.', 'info')}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-zinc-50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Online-Zahlungen</span>
                      </div>
                    </button>
                  </motion.div>
                )}
                {activeAddons['packages-abos'] && (
                  <motion.div
                    key="packages"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => showToast('10er-Karten & Abonnements stehen Klienten online zur Verfügung.', 'info')}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-zinc-50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Pakete & Abos</span>
                      </div>
                    </button>
                  </motion.div>
                )}
                {activeAddons['google-reviews'] && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => showToast('Google Review Autopilot versendet automatische Anfragen nach dem Ersttermin.', 'info')}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-zinc-50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Google Reviews</span>
                      </div>
                    </button>
                  </motion.div>
                )}
                {activeAddons['mail-center'] && (
                  <motion.div
                    key="mail-center"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => showToast('Das Mail Center ist aktiv. Du kannst E-Mails direkt aus der Klientenakte senden.', 'info')}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-zinc-50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Mail Center</span>
                      </div>
                    </button>
                  </motion.div>
                )}
                {activeAddons['zoom-integration'] && (
                  <motion.div
                    key="zoom"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => showToast('Zoom-Integration ist aktiv: Links werden automatisch generiert.', 'info')}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-zinc-50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Video-Therapie</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
 
        {/* BOTTOM SECTION */}
        <div className="pt-4 border-t border-[#bfc9c3]/20 space-y-1.5 flex-shrink-0 text-left">
          {/* Global Search (Command K) */}
          <button 
            onClick={() => setIsCmdkOpen(true)}
            className="w-full flex items-center justify-between bg-zinc-100/60 hover:bg-zinc-100 border border-transparent rounded-lg px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-[#003527] transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#003527]" /> Suche...
            </span>
            <div className="flex items-center gap-0.5 opacity-70">
              <kbd className="bg-white border border-zinc-200/50 px-1 py-0.5 rounded text-[9px] font-mono font-bold shadow-sm text-zinc-500">⌘</kbd>
              <kbd className="bg-white border border-zinc-200/50 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shadow-sm text-zinc-500">K</kbd>
            </div>
          </button>
 
          {/* Separator Line */}
          <div className="h-px bg-[#bfc9c3]/20 my-1 mx-2" />
 
          {/* Erweiterungen */}
          <Link
            href="/dashboard/addons"
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold transition-all ${
              pathname === '/dashboard/addons'
                ? 'bg-[#003527]/5 text-[#003527]'
                : 'text-[#404944] hover:bg-zinc-50 hover:text-[#003527]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" /> Erweiterungen
          </Link>
 
          {/* Einstellungen */}
          <Link
            href="/dashboard/settings"
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold transition-all ${
              pathname === '/dashboard/settings'
                ? 'bg-[#003527]/5 text-[#003527]'
                : 'text-[#404944] hover:bg-zinc-50 hover:text-[#003527]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" /> Einstellungen
          </Link>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-grow pl-0 lg:pl-64 pb-20 lg:pb-0 min-h-screen flex flex-col overflow-hidden relative">
        {children}
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCmdkOpen} setIsOpen={setIsCmdkOpen} actions={cmdkActions} />

      {/* Lazy-loaded Sheets & Modals */}
      <AnimatePresence>
        {isSheetOpen && <AppointmentDetailsSheet />}
      </AnimatePresence>

      <AnimatePresence>
        {isNewClientModalOpen && <NewClientModal />}
      </AnimatePresence>

      <AnimatePresence>
        {isMailModalOpen && <MailModal />}
      </AnimatePresence>

      <AnimatePresence>
        {isNewInvoiceSheetOpen && <NewInvoiceSheet />}
      </AnimatePresence>

      <AnimatePresence>
        {contextMenu && <ContextMenu />}
      </AnimatePresence>

      <AnimatePresence>
        {isGdprModalOpen && <GdprConsentModal />}
      </AnimatePresence>

      {/* Local Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-8 right-8 z-[200] px-5 py-4 rounded-2xl border flex items-center gap-3 max-w-sm font-sans shadow-none ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-zinc-50 border-zinc-200 text-[#003527]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {toast.type === 'info' && <Clock className="w-5 h-5 text-[#003527]/60 flex-shrink-0" />}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-[#bfc9c3]/20 px-2 py-1 items-center justify-around z-50 select-none pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center w-12 h-full text-center transition-all duration-200 ${
            pathname === '/dashboard'
              ? 'text-[#003527] scale-105 font-bold'
              : 'text-zinc-400 hover:text-[#003527]'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold">Übersicht</span>
        </Link>
        
        <Link
          href="/dashboard/calendar"
          className={`flex flex-col items-center justify-center w-12 h-full text-center transition-all duration-200 ${
            pathname === '/dashboard/calendar'
              ? 'text-[#003527] scale-105 font-bold'
              : 'text-zinc-400 hover:text-[#003527]'
          }`}
        >
          <CalendarIcon className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold">Kalender</span>
        </Link>

        <Link
          href="/dashboard/clients"
          className={`flex flex-col items-center justify-center w-12 h-full text-center transition-all duration-200 ${
            pathname === '/dashboard/clients'
              ? 'text-[#003527] scale-105 font-bold'
              : 'text-zinc-400 hover:text-[#003527]'
          }`}
        >
          <Users className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold">Klienten</span>
        </Link>

        <Link
          href="/dashboard/invoices"
          className={`flex flex-col items-center justify-center w-12 h-full text-center transition-all duration-200 ${
            pathname === '/dashboard/invoices'
              ? 'text-[#003527] scale-105 font-bold'
              : 'text-zinc-400 hover:text-[#003527]'
          }`}
        >
          <FileText className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold">Abrechnung</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex flex-col items-center justify-center w-12 h-full text-center transition-all duration-200 ${
            pathname === '/dashboard/settings'
              ? 'text-[#003527] scale-105 font-bold'
              : 'text-zinc-400 hover:text-[#003527]'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight mt-0.5 font-bold">Einstellungen</span>
        </Link>
      </nav>

    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
