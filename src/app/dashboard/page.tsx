'use client';

import React from 'react';
import { useDashboard } from './context';
import { useRouter } from 'next/navigation';
import { Users, Calendar as CalendarIcon, FileText, ArrowUpRight, Search, Star, Plus, Info } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { 
    therapistName, 
    clients, 
    appointments, 
    invoices, 
    setSelectedClientId, 
    toggleClientGdpr, 
    handleClientContextMenu, 
    setIsNewClientModalOpen,
    setSelectedAppointment,
    setIsSheetOpen,
    setSheetMode,
    openNewInvoiceSheet,
    openGdprModal
  } = useDashboard();
  const router = useRouter();
  const [greeting, setGreeting] = React.useState('Guten Tag');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showGdprTooltip, setShowGdprTooltip] = React.useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickAddOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 11) setGreeting('Guten Morgen');
    else if (hours < 18) setGreeting('Guten Tag');
    else setGreeting('Guten Abend');
  }, []);

  const getFirstName = () => {
    if (!therapistName || therapistName.toLowerCase().includes('praxis')) {
      return 'Iven'; // Friendly fallback based on user profile
    }
    return therapistName.split(/\s+/)[0];
  };

  const getTodayAppointmentsCount = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return appointments.filter(app => app.startTime.slice(0, 10) === todayStr).length;
  };



  const todayCount = getTodayAppointmentsCount();

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get upcoming appointments sorted chronologically
  const upcomingAppointments = React.useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let upcoming = appointments
      .filter(app => new Date(app.startTime) >= todayStart)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    if (upcoming.length === 0) {
      upcoming = [...appointments]
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }

    return upcoming.slice(0, 4);
  }, [appointments]);

  const formatAppointmentTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
    
    if (date.toDateString() === today.toDateString()) {
      return `Heute, ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Morgen, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}, ${timeStr}`;
    }
  };

  return (
    <div className="relative flex-grow bg-[#eef0ed] rounded-none lg:rounded-[24px] border-0 lg:border border-[#003527]/10 m-0 lg:my-4 lg:mr-4 lg:ml-4 flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-32px)] overflow-hidden shadow-none transition-all duration-300">
      {/* Content */}
      <div className="flex-grow overflow-auto px-4 lg:px-8 pb-24 lg:pb-6 pt-4 lg:pt-6 space-y-6">
        {/* Header Layout */}
        <div className="flex justify-between items-start w-full relative mb-6 lg:mb-10" ref={dropdownRef}>
          {/* Welcome Title */}
          <div className="text-left space-y-1.5 pl-2 lg:pl-0 pt-0">
            <h1 className="text-[28px] font-bold text-[#003527] tracking-tight">{greeting}, {getFirstName()}.</h1>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-md">
              {todayCount > 0 ? (
                <>
                  Du hast heute <span className="font-semibold text-[#003527]">{todayCount} {todayCount === 1 ? 'Termin' : 'Termine'}</span> in deinem Kalender.
                  <br />
                  Ein guter Tag für erstklassige Behandlungen.
                </>
              ) : (
                <>
                  Für heute stehen keine Termine in deinem Kalender an.
                  <br />
                  Nutze die Zeit zum Durchatmen oder für Administrative Angelegenheiten.
                </>
              )}
            </p>
          </div>

          {/* Quick Add Dropdown Menu */}
          <div className="relative pr-2 lg:pr-0">
            <button 
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)} 
              className="p-2 rounded-xl border border-[#bfc9c3]/50 bg-white text-[#003527] hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-none"
              title="Schnellerfassung"
            >
              <Plus className={`w-4 h-4 transition-transform duration-200 ${isQuickAddOpen ? 'rotate-45' : ''}`} />
            </button>

            {isQuickAddOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#bfc9c3]/30 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in text-left">
                <button
                  onClick={() => {
                    setIsNewClientModalOpen(true);
                    setIsQuickAddOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs font-bold text-[#003527] hover:bg-[#003527]/5 transition-colors cursor-pointer text-left block border-none bg-transparent outline-none"
                >
                  Patient hinzufügen
                </button>
                <button
                  onClick={() => {
                    setSheetMode('new');
                    setSelectedAppointment(null);
                    setIsSheetOpen(true);
                    setIsQuickAddOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs font-bold text-[#003527] hover:bg-[#003527]/5 transition-colors cursor-pointer text-left block border-none bg-transparent outline-none"
                >
                  Termin eintragen
                </button>
                <button
                  onClick={() => {
                    openNewInvoiceSheet();
                    setIsQuickAddOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs font-bold text-[#003527] hover:bg-[#003527]/5 transition-colors cursor-pointer text-left block border-none bg-transparent outline-none"
                >
                  Rechnung schreiben
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Simple Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {/* Patients stat */}
          <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)]">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Patienten</span>
              <h3 className="text-2xl font-bold text-[#003527]">{clients.length}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-[#003527] rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Appointments stat */}
          <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)]">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Termine</span>
              <h3 className="text-2xl font-bold text-[#003527]">{appointments.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>

          {/* Invoices stat */}
          <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)]">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Offene Rechnungen</span>
              <h3 className="text-2xl font-bold text-[#003527]">
                {invoices.filter(i => i.status === 'open' || i.status === 'overdue').length}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Nächste Termine Row (Full Width) */}
        <div className="bg-white border border-[#bfc9c3]/40 rounded-2xl p-6 shadow-none text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#bfc9c3]/20">
            <h3 className="text-sm font-bold text-[#003527]">Nächste Termine</h3>
            <button
              onClick={() => router.push('/dashboard/calendar')}
              className="text-[10px] font-extrabold text-[#003527] hover:underline cursor-pointer flex items-center gap-0.5 bg-transparent border-none p-0 outline-none"
            >
              Kalender öffnen <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((app) => (
                <div 
                  key={app.id} 
                  className="p-3.5 bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-xl flex flex-col gap-1 hover:border-[#bfc9c3]/60 transition-all text-left group cursor-pointer"
                  onClick={() => {
                    if (app.clientId) {
                      setSelectedClientId(app.clientId);
                      router.push('/dashboard/clients');
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#003527]/70 uppercase tracking-wider">
                      {formatAppointmentTime(app.startTime)}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border ${
                      app.status === 'confirmed' 
                        ? 'bg-emerald-50 border-emerald-200/50 text-emerald-700' 
                        : app.status === 'cancelled'
                        ? 'bg-rose-50 border-rose-200/50 text-rose-600'
                        : 'bg-blue-50 border-blue-200/50 text-blue-700'
                    }`}>
                      {app.status === 'confirmed' ? 'Bestätigt' : app.status === 'cancelled' ? 'Storniert' : 'Gebucht'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#003527] group-hover:underline">
                    {app.clientName}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold truncate">
                    {app.serviceName}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-zinc-400 italic text-xs font-semibold">
                Keine anstehenden Termine.
              </div>
            )}
          </div>
        </div>

        {/* Patients Table Card (Full Width) */}
        <div className="bg-white border border-[#bfc9c3]/40 rounded-2xl px-4 lg:px-8 pt-0 pb-4 shadow-none text-left relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bfc9c3]/20 pt-6 pb-5 -mx-4 lg:-mx-8 px-4 lg:px-8">
            <div className="flex items-center gap-1.5 text-left">
              <h3 className="text-sm font-bold text-[#003527]">Patienten</h3>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Patient suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/40 rounded-xl pl-9 pr-4 py-2 font-bold text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] focus:border-[#003527] outline-none transition-all text-left placeholder-zinc-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left text-xs border-separate border-spacing-y-0">
              <thead>
                <tr className="text-zinc-400 text-[11px] font-semibold">
                  <th className="pb-3 pt-1 px-5 text-left font-semibold border-b border-zinc-100">Name</th>
                  <th className="pb-3 pt-1 px-5 text-left font-semibold border-b border-zinc-100">Geburtsdatum</th>
                  <th className="pb-3 pt-1 px-5 text-left font-semibold border-b border-zinc-100">Kontakt</th>
                  <th className="pb-3 pt-1 px-5 text-left font-semibold border-b border-zinc-100 relative">
                    <span 
                      className="flex items-center gap-1.5 cursor-help select-none"
                      onMouseEnter={() => setShowGdprTooltip(true)}
                      onMouseLeave={() => setShowGdprTooltip(false)}
                    >
                      Datenschutz
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-[#003527] transition-colors" />
                    </span>
                    
                    {/* Styled HTML Tooltip */}
                    {showGdprTooltip && (
                      <div className="absolute top-full right-5 mt-2 w-72 bg-white text-zinc-700 text-[10px] leading-relaxed p-3.5 rounded-xl shadow-xl z-50 normal-case font-medium border border-[#bfc9c3]/30 pointer-events-none select-none animate-fade-in">
                        <p className="font-bold mb-1 text-[11px] text-[#003527]">DSGVO-Status</p>
                        <p className="text-zinc-500 font-semibold leading-relaxed">
                          Dokumentiert, ob der Patient der Verarbeitung seiner Gesundheitsdaten (gemäß Art. 9 DSGVO) zugestimmt hat. Diese ausdrückliche Einwilligung ist rechtlich erforderlich, um Behandlungsdaten speichern zu dürfen.
                        </p>
                        {/* Arrow pointing up */}
                        <div className="absolute bottom-full right-6 border-4 border-transparent border-b-white" />
                        <div className="absolute bottom-full right-6 border-4 border-transparent border-b-[#bfc9c3]/30 -z-10" style={{ transform: 'translateY(-1.5px)' }} />
                      </div>
                    )}
                  </th>
                  <th className="pb-3 pt-1 px-5 text-right font-semibold border-b border-zinc-100">Aktion</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="text-[#003527] group cursor-pointer"
                    onContextMenu={(e) => handleClientContextMenu(e, client)}
                  >
                    <td className="py-3.5 px-5 border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">
                      <span className="text-xs font-bold text-[#003527] flex items-center gap-1.5">
                        {client.name}
                        {client.isFavorite && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        )}
                      </span>
                    </td>
                    
                    <td className="py-3.5 px-5 font-semibold text-zinc-400 border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">
                      {new Date(client.birthday).toLocaleDateString('de-DE')}
                    </td>
                    
                    <td className="py-3.5 px-5 border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">
                      <div className="flex flex-col text-left space-y-0.5">
                        <span className="text-xs text-[#003527] font-semibold">{client.email}</span>
                        <span className="text-[10px] text-zinc-400 font-bold">{client.phone || 'Keine Telefonnummer'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (client.gdprAccepted) {
                            toggleClientGdpr(client.id);
                          } else {
                            openGdprModal(client.id);
                          }
                        }}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer outline-none ${
                          client.gdprAccepted
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {client.gdprAccepted ? '✓ Erteilt' : '⚠ Ausstehend'}
                      </button>
                    </td>
                    
                    <td className="py-3.5 pl-5 pr-5 text-right border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors">
                      <button
                        onClick={() => {
                          setSelectedClientId(client.id);
                          router.push('/dashboard/clients');
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#003527] hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
                      >
                        Akte öffnen <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400 italic font-semibold">
                      Keine Patienten gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}