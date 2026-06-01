'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, Users, FileText, Settings, LogOut, Search, Plus, 
  Trash2, X, CheckCircle2, AlertCircle, Sparkles, Printer, Download, 
  Mail, Clock, User, Check, Star, Flag, AlertCircle as InfoIcon,
  ZoomIn, ZoomOut, ChevronDown, LayoutGrid, CreditCard, TrendingUp, Activity, ExternalLink,
  Globe, ChevronsUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from '@/components/CommandPalette';
import { DashboardProvider, useDashboard } from './context';

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
    address,
    phone,
    clients,
    services,
    appointments,
    setAppointments,
    invoices,
    soapNotes,
    toast,
    isCmdkOpen,
    setIsCmdkOpen,
    isNewClientModalOpen,
    setIsNewClientModalOpen,
    isMailModalOpen,
    setIsMailModalOpen,
    isNewInvoiceSheetOpen,
    setIsNewInvoiceSheetOpen,
    isSheetOpen,
    setIsSheetOpen,
    selectedAppointment,
    setSelectedAppointment,
    sheetMode,
    setSheetMode,
    newAppDate,
    setNewAppDate,
    newAppHour,
    setNewAppHour,
    newAppClientId,
    setNewAppClientId,
    newAppServiceId,
    setNewAppServiceId,
    selectedClientId,
    setSelectedClientId,
    isFilterMenuOpen,
    setIsFilterMenuOpen,
    newClientName,
    setNewClientName,
    newClientBirthday,
    setNewClientBirthday,
    newClientEmail,
    setNewClientEmail,
    newClientPhone,
    setNewClientPhone,
    newClientEmergency,
    setNewClientEmergency,
    newClientNotes,
    setNewClientNotes,
    newInvoiceClientId,
    setNewInvoiceClientId,
    newInvoiceAmount,
    setNewInvoiceAmount,
    newInvoiceDate,
    setNewInvoiceDate,
    newInvoiceNumber,
    setNewInvoiceNumber,
    newInvoiceStatus,
    setNewInvoiceStatus,
    newInvoiceAppointmentId,
    mailTopic,
    mailSubject,
    setMailSubject,
    mailBody,
    setMailBody,
    selectedMailInvoiceId,
    setSelectedMailInvoiceId,
    selectedMailAppointmentId,
    setSelectedMailAppointmentId,
    contextMenu,
    setContextMenu,
    handleCreateClient,
    handleCreateInvoice,
    handleSendMail,
    markInvoicePaid,
    printInvoice,
    downloadInvoicePdf,
    createSoapNote,
    startEditSoap,
    openNewInvoiceSheetWithPrefill,
    applyMailTemplate,
    showToast,
    handleSignOut
  } = useDashboard();

  const currentClient = clients.find(c => c.id === selectedClientId);

  // Local state for active addons
  const [activeAddons, setActiveAddons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadAddons = () => {
      const addons: Record<string, boolean> = {};
      const addonKeys = [
        'public-booking', 'waitlist', 'intake-forms', 
        'stripe-payments', 'packages-abos', 'sms-reminders', 
        'google-reviews', 'calendar-sync', 'zoom-integration'
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

  // Local state for line items in the invoice creator
  const [lineItems, setLineItems] = React.useState<{ id: string; description: string; price: number }[]>([]);

  // Local state for patient dropdown and invoice due date
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false);
  const [sidebarClientSearch, setSidebarClientSearch] = React.useState('');
  const [newInvoiceDueDate, setNewInvoiceDueDate] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Local state for workspace/profile dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedClientForInvoice = clients.find(c => c.id === newInvoiceClientId);
  const filteredClientsForSidebar = clients.filter(c => 
    c.name.toLowerCase().includes(sidebarClientSearch.toLowerCase())
  );

  // Sync new client creation with invoice selection
  const prevClientsLength = React.useRef(clients.length);
  React.useEffect(() => {
    if (clients.length > prevClientsLength.current && isNewInvoiceSheetOpen) {
      const newestClient = clients[clients.length - 1];
      if (newestClient) {
        setNewInvoiceClientId(newestClient.id);
        setCanvasClientSearch(newestClient.name);
      }
    }
    prevClientsLength.current = clients.length;
  }, [clients, isNewInvoiceSheetOpen, setNewInvoiceClientId]);

  // Local state for canvas patient autocomplete search
  const [canvasClientSearch, setCanvasClientSearch] = React.useState('');
  const [isCanvasSearchFocused, setIsCanvasSearchFocused] = React.useState(false);

  // Local state for canvas zoom scale
  const [zoomScale, setZoomScale] = React.useState(100);

  const calculateDefaultDueDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 10);
  };

  const getDaysDifference = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 14;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 14;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 14;
  };

  const formatDateGerman = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Synchronize newInvoiceDueDate and zoomScale when the invoice modal opens or newInvoiceDate changes
  React.useEffect(() => {
    if (isNewInvoiceSheetOpen) {
      setZoomScale(100);
      if (newInvoiceDate) {
        setNewInvoiceDueDate(calculateDefaultDueDate(newInvoiceDate));
      } else {
        const today = new Date().toISOString().slice(0, 10);
        setNewInvoiceDueDate(calculateDefaultDueDate(today));
      }
    }
  }, [isNewInvoiceSheetOpen, newInvoiceDate]);

  // Synchronize canvasClientSearch when newInvoiceClientId or clients changes
  React.useEffect(() => {
    const client = clients.find(c => c.id === newInvoiceClientId);
    setCanvasClientSearch(client ? client.name : '');
  }, [newInvoiceClientId, clients]);

  // Memoized inline suggestion for canvas autocomplete
  const inlineSuggestion = React.useMemo(() => {
    if (!canvasClientSearch || !isCanvasSearchFocused) return '';
    const match = clients.find(c => 
      c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase())
    );
    if (match && match.name.toLowerCase() !== canvasClientSearch.toLowerCase()) {
      return match.name;
    }
    return '';
  }, [canvasClientSearch, clients, isCanvasSearchFocused]);

  const handleCanvasSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight') {
      if (inlineSuggestion) {
        const match = clients.find(c => 
          c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase())
        );
        if (match) {
          e.preventDefault();
          setNewInvoiceClientId(match.id);
          setCanvasClientSearch(match.name);
          setIsCanvasSearchFocused(false);
        }
      }
    }
  };

  // Synchronize line items when the invoice modal opens
  React.useEffect(() => {
    if (isNewInvoiceSheetOpen) {
      if (newInvoiceAppointmentId) {
        const app = appointments.find(a => a.id === newInvoiceAppointmentId);
        if (app) {
          setLineItems([
            { id: '1', description: app.serviceName, price: app.price }
          ]);
          return;
        }
      }
      
      if (newInvoiceAmount) {
        setLineItems([
          { id: '1', description: 'Behandlung / Leistung', price: parseFloat(newInvoiceAmount.replace(',', '.')) || 0 }
        ]);
        return;
      }

      setLineItems([
        { id: '1', description: 'Physiotherapeutische Behandlung', price: 0 }
      ]);
    } else {
      setLineItems([]);
    }
  }, [isNewInvoiceSheetOpen, newInvoiceAppointmentId, newInvoiceAmount, appointments]);

  // Compute total dynamically
  const calculatedTotal = lineItems.reduce((sum, item) => sum + item.price, 0);

  // Sync computed total back to context newInvoiceAmount state
  React.useEffect(() => {
    setNewInvoiceAmount(calculatedTotal.toFixed(2));
  }, [calculatedTotal, setNewInvoiceAmount]);

  const formatAppTimeRange = (startTimeStr: string, durationMin: number) => {
    const start = new Date(startTimeStr);
    const end = new Date(start.getTime() + durationMin * 60000);
    const startStr = start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const endStr = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppDate || !newAppClientId || !newAppServiceId) return;

    const cli = clients.find(c => c.id === newAppClientId);
    const srv = services.find(s => s.id === newAppServiceId);
    if (!cli || !srv) return;

    const start = new Date(newAppDate);
    start.setHours(newAppHour, 0, 0, 0);
    const end = new Date(start.getTime() + srv.duration * 60000);

    const newApp = {
      id: `a-${Date.now()}`,
      clientId: cli.id,
      clientName: cli.name,
      serviceId: srv.id,
      serviceName: srv.name,
      price: srv.price,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: 'booked' as const
    };

    setAppointments(prev => [...prev, newApp]);
    setIsSheetOpen(false);
    showToast('Termin erfolgreich eingetragen.', 'success');
  };

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
        setNewAppDate(new Date('2026-06-01').toISOString().slice(0, 10));
        setNewAppHour(9);
        if (clients.length > 0) setNewAppClientId(clients[0].id);
        if (services.length > 0) setNewAppServiceId(services[0].id);
        setIsSheetOpen(true);
      }
    },
    {
      id: 'patients',
      title: 'Patienten anzeigen',
      icon: Users,
      onSelect: () => router.push('/dashboard/clients')
    },
    {
      id: 'new-patient',
      title: 'Neuen Patienten anlegen',
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
    <div className="min-h-screen bg-[#f9f9f8] text-[#191c1c] font-sans antialiased overflow-hidden flex">
      {/* SideNavBar Shell */}
      {/* SideNavBar Shell */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#f3f4f3] flex flex-col p-6 z-50 border-r border-[#bfc9c3]/30 justify-between">
        
        {/* TOP SECTION */}
        <div className="flex flex-col flex-grow min-h-0">
          {/* Workspace Switcher / Profile Card */}
          <div ref={profileDropdownRef} className="relative mb-4">
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-3 px-2.5 py-2 hover:bg-white/40 rounded-lg transition-all text-left w-full cursor-pointer group border border-transparent hover:border-[#bfc9c3]/20"
            >
              <div className="w-8 h-8 rounded-md bg-[#003527] flex items-center justify-center shrink-0 shadow-sm">
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
              <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-[#bfc9c3]/30 rounded-lg shadow-lg py-1.5 z-[100] text-left">
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
              href="/dashboard/calendar"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                pathname === '/dashboard/calendar'
                  ? 'bg-white text-[#003527] border border-[#bfc9c3]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                  : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
              }`}
            >
              <CalendarIcon className="w-4 h-4 shrink-0" /> Kalender
            </Link>

            <Link
              href="/dashboard/clients"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                pathname === '/dashboard/clients'
                  ? 'bg-white text-[#003527] border border-[#bfc9c3]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                  : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" /> Patienten
            </Link>

            <Link
              href="/dashboard/invoices"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                pathname === '/dashboard/invoices'
                  ? 'bg-white text-[#003527] border border-[#bfc9c3]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                  : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
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
                    <button
                      type="button"
                      onClick={() => showToast('Die öffentliche Buchungsseite ist aktiv.', 'info')}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-white/50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Buchungsseite</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </button>
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
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-white/50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
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
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-white/50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
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
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-white/50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
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
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-white/50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
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
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-white/50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-3.5 h-3.5 text-[#003527]/70 shrink-0" /> 
                        <span>Google Reviews</span>
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
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold text-[#404944] hover:bg-white/50 hover:text-[#003527] transition-all bg-transparent border-none cursor-pointer text-left"
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
            className="w-full flex items-center justify-between bg-white border border-[#bfc9c3]/20 hover:border-[#bfc9c3]/50 rounded-lg px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-[#003527] transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#003527]" /> Suche...
            </span>
            <div className="flex items-center gap-0.5 opacity-70">
              <kbd className="bg-zinc-100 border border-zinc-200/50 px-1 py-0.5 rounded text-[9px] font-mono font-bold shadow-sm text-zinc-500">⌘</kbd>
              <kbd className="bg-zinc-100 border border-zinc-200/50 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shadow-sm text-zinc-500">K</kbd>
            </div>
          </button>

          {/* Separator Line */}
          <div className="h-px bg-[#bfc9c3]/20 my-1 mx-2" />

          {/* Erweiterungen */}
          <Link
            href="/dashboard/addons"
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold transition-all ${
              pathname === '/dashboard/addons'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" /> Erweiterungen
          </Link>

          {/* Einstellungen */}
          <Link
            href="/dashboard/settings"
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-[11px] font-bold transition-all ${
              pathname === '/dashboard/settings'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" /> Einstellungen
          </Link>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 pl-64 min-h-screen flex flex-col overflow-hidden relative">
        {children}
      </div>

      {/* DETAIL VIEW / DETAILS APPOINTMENT SIDE SHEET */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[90] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-[#043F2D]">
                    {sheetMode === 'new' ? 'Neuer Termin' : 'Termindetails'}
                  </h3>
                  <button 
                    onClick={() => setIsSheetOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {sheetMode === 'new' ? (
                  <form onSubmit={handleCreateAppointment} className="space-y-5 text-left">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Patient / Klient</label>
                      <select
                        value={newAppClientId}
                        onChange={(e) => setNewAppClientId(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] cursor-pointer"
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Leistung</label>
                      <select
                        value={newAppServiceId}
                        onChange={(e) => setNewAppServiceId(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] cursor-pointer"
                      >
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.duration} Min - {s.price} €)</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Datum</label>
                        <input
                          type="date"
                          value={newAppDate}
                          onChange={(e) => setNewAppDate(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Uhrzeit (Start)</label>
                        <select
                          value={newAppHour}
                          onChange={(e) => setNewAppHour(parseInt(e.target.value))}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] cursor-pointer"
                        >
                          {Array.from({ length: 8 }).map((_, i) => {
                            const hr = i + 9;
                            return (
                              <option key={hr} value={hr}>{hr.toString().padStart(2, '0')}:00 Uhr</option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs mt-6 transition-all cursor-pointer"
                    >
                      Termin eintragen
                    </button>
                  </form>
                ) : (
                  selectedAppointment && (
                    <div className="space-y-6 text-left">
                      <div className="bg-[#f9f9f8] border border-[#bfc9c3]/40 rounded-[1.5rem] p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-extrabold text-[#003527] bg-[#003527]/5 border border-[#003527]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {selectedAppointment.serviceName.split(' ')[0]}
                          </span>
                          <span className="font-extrabold text-sm text-[#003527]">{selectedAppointment.price.toFixed(2)} €</span>
                        </div>
                        
                        <h4 className="font-extrabold text-sm text-[#043F2D] leading-tight">{selectedAppointment.serviceName}</h4>
                        
                        <div className="space-y-1.5 text-xs text-[#404944] font-semibold">
                          <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#003527]/60" /> {selectedAppointment.clientName}</p>
                          <p className="flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5 text-[#003527]/60" /> {new Date(selectedAppointment.startTime).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#003527]/60" /> {formatAppTimeRange(selectedAppointment.startTime, Math.round((new Date(selectedAppointment.endTime).getTime() - new Date(selectedAppointment.startTime).getTime()) / 60000))} Uhr</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Status ändern</label>
                        <div className="flex gap-2">
                          {[
                            { id: 'booked', label: 'Reserviert', activeClass: 'bg-amber-500 text-white border-amber-500', defaultClass: 'bg-amber-50 text-amber-800 border-amber-200' },
                            { id: 'confirmed', label: 'Bestätigt', activeClass: 'bg-blue-600 text-white border-blue-600', defaultClass: 'bg-blue-50 text-blue-800 border-blue-200' },
                            { id: 'noshow', label: 'Erledigt', activeClass: 'bg-emerald-600 text-white border-emerald-600', defaultClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                            { id: 'cancelled', label: 'Absage', activeClass: 'bg-rose-500 text-white border-rose-500', defaultClass: 'bg-rose-50 text-rose-800 border-rose-200' }
                          ].map((st) => {
                            const isActive = selectedAppointment.status === st.id;
                            return (
                              <button
                                key={st.id}
                                onClick={() => {
                                  const updated = { ...selectedAppointment, status: st.id as any };
                                  setSelectedAppointment(updated);
                                  setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updated : a));
                                }}
                                className={`flex-1 py-2 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                                  isActive ? st.activeClass : st.defaultClass
                                }`}
                              >
                                {st.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#003527]" /> Abrechnung & Rechnung
                        </h4>
                        
                        {(() => {
                          const invoice = invoices.find(inv => inv.appointmentId === selectedAppointment.id);
                          if (invoice) {
                            return (
                              <div className="flex justify-between items-center text-xs font-semibold text-[#404944]">
                                <div 
                                  onClick={() => {
                                    setIsSheetOpen(false);
                                    router.push('/dashboard/invoices');
                                  }}
                                  className="cursor-pointer hover:bg-zinc-100/80 p-1.5 rounded-lg transition-colors text-left"
                                  title="Zur Rechnung navigieren"
                                >
                                  <p className="font-bold text-[#003527]">Rechnungsnummer: {invoice.invoiceNumber}</p>
                                  <p className="text-[10px] text-zinc-400 mt-0.5">Erstellt am: {new Date(invoice.date).toLocaleDateString('de-DE')}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                                    invoice.status === 'paid' 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                      : 'bg-rose-50 border-rose-200 text-rose-800'
                                  }`}>
                                    {invoice.status === 'paid' ? 'Bezahlt' : 'Offen'}
                                  </span>
                                  {invoice.status === 'open' && (
                                    <button 
                                      onClick={() => markInvoicePaid(invoice.id)}
                                      className="text-[9px] bg-emerald-600 text-white px-2 py-1 rounded transition-colors cursor-pointer"
                                    >
                                      Bezahlen
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => printInvoice(invoice)}
                                    className="p-1 bg-zinc-200 hover:bg-zinc-300 text-[#003527] rounded transition-colors cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-zinc-400 italic font-semibold">Keine Rechnung für diesen Termin erstellt.</span>
                                <button 
                                  onClick={() => openNewInvoiceSheetWithPrefill({
                                    clientId: selectedAppointment.clientId,
                                    amount: selectedAppointment.price,
                                    appointmentId: selectedAppointment.id,
                                    clientName: selectedAppointment.clientName,
                                    date: selectedAppointment.startTime.slice(0, 10)
                                  })}
                                  className="bg-[#003527] hover:bg-[#0b513d] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3 text-white" /> Abrechnen
                                </button>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">SOAP-Verlauf</h4>
                        {(() => {
                          const note = soapNotes.find(n => n.appointmentId === selectedAppointment.id);
                          if (note) {
                            return (
                              <div className="space-y-2 text-xs font-semibold text-[#404944]">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-zinc-400 font-bold">Diagnose / SOAP vorhanden</span>
                                  <button 
                                    onClick={() => {
                                      setSelectedClientId(selectedAppointment.clientId);
                                      startEditSoap(note);
                                      setIsSheetOpen(false);
                                      router.push('/dashboard/clients');
                                    }}
                                    className="text-[10px] text-[#003527] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                                  >
                                    Bearbeiten
                                  </button>
                                </div>
                                <p className="line-clamp-2 text-zinc-500 mt-1 italic"><strong>S:</strong> {note.subjective}</p>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-zinc-400 italic">Keine Behandlungsnotiz hinterlegt.</span>
                                <button 
                                  onClick={() => {
                                    createSoapNote(selectedAppointment.id, selectedAppointment.clientId);
                                    router.push('/dashboard/clients');
                                    setIsSheetOpen(false);
                                  }}
                                  className="text-[10px] text-[#003527] hover:underline font-bold cursor-pointer"
                                >
                                  Bericht anlegen
                                </button>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Private Anmerkungen zu dieser Sitzung</label>
                        <textarea
                          rows={3}
                          value={selectedAppointment.notes || ''}
                          onChange={(e) => {
                            const updated = { ...selectedAppointment, notes: e.target.value };
                            setSelectedAppointment(updated);
                            setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updated : a));
                          }}
                          placeholder="z.B. Patient kam 5 Min später, Schwerpunkt heute LWS Mobilisierung..."
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-semibold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="pt-6 border-t border-[#bfc9c3]/20 flex justify-between items-center">
                        <button
                          onClick={() => {
                            if (confirm('Möchtest du diesen Termin wirklich löschen?')) {
                              setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id));
                              setIsSheetOpen(false);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Termin löschen
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EMAIL WRITING MODAL */}
      <AnimatePresence>
        {isMailModalOpen && currentClient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMailModalOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[120]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[560px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[130] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-[#043F2D]">E-Mail an {currentClient.name}</h3>
                  <button 
                    onClick={() => setIsMailModalOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-5">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Vorlage</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyMailTemplate('custom', undefined, undefined, currentClient)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'custom'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Ohne
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                        const invId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                        applyMailTemplate('rechnung', invId, undefined, currentClient);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'rechnung'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Rechnung
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                        const appId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                        applyMailTemplate('bestaetigung', undefined, appId, currentClient);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'bestaetigung'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Terminbestätigung
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                        const appId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                        applyMailTemplate('stornierung', undefined, appId, currentClient);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'stornierung'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Terminabsage
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                        const invId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                        applyMailTemplate('mahnung', invId, undefined, currentClient);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        mailTopic === 'mahnung'
                          ? 'bg-[#003527] text-white'
                          : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                      }`}
                    >
                      Zahlungserinnerung
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendMail} className="space-y-4">
                  {(mailTopic === 'rechnung' || mailTopic === 'mahnung') && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Zugehörige Rechnung auswählen</label>
                      <select
                        value={selectedMailInvoiceId}
                        onChange={(e) => {
                          setSelectedMailInvoiceId(e.target.value);
                          applyMailTemplate(mailTopic, e.target.value, undefined, currentClient);
                        }}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                      >
                        {invoices.filter(i => i.clientId === currentClient.id).map(i => (
                          <option key={i.id} value={i.id}>
                            Rechnung {i.invoiceNumber} vom {new Date(i.date).toLocaleDateString('de-DE')} ({i.amount.toFixed(2)} €)
                          </option>
                        ))}
                        {invoices.filter(i => i.clientId === currentClient.id).length === 0 && (
                          <option value="">Keine Rechnungen vorhanden</option>
                        )}
                      </select>
                    </div>
                  )}

                  {(mailTopic === 'stornierung' || mailTopic === 'bestaetigung') && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Zugehörigen Termin auswählen</label>
                      <select
                        value={selectedMailAppointmentId}
                        onChange={(e) => {
                          setSelectedMailAppointmentId(e.target.value);
                          applyMailTemplate(mailTopic, undefined, e.target.value, currentClient);
                        }}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                      >
                        {appointments.filter(a => a.clientId === currentClient.id).map(a => {
                          const dateStr = new Date(a.startTime).toLocaleDateString('de-DE');
                          const timeStr = new Date(a.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                          return (
                            <option key={a.id} value={a.id}>
                              {a.serviceName} - {dateStr} um {timeStr} Uhr
                            </option>
                          );
                        })}
                        {appointments.filter(a => a.clientId === currentClient.id).length === 0 && (
                          <option value="">Keine Termine vorhanden</option>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Empfänger</label>
                    <div className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-left select-none">
                      <div className="w-6 h-6 rounded-full bg-[#003527]/10 text-[#003527] flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                        {getInitials(currentClient.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-[#003527] truncate">{currentClient.name}</span>
                        <span className="text-[10px] text-zinc-400 font-semibold truncate">{currentClient.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Betreff</label>
                    <input
                      type="text"
                      required
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      placeholder="z.B. Ihre Rechnung zur Behandlung"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">E-Mail Text</label>
                    <textarea
                      rows={8}
                      required
                      value={mailBody}
                      onChange={(e) => setMailBody(e.target.value)}
                      placeholder="Sehr geehrte Damen und Herren..."
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none resize-none h-64 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsMailModalOpen(false)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      E-Mail senden
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NEW INVOICE CREATION FULL-SCREEN MODAL */}
      <AnimatePresence>
        {isNewInvoiceSheetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed inset-0 bg-[#f9f9f8] z-[150] flex flex-col overflow-hidden text-left font-sans"
          >
            <form onSubmit={handleCreateInvoice} className="h-full w-full flex flex-col overflow-hidden">
              {/* Split Workspace */}
              <div className="flex-grow flex min-h-0 overflow-hidden relative">
                {/* Floating exit button */}
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceSheetOpen(false)}
                  className="absolute top-6 left-6 w-9 h-9 rounded-full bg-zinc-200/50 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer z-20"
                  title="Abbrechen"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left Side Container: DINA4 Document Canvas Workspace */}
                <div className="flex-grow bg-[#f3f4f3] relative flex flex-col min-h-0">
                  {/* Scrollable Canvas Viewport */}
                  <div className="flex-grow overflow-y-auto p-12 flex justify-center items-start min-h-0">
                    
                    {/* DIN A4 Canvas Sheet Wrapper for Zooming */}
                  <div
                    style={{
                      transform: `scale(${zoomScale / 100})`,
                      transformOrigin: 'top center',
                      width: '100%',
                      maxWidth: '800px',
                      marginBottom: `${(zoomScale / 100 - 1) * 1130}px`
                    }}
                    className="transition-all duration-200 flex justify-center"
                  >
                    {/* DIN A4 Canvas Sheet */}
                    <div className="bg-white shadow-2xl rounded-lg p-16 border border-[#bfc9c3]/30 w-full min-h-[1130px] flex flex-col justify-between text-[#003527] font-sans relative my-4">
                      
                      {/* DINA4 Header: Letterhead */}
                      <div>
                        <div className="flex justify-between items-start border-b border-[#bfc9c3]/20 pb-8 mb-10">
                          <div className="text-left space-y-1">
                            <h4 className="text-base font-extrabold text-[#003527] tracking-tight">{therapistName}</h4>
                            <p className="text-[10px] text-zinc-400 font-semibold">{address}</p>
                            <p className="text-[10px] text-zinc-400 font-semibold">Tel: {phone}</p>
                          </div>
                          <div className="text-right">
                            <h1 className="text-xl font-bold tracking-widest text-[#003527]/40 font-serif">RECHNUNG</h1>
                          </div>
                        </div>

                        {/* Recipient on the left, details on the right split layout */}
                        <div className="grid grid-cols-2 gap-8 border-b border-[#bfc9c3]/20 pb-8 mb-10 text-[#003527]">
                          {/* Left: Recipient */}
                          <div className="text-left space-y-2 relative">
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Rechnungsempfänger</p>
                            
                            {/* Autocomplete Search input */}
                            <div className="relative w-full flex items-center">
                              {/* Underlay text for suggestion */}
                              {inlineSuggestion && (
                                <div className="absolute left-0 right-0 px-2 py-1 pointer-events-none font-extrabold text-sm select-none text-zinc-300 whitespace-pre flex items-center">
                                  <span className="opacity-0">{canvasClientSearch}</span>
                                  <span>{inlineSuggestion.slice(canvasClientSearch.length)}</span>
                                </div>
                              )}
                              
                              <input
                                type="text"
                                value={canvasClientSearch}
                                onFocus={() => setIsCanvasSearchFocused(true)}
                                onBlur={() => {
                                  setTimeout(() => setIsCanvasSearchFocused(false), 200);
                                }}
                                onKeyDown={handleCanvasSearchKeyDown}
                                onChange={(e) => {
                                  setCanvasClientSearch(e.target.value);
                                  // If user clears name, clear ID
                                  if (!e.target.value) {
                                    setNewInvoiceClientId('');
                                  }
                                }}
                                placeholder="Name des Patienten..."
                                className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 focus:bg-blue-50/20 px-2 py-1 outline-none font-extrabold text-sm text-[#003527] transition-all rounded-lg z-10"
                              />
                            </div>

                            {/* Recipient Details display below input */}
                            {(() => {
                              const client = clients.find(c => c.id === newInvoiceClientId);
                              if (client) {
                                return (
                                  <div className="space-y-0.5 text-xs text-zinc-400 font-semibold pl-2 transition-all animate-in fade-in duration-200">
                                    <p className="text-[11px]">{client.email}</p>
                                    <p className="text-[11px]">{client.phone}</p>
                                  </div>
                                );
                              }
                              
                              if (inlineSuggestion) {
                                const match = clients.find(c => c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase()));
                                if (match) {
                                  return (
                                    <div className="space-y-0.5 text-xs text-zinc-300/55 font-semibold pl-2 transition-all animate-in fade-in duration-200">
                                      <p className="text-[11px]">{match.email} (Vorschau)</p>
                                      <p className="text-[11px]">{match.phone} (Vorschau)</p>
                                    </div>
                                  );
                                }
                              }
                              if (canvasClientSearch && !clients.some(c => c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase()))) {
                                return (
                                  <div className="pl-2 pt-1 animate-in fade-in duration-200">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewClientName(canvasClientSearch);
                                        setIsNewClientModalOpen(true);
                                      }}
                                      className="text-[10.5px] text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-1.5 transition-all"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> "{canvasClientSearch}" als neuen Patienten anlegen
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <p className="text-[10px] text-amber-600 font-semibold pl-2 italic">
                                  Bitte Namen eingeben, um Patient auszuwählen.
                                </p>
                              );
                            })()}
                          </div>

                          {/* Right: Details (Rechnungsdaten) */}
                          <div className="flex flex-col items-end justify-start text-right">
                            <div className="w-full max-w-[240px] space-y-2 text-xs font-bold">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Rechnungs-Nr.</span>
                                <input
                                  type="text"
                                  required
                                  value={newInvoiceNumber}
                                  onChange={(e) => setNewInvoiceNumber(e.target.value)}
                                  className="w-32 bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 focus:bg-blue-50/20 px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Datum</span>
                                <input
                                  type="date"
                                  required
                                  value={newInvoiceDate}
                                  onChange={(e) => setNewInvoiceDate(e.target.value)}
                                  className="w-32 bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 focus:bg-blue-50/20 px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg animate-none"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Zahlungsziel</span>
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className="text-[10px] text-zinc-400 font-semibold pr-1">
                                    ({getDaysDifference(newInvoiceDate || new Date().toISOString().slice(0, 10), newInvoiceDueDate)} Tage)
                                  </span>
                                  <input
                                    type="date"
                                    required
                                    value={newInvoiceDueDate}
                                    onChange={(e) => setNewInvoiceDueDate(e.target.value)}
                                    className="w-32 bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 focus:bg-blue-50/20 px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="space-y-4">
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider border-b border-[#bfc9c3]/20 pb-2">Rechnungspositionen</p>
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] border-b border-[#bfc9c3]/20">
                                <th className="py-2 w-12 font-bold">Pos.</th>
                                <th className="py-2 font-bold">Leistungsbeschreibung</th>
                                <th className="py-2 text-right w-28 font-bold">Betrag</th>
                                <th className="py-2 text-right w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {lineItems.map((item, idx) => (
                                <tr key={item.id} className="border-b border-[#bfc9c3]/10 group/row font-bold text-[#003527]">
                                  <td className="py-3.5 font-mono text-zinc-400 text-left">{idx + 1}</td>
                                  <td className="py-2">
                                    <input
                                      type="text"
                                      required
                                      value={item.description}
                                      onChange={(e) => {
                                        const updated = lineItems.map(li => li.id === item.id ? { ...li, description: e.target.value } : li);
                                        setLineItems(updated);
                                      }}
                                      className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 focus:bg-blue-50/20 focus:ring-0 px-2 py-1 outline-none font-bold text-xs text-[#003527] transition-all text-left rounded-lg"
                                      placeholder="z.B. Osteopathische Behandlung"
                                    />
                                  </td>
                                  <td className="py-2 text-right">
                                    <div className="inline-flex items-center justify-end">
                                      <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={item.price || ''}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          const updated = lineItems.map(li => li.id === item.id ? { ...li, price: val } : li);
                                          setLineItems(updated);
                                        }}
                                        className="w-20 bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 focus:bg-blue-50/20 focus:ring-0 px-2 py-1 outline-none font-bold text-right text-xs text-[#003527] transition-all rounded-lg"
                                        placeholder="0,00"
                                      />
                                      <span className="ml-1 text-zinc-400 font-bold">€</span>
                                    </div>
                                  </td>
                                  <td className="py-2 text-right">
                                    {lineItems.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setLineItems(lineItems.filter(li => li.id !== item.id));
                                        }}
                                        className="text-rose-600 hover:text-rose-700 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer p-1"
                                        title="Position löschen"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Add item button */}
                          <button
                            type="button"
                            onClick={() => {
                              setLineItems([
                                ...lineItems,
                                { id: `li-${Date.now()}`, description: 'Neue Leistung', price: 0 }
                              ]);
                            }}
                            className="w-full mt-4 border border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/10 hover:bg-blue-50/30 text-blue-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                          >
                            <Plus className="w-4 h-4" /> Position hinzufügen
                          </button>
                        </div>
                      </div>

                      {/* DINA4 Footer & Total Block */}
                      <div className="mt-16 space-y-12">
                        {/* Total Sum */}
                        <div className="flex justify-end items-baseline gap-4 border-t border-[#bfc9c3]/20 pt-6">
                          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Gesamtsumme:</span>
                          <span className="text-2xl font-extrabold text-[#003527] font-serif">{calculatedTotal.toFixed(2)} €</span>
                        </div>

                        {/* Bottom Payment Terms details */}
                        <div className="border-t border-[#bfc9c3]/20 pt-6 space-y-3">
                          <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                            Bitte überweisen Sie den Rechnungsbetrag von <strong className="text-[#003527]">{calculatedTotal.toFixed(2)} €</strong> bis zum <strong className="text-[#003527]">{formatDateGerman(newInvoiceDueDate)}</strong> (innerhalb von {getDaysDifference(newInvoiceDate || new Date().toISOString().slice(0, 10), newInvoiceDueDate)} Tagen) unter Angabe der Rechnungsnummer <strong className="text-[#003527]">{newInvoiceNumber}</strong> auf das unten aufgeführte Praxiskonto.
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-[9px] text-zinc-400 font-semibold border-t border-[#bfc9c3]/10 pt-3">
                            <div className="space-y-0.5">
                              <p>Inhaber: {therapistName}</p>
                              <p>Steuernummer: 12/345/67890</p>
                            </div>
                            <div className="space-y-0.5 text-right">
                              <p>IBAN: DE89 5003 0000 1234 5678 90</p>
                              <p>BIC: WELADED1XXX</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Floating Zoom Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-zinc-200/80 px-4 py-2 rounded-full shadow-lg flex items-center gap-3 z-30 select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    type="button"
                    onClick={() => setZoomScale(prev => Math.max(70, prev - 10))}
                    disabled={zoomScale <= 70}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 disabled:opacity-40 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                    title="Verkleinern"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-extrabold text-[#003527] w-12 text-center select-none">
                    {zoomScale}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomScale(prev => Math.min(130, prev + 10))}
                    disabled={zoomScale >= 130}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 disabled:opacity-40 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                    title="Vergrößern"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

                {/* Right Side: Sidebar Panel */}
                <aside className="w-80 bg-white border-l border-[#bfc9c3]/30 p-6 flex flex-col justify-between overflow-y-auto flex-shrink-0">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-wider mb-4 border-b border-[#bfc9c3]/20 pb-2">Rechnungsdaten</h4>
                    </div>

                    <div className="space-y-5 text-left">
                      <div className="space-y-2 relative" ref={dropdownRef}>
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Patient auswählen</label>
                        
                        {/* Custom Trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsClientDropdownOpen(!isClientDropdownOpen);
                            setSidebarClientSearch('');
                          }}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-2.5 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] hover:border-zinc-300 transition-all cursor-pointer flex items-center justify-between gap-2 text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {selectedClientForInvoice ? (
                              <>
                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                                  {getInitials(selectedClientForInvoice.name)}
                                </div>
                                <span className="truncate">{selectedClientForInvoice.name}</span>
                              </>
                            ) : (
                              <span className="text-zinc-400">Patient auswählen...</span>
                            )}
                          </div>
                          <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        </button>

                        {/* Custom Dropdown Menu */}
                        {isClientDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left flex flex-col max-h-[300px]">
                            {/* Search Input Container */}
                            <div className="p-2.5 bg-zinc-50/60 border-b border-zinc-100">
                              <div className="relative flex items-center">
                                <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                                <input
                                  type="text"
                                  value={sidebarClientSearch}
                                  onChange={(e) => setSidebarClientSearch(e.target.value)}
                                  placeholder="Patient suchen..."
                                  autoFocus
                                  className="w-full bg-white border border-zinc-200/60 focus:border-zinc-300 rounded-lg pl-9 pr-3 py-1.5 font-bold text-xs text-[#003527] outline-none transition-all"
                                />
                              </div>
                            </div>
                            
                            {/* Patient Options List */}
                            <div className="overflow-y-auto py-1 flex-grow">
                              {filteredClientsForSidebar.length > 0 ? (
                                filteredClientsForSidebar.map(client => {
                                  const isSelected = client.id === newInvoiceClientId;
                                  return (
                                    <button
                                      type="button"
                                      key={client.id}
                                      onClick={() => {
                                        setNewInvoiceClientId(client.id);
                                        setIsClientDropdownOpen(false);
                                        setSidebarClientSearch('');
                                      }}
                                      className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer text-left ${
                                        isSelected 
                                          ? 'bg-blue-50 text-blue-600' 
                                          : 'text-[#003527] hover:bg-blue-50/30 hover:text-blue-600'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                                          isSelected ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-500'
                                        }`}>
                                          {getInitials(client.name)}
                                        </div>
                                        <span className="truncate">{client.name}</span>
                                      </div>
                                      {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />}
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="px-4 py-3 text-xs text-zinc-400 font-semibold italic text-center">
                                  Keine Patienten gefunden
                                </div>
                              )}
                            </div>

                            {/* Persistent Customer Add Button */}
                            <div className="border-t border-zinc-100 p-1.5 bg-zinc-50/40">
                              <button
                                type="button"
                                onClick={() => {
                                  if (sidebarClientSearch) {
                                    setNewClientName(sidebarClientSearch);
                                  }
                                  setIsNewClientModalOpen(true);
                                  setIsClientDropdownOpen(false);
                                }}
                                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50/50 hover:text-blue-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Patient hinzufügen
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Rechnungsnummer</label>
                        <input
                          type="text"
                          required
                          value={newInvoiceNumber}
                          onChange={(e) => setNewInvoiceNumber(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Rechnungsdatum</label>
                        <input
                          type="date"
                          required
                          value={newInvoiceDate}
                          onChange={(e) => setNewInvoiceDate(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Zahlungsstatus</label>
                        <select
                          required
                          value={newInvoiceStatus}
                          onChange={(e) => setNewInvoiceStatus(e.target.value as 'open' | 'paid' | 'overdue')}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                        >
                          <option value="open">Offen</option>
                          <option value="paid">Bezahlt</option>
                          <option value="overdue">Überfällig</option>
                        </select>
                      </div>

                      <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 p-4 rounded-2xl text-[10px] text-zinc-400 font-bold space-y-1">
                        <p className="text-[#003527] uppercase tracking-wider text-[8px] mb-1">Berechneter Gesamtbetrag</p>
                        <p className="text-base font-extrabold text-[#003527]">{calculatedTotal.toFixed(2)} €</p>
                        <p className="font-semibold text-zinc-400">({lineItems.length} Position(en))</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-[#bfc9c3]/20">
                    <button
                      type="submit"
                      className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-none"
                    >
                      <Check className="w-4 h-4" /> Rechnung speichern
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewInvoiceSheetOpen(false)}
                      className="w-full bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Abbrechen
                    </button>
                  </div>
                </aside>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW PATIENT CREATION MODAL */}
      <AnimatePresence>
        {isNewClientModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewClientModalOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[170]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[180] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-[#043F2D]">Neuen Patienten anlegen</h3>
                  <button 
                    onClick={() => setIsNewClientModalOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateClient} className="space-y-5 text-left">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Name, Vorname</label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="z.B. Sarah Müller"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Geburtsdatum</label>
                      <input
                        type="date"
                        value={newClientBirthday}
                        onChange={(e) => setNewClientBirthday(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Telefon</label>
                      <input
                        type="text"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        placeholder="z.B. +49 176 1234567"
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">E-Mail Adresse</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="z.B. patient@email.de"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Notfallkontakt</label>
                    <input
                      type="text"
                      value={newClientEmergency}
                      onChange={(e) => setNewClientEmergency(e.target.value)}
                      placeholder="z.B. Sarah Hoffmann (Ehefrau) - +49 176 7654321"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Anmerkungen & Vorerkrankungen</label>
                    <textarea
                      rows={4}
                      value={newClientNotes}
                      onChange={(e) => setNewClientNotes(e.target.value)}
                      placeholder="Chronische LWS-Schmerzen, Schreibtischjob..."
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none resize-none h-24 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsNewClientModalOpen(false)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Patient speichern
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCmdkOpen} setIsOpen={setIsCmdkOpen} actions={cmdkActions} />

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

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `${contextMenu.y + 250 > window.innerHeight ? Math.max(10, contextMenu.y - 250) : contextMenu.y}px`,
              left: `${contextMenu.x + 224 > window.innerWidth ? Math.max(10, contextMenu.x - 224) : contextMenu.x}px`,
              zIndex: 9999,
            }}
            className="w-56 bg-white/80 backdrop-blur-xl border border-[#bfc9c3]/30 rounded-2xl shadow-xl p-1.5 flex flex-col font-sans text-xs text-[#003527] divide-y divide-[#bfc9c3]/15 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider select-none text-left">
              {contextMenu.appointment.clientName}
            </div>

            <div className="py-1 flex flex-col">
              {(() => {
                const invoice = invoices.find(inv => inv.appointmentId === contextMenu.appointment.id);
                if (invoice) {
                  return (
                    <>
                      <button
                        onClick={() => {
                          setContextMenu(null);
                          router.push('/dashboard/invoices');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Rechnung anzeigen
                      </button>
                      <button
                        onClick={() => {
                          setContextMenu(null);
                          printInvoice(invoice);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Rechnung drucken
                      </button>
                      <button
                        onClick={() => {
                          setContextMenu(null);
                          downloadInvoicePdf(invoice);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Als PDF laden
                      </button>
                    </>
                  );
                } else {
                  return (
                    <button
                      onClick={() => {
                        setContextMenu(null);
                        openNewInvoiceSheetWithPrefill({
                          clientId: contextMenu.appointment.clientId,
                          amount: contextMenu.appointment.price,
                          appointmentId: contextMenu.appointment.id,
                          clientName: contextMenu.appointment.clientName,
                          date: contextMenu.appointment.startTime.slice(0, 10)
                        });
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold text-emerald-700 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      Rechnung erstellen
                    </button>
                  );
                }
              })()}
            </div>

            <div className="py-1 flex flex-col">
              <button
                onClick={() => {
                  setContextMenu(null);
                  setSelectedAppointment(contextMenu.appointment);
                  setSheetMode('edit');
                  setIsSheetOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                Termin bearbeiten
              </button>
              
              <button
                onClick={() => {
                  setContextMenu(null);
                  const client = clients.find(c => c.id === contextMenu.appointment.clientId);
                  if (client) {
                    setSelectedClientId(client.id);
                    createSoapNote(contextMenu.appointment.id, client.id);
                    router.push('/dashboard/clients');
                  }
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                SOAP-Bericht erstellen
              </button>

              <button
                onClick={() => {
                  setContextMenu(null);
                  const client = clients.find(c => c.id === contextMenu.appointment.clientId);
                  if (client) {
                    setSelectedClientId(client.id);
                    setSelectedMailAppointmentId(contextMenu.appointment.id);
                    const invoice = invoices.find(inv => inv.appointmentId === contextMenu.appointment.id);
                    if (invoice) {
                      setSelectedMailInvoiceId(invoice.id);
                      applyMailTemplate('rechnung', invoice.id, contextMenu.appointment.id, client);
                    } else {
                      applyMailTemplate('bestaetigung', undefined, contextMenu.appointment.id, client);
                    }
                    setIsMailModalOpen(true);
                  }
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                E-Mail schreiben
              </button>
            </div>

            <div className="py-1 flex flex-col">
              <button
                onClick={() => {
                  setContextMenu(null);
                  if (confirm(`Möchtest du den Termin für ${contextMenu.appointment.clientName} wirklich löschen?`)) {
                    setAppointments(prev => prev.filter(a => a.id !== contextMenu.appointment.id));
                    showToast('Termin gelöscht.', 'info');
                  }
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Termin löschen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
