'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, Users, FileText, Settings, LogOut, Search, Plus, 
  Trash2, X, CheckCircle2, AlertCircle, Sparkles, Printer, Download, 
  Mail, Clock, User, Check, Star, Flag, AlertCircle as InfoIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from '@/components/CommandPalette';
import { DashboardProvider, useDashboard } from './context';

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

  // Local state for line items in the invoice creator
  const [lineItems, setLineItems] = React.useState<{ id: string; description: string; price: number }[]>([]);

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
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#f3f4f3] flex flex-col p-6 z-50 border-r border-[#bfc9c3]/30">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-[#003527] flex items-center justify-center text-white font-serif text-lg font-bold">
            P
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#043F2D] leading-none tracking-tight">HManager</h1>
            <p className="text-[10px] text-[#003527]/70 font-semibold mt-1 max-w-[140px] truncate">{therapistName}</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          <Link
            href="/dashboard/calendar"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              pathname === '/dashboard/calendar'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <CalendarIcon className="w-4 h-4" /> Termine & Kalender
          </Link>

          <Link
            href="/dashboard/clients"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              pathname === '/dashboard/clients'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <Users className="w-4 h-4" /> Patienten & CRM
          </Link>

          <Link
            href="/dashboard/invoices"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              pathname === '/dashboard/invoices'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <FileText className="w-4 h-4" /> Abrechnung
          </Link>

          <Link
            href="/dashboard/settings"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              pathname === '/dashboard/settings'
                ? 'bg-white text-[#003527] border border-[#bfc9c3]/30'
                : 'text-[#404944] hover:bg-white/50 hover:text-[#003527]'
            }`}
          >
            <Settings className="w-4 h-4" /> Einstellungen
          </Link>
        </nav>

        <div className="pt-6 border-t border-[#bfc9c3]/30 space-y-4">
          <button 
            onClick={() => setIsCmdkOpen(true)}
            className="w-full flex items-center justify-between bg-white border border-[#bfc9c3]/30 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-400 hover:border-[#003527]/30 transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#003527]" /> Suche...
            </span>
            <kbd className="bg-zinc-100 text-[10px] text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">⌘K</kbd>
          </button>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
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
                  <h3 className="text-lg font-bold text-[#043F2D]">E-Mail schreiben</h3>
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
                    <input
                      type="email"
                      value={currentClient.email}
                      disabled
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-400 rounded-2xl px-4 py-3 font-semibold text-xs outline-none cursor-not-allowed text-left"
                    />
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
              {/* Top Bar Navigation */}
              <div className="bg-white border-b border-[#bfc9c3]/30 px-8 py-4 flex justify-between items-center flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#003527] flex items-center justify-center text-white font-serif text-sm font-bold">
                    R
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#043F2D] leading-none tracking-tight">Rechnung erstellen</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1 font-sans">Interaktiver A4-Entwurf & Details</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewInvoiceSheetOpen(false)}
                    className="bg-zinc-100 hover:bg-zinc-200 text-[#003527] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="bg-[#003527] hover:bg-[#0b513d] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-none"
                  >
                    <Check className="w-3.5 h-3.5 animate-pulse" /> Rechnung speichern
                  </button>
                </div>
              </div>

              {/* Split Workspace */}
              <div className="flex-grow flex min-h-0 overflow-hidden">
                {/* Left Side: DINA4 Document Canvas */}
                <div className="flex-grow bg-[#f3f4f3] p-12 overflow-y-auto flex justify-center items-start">
                  {/* DIN A4 Canvas Sheet */}
                  <div className="bg-white shadow-2xl rounded-lg p-16 border border-[#bfc9c3]/30 w-full max-w-[800px] min-h-[1130px] flex flex-col justify-between text-[#003527] font-sans relative my-4">
                    
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

                      {/* Recipient Address Block */}
                      <div className="mb-10 text-left">
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Rechnungsempfänger</p>
                        {(() => {
                          const client = clients.find(c => c.id === newInvoiceClientId);
                          if (client) {
                            return (
                              <div className="space-y-1 text-xs text-[#003527] font-bold">
                                <p className="text-sm font-extrabold">{client.name}</p>
                                <p className="text-zinc-400 font-medium">{client.email}</p>
                                <p className="text-zinc-400 font-medium">{client.phone}</p>
                              </div>
                            );
                          }
                          return (
                            <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 text-xs font-semibold text-amber-800">
                              Bitte wähle einen Patienten in der rechten Seitenleiste aus, um die Empfängerdaten zu laden.
                            </div>
                          );
                        })()}
                      </div>

                      {/* Invoice Metadata details (Number, Date, Due date) */}
                      <div className="grid grid-cols-3 gap-6 border-y border-[#bfc9c3]/20 py-4 mb-10 text-xs font-bold text-[#003527]">
                        <div>
                          <span className="block text-[9px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Rechnungsnummer</span>
                          <input
                            type="text"
                            required
                            value={newInvoiceNumber}
                            onChange={(e) => setNewInvoiceNumber(e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-[#003527] outline-none font-bold text-xs py-0.5 text-[#003527]"
                          />
                        </div>
                        <div>
                          <span className="block text-[9px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Rechnungsdatum</span>
                          <input
                            type="date"
                            required
                            value={newInvoiceDate}
                            onChange={(e) => setNewInvoiceDate(e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-[#003527] outline-none font-bold text-xs py-0.5 text-[#003527]"
                          />
                        </div>
                        <div>
                          <span className="block text-[9px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Zahlungsfrist</span>
                          <p className="font-semibold text-zinc-400 py-0.5">14 Tage nach Erhalt</p>
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
                                    className="w-full bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-[#003527] focus:ring-0 px-1 py-1 outline-none font-bold text-xs text-[#003527] transition-all text-left"
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
                                      className="w-20 bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-[#003527] focus:ring-0 px-1 py-1 outline-none font-bold text-right text-xs text-[#003527] transition-all"
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
                          className="mt-4 text-[#003527] hover:text-[#0b513d] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Position hinzufügen
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
                          Bitte überweisen Sie den Rechnungsbetrag von <strong className="text-[#003527]">{calculatedTotal.toFixed(2)} €</strong> innerhalb von 14 Tagen unter Angabe der Rechnungsnummer <strong className="text-[#003527]">{newInvoiceNumber}</strong> auf das unten aufgeführte Praxiskonto.
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

                {/* Right Side: Sidebar Panel */}
                <aside className="w-80 bg-white border-l border-[#bfc9c3]/30 p-6 flex flex-col justify-between overflow-y-auto flex-shrink-0">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-wider mb-4 border-b border-[#bfc9c3]/20 pb-2">Rechnungsdaten</h4>
                    </div>

                    <div className="space-y-5 text-left">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Patient auswählen</label>
                        <select
                          required
                          value={newInvoiceClientId}
                          onChange={(e) => setNewInvoiceClientId(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                        >
                          <option value="" disabled>Patient auswählen...</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
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
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[110] p-6 flex flex-col justify-between overflow-y-auto"
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
