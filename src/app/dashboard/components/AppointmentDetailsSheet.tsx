'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, User, Calendar as CalendarIcon, Clock, FileText, Printer, Sparkles, Trash2, Plus,
  ChevronDown, Check, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};

export default function AppointmentDetailsSheet() {
  const router = useRouter();
  const {
    isSheetOpen,
    setIsSheetOpen,
    sheetMode,
    selectedAppointment,
    setSelectedAppointment,
    newAppDate,
    setNewAppDate,
    newAppHour,
    setNewAppHour,
    newAppClientId,
    setNewAppClientId,
    newAppServiceId,
    setNewAppServiceId,
    clients,
    services,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    createService,
    deleteService,
    updateService,
    deleteClient,
    archiveClient,
    updateClientName,
    setIsNewClientModalOpen,
    setNewClientName,
    invoices,
    soapNotes,
    markInvoicePaid,
    printInvoice,
    openNewInvoiceSheetWithPrefill,
    createSoapNote,
    startEditSoap,
    setSelectedClientId,
    setPrefillInvoice,
    setIsEditingDraft,
    setIsViewingInvoice,
    setIsNewInvoiceSheetOpen,
    showToast
  } = useDashboard();

  // Local form states
  const [appType, setAppType] = React.useState<'treatment' | 'blocker'>('treatment');
  const [blockerTitle, setBlockerTitle] = React.useState('');
  const [blockerDuration, setBlockerDuration] = React.useState(30);

  // Time and duration states
  const [appTime, setAppTime] = React.useState('09:00');
  const [treatmentDuration, setTreatmentDuration] = React.useState(60);

  // Custom patient dropdown states
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false);
  const [clientSearch, setClientSearch] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Custom service dropdown states
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = React.useState(false);
  const [serviceSearch, setServiceSearch] = React.useState('');
  const serviceDropdownRef = React.useRef<HTMLDivElement>(null);

  // Dropdown context menu state
  const [dropdownContextMenu, setDropdownContextMenu] = React.useState<{
    x: number;
    y: number;
    type: 'client' | 'service';
    id: string;
    name: string;
  } | null>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown context menu on any global click/rightclick click
  React.useEffect(() => {
    function handleCloseDropdownMenu() {
      setDropdownContextMenu(null);
    }
    window.addEventListener('click', handleCloseDropdownMenu);
    window.addEventListener('contextmenu', handleCloseDropdownMenu);
    return () => {
      window.removeEventListener('click', handleCloseDropdownMenu);
      window.removeEventListener('contextmenu', handleCloseDropdownMenu);
    };
  }, []);

  // Sync initial hour from calendar view
  React.useEffect(() => {
    if (isSheetOpen && sheetMode === 'new') {
      setAppTime(`${newAppHour.toString().padStart(2, '0')}:00`);
    }
  }, [isSheetOpen, sheetMode, newAppHour]);

  // Sync new client creation with selector dropdown
  const prevClientsLength = React.useRef(clients.length);
  React.useEffect(() => {
    if (clients.length > prevClientsLength.current && isSheetOpen && sheetMode === 'new') {
      const newestClient = clients[clients.length - 1];
      if (newestClient) {
        setNewAppClientId(newestClient.id);
      }
    }
    prevClientsLength.current = clients.length;
  }, [clients, isSheetOpen, sheetMode, setNewAppClientId]);

  // Auto-populate default selection values if empty
  React.useEffect(() => {
    if (isSheetOpen && sheetMode === 'new') {
      if (clients.length > 0 && !newAppClientId) {
        setNewAppClientId(clients[0].id);
      }
      if (services.length > 0 && !newAppServiceId) {
        setNewAppServiceId(services[0].id);
      }
    }
  }, [isSheetOpen, sheetMode, clients, services, newAppClientId, newAppServiceId, setNewAppClientId, setNewAppServiceId]);

  if (!isSheetOpen) return null;

  const selectedClient = clients.find(c => c.id === newAppClientId);
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedService = services.find(s => s.id === newAppServiceId);
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const handleCreateServiceAndSelect = async (name: string) => {
    if (!name.trim()) return;
    const created = await createService({
      name: name.trim(),
      duration: 60,
      price: 0
    });
    if (created) {
      setNewAppServiceId(created.id);
      setIsServiceDropdownOpen(false);
      setServiceSearch('');
    }
  };

  const formatAppTimeRange = (startTimeStr: string, durationMin: number) => {
    const start = new Date(startTimeStr);
    const end = new Date(start.getTime() + durationMin * 60000);
    const startStr = start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const endStr = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppDate) {
      showToast('Bitte ein Datum auswählen', 'error');
      return;
    }

    const [hourStr, minStr] = appTime.split(':');
    const start = new Date(newAppDate);
    start.setHours(parseInt(hourStr || '9'), parseInt(minStr || '0'), 0, 0);

    let end: Date;
    let newAppObj: any;

    if (appType === 'blocker') {
      if (!blockerTitle.trim()) {
        showToast('Bitte einen Blocker-Titel eingeben', 'error');
        return;
      }
      end = new Date(start.getTime() + blockerDuration * 60000);
      newAppObj = {
        id: crypto.randomUUID(),
        clientId: null,
        serviceId: null,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'confirmed',
        notes: '',
        serviceName: blockerTitle.trim(),
        price: 0
      };
    } else {
      // Treatment
      let finalServiceId = newAppServiceId;
      let finalServiceName = '';

      const srv = services.find(s => s.id === newAppServiceId);
      if (srv) {
        finalServiceId = srv.id;
        finalServiceName = srv.name;
      } else {
        showToast('Bitte eine Leistung auswählen', 'error');
        return;
      }

      const cli = clients.find(c => c.id === newAppClientId);
      if (!cli) {
        showToast('Bitte einen Klienten auswählen', 'error');
        return;
      }

      end = new Date(start.getTime() + treatmentDuration * 60000);
      newAppObj = {
        id: crypto.randomUUID(),
        clientId: cli.id,
        serviceId: finalServiceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'booked' as const,
        notes: '',
        serviceName: finalServiceName,
        price: 0
      };
    }

    await addAppointment(newAppObj);
    setIsSheetOpen(false);

    // Reset local states
    setBlockerTitle('');
  };

  return (
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
            <div className="space-y-5">
              {/* Type Switcher */}
              <div className="bg-zinc-100 p-1 rounded-2xl flex border border-zinc-200/30 select-none mb-6">
                <button
                  type="button"
                  onClick={() => setAppType('treatment')}
                  className={`flex-grow py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none bg-transparent ${
                    appType === 'treatment' 
                      ? 'bg-white text-[#003527] border border-[#bfc9c3]/30 shadow-none font-bold' 
                      : 'text-zinc-500 hover:text-[#003527] font-semibold'
                  }`}
                >
                  Behandlung
                </button>
                <button
                  type="button"
                  onClick={() => setAppType('blocker')}
                  className={`flex-grow py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none bg-transparent ${
                    appType === 'blocker' 
                      ? 'bg-white text-[#003527] border border-[#bfc9c3]/30 shadow-none font-bold' 
                      : 'text-zinc-500 hover:text-[#003527] font-semibold'
                  }`}
                >
                  Interner Blocker
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-5 text-left">
                {appType === 'treatment' ? (
                  <>
                    {/* Patient Selector */}
                    <div className="space-y-2 relative" ref={dropdownRef}>
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Klient</label>
                      </div>
                      {clients.length === 0 ? (
                        <div className="border border-dashed border-[#bfc9c3]/50 rounded-2xl p-4 text-center bg-[#f9f9f8]">
                          <p className="text-[11px] font-semibold text-zinc-400">Noch keine Klienten angelegt.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setNewClientName('');
                              setIsNewClientModalOpen(true);
                            }}
                            className="mt-2 bg-[#003527] hover:bg-[#0b513d] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border-none"
                          >
                            Klient anlegen
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Custom Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsClientDropdownOpen(!isClientDropdownOpen);
                              setClientSearch('');
                            }}
                            className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-2.5 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] hover:border-zinc-300 transition-all cursor-pointer flex items-center justify-between gap-2 text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {selectedClient ? (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                                    {getInitials(selectedClient.name)}
                                  </div>
                                  <span className="truncate">{selectedClient.name}</span>
                                </>
                              ) : (
                                <span className="text-zinc-400">Klient auswählen...</span>
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
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                    placeholder="Klienten suchen..."
                                    autoFocus
                                    className="w-full bg-white border border-zinc-200/60 focus:border-zinc-300 rounded-lg pl-9 pr-3 py-1.5 font-bold text-xs text-[#003527] outline-none transition-all"
                                  />
                                </div>
                              </div>
                              
                              {/* Patient Options List */}
                              <div className="overflow-y-auto py-1 flex-grow">
                                {filteredClients.length > 0 ? (
                                  filteredClients.map(client => {
                                    const isSelected = client.id === newAppClientId;
                                    return (
                                      <button
                                        type="button"
                                        key={client.id}
                                        onClick={() => {
                                          setNewAppClientId(client.id);
                                          setIsClientDropdownOpen(false);
                                          setClientSearch('');
                                        }}
                                        onContextMenu={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setDropdownContextMenu({
                                            x: e.clientX,
                                            y: e.clientY,
                                            type: 'client',
                                            id: client.id,
                                            name: client.name
                                          });
                                        }}
                                        className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer text-left border-none bg-transparent ${
                                          isSelected 
                                            ? 'bg-[#003527]/10 text-[#003527]' 
                                            : 'text-[#003527] hover:bg-[#003527]/5 hover:text-[#003527]'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                                            isSelected ? 'bg-[#003527]/20 text-[#003527]' : 'bg-zinc-100 text-zinc-500'
                                          }`}>
                                            {getInitials(client.name)}
                                          </div>
                                          <span className="truncate">{client.name}</span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-[#003527] flex-shrink-0 ml-2" />}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="px-4 py-3 text-xs text-zinc-400 font-semibold italic text-center">
                                    Keine Klienten gefunden
                                  </div>
                                )}
                              </div>

                              {/* Persistent Customer Add Button */}
                              <div className="border-t border-zinc-100 p-1.5 bg-zinc-50/40">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (clientSearch) {
                                      setNewClientName(clientSearch);
                                    } else {
                                      setNewClientName('');
                                    }
                                    setIsNewClientModalOpen(true);
                                    setIsClientDropdownOpen(false);
                                  }}
                                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-[#003527] hover:bg-[#003527]/5 hover:text-[#0b513d] flex items-center justify-center gap-1.5 cursor-pointer transition-colors border-none bg-transparent"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Klient hinzufügen
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Service Selector */}
                    <div className="space-y-2 relative" ref={serviceDropdownRef}>
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Leistung</label>
                      {services.length === 0 ? (
                        <div className="border border-dashed border-[#bfc9c3]/50 rounded-2xl p-4 bg-[#f9f9f8] text-center">
                          <p className="text-[11px] font-semibold text-zinc-400">Noch keine Leistungen angelegt.</p>
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              placeholder="z.B. Erstgespräch"
                              value={serviceSearch}
                              onChange={(e) => setServiceSearch(e.target.value)}
                              className="flex-grow bg-white border border-[#bfc9c3]/50 rounded-xl px-3 py-1.5 font-semibold text-xs text-[#003527] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleCreateServiceAndSelect(serviceSearch || 'Erstgespräch')}
                              className="bg-[#003527] hover:bg-[#0b513d] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border-none"
                            >
                              Anlegen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Custom Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsServiceDropdownOpen(!isServiceDropdownOpen);
                              setServiceSearch('');
                            }}
                            className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-2.5 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] hover:border-zinc-300 transition-all cursor-pointer flex items-center justify-between gap-2 text-left"
                          >
                            <span className={selectedService ? 'text-[#003527]' : 'text-zinc-400'}>
                              {selectedService ? selectedService.name : 'Leistung auswählen...'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                          </button>

                          {/* Custom Dropdown Menu */}
                          {isServiceDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left flex flex-col max-h-[300px]">
                              {/* Search Input Container */}
                              <div className="p-2.5 bg-zinc-50/60 border-b border-zinc-100">
                                <div className="relative flex items-center">
                                  <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                                  <input
                                    type="text"
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    placeholder="Leistung suchen..."
                                    autoFocus
                                    className="w-full bg-white border border-zinc-200/60 focus:border-zinc-300 rounded-lg pl-9 pr-3 py-1.5 font-bold text-xs text-[#003527] outline-none transition-all"
                                  />
                                </div>
                              </div>
                              
                              {/* Service Options List */}
                              <div className="overflow-y-auto py-1 flex-grow">
                                {filteredServices.length > 0 ? (
                                  filteredServices.map(srv => {
                                    const isSelected = srv.id === newAppServiceId;
                                    return (
                                      <button
                                        type="button"
                                        key={srv.id}
                                        onClick={() => {
                                          setNewAppServiceId(srv.id);
                                          setIsServiceDropdownOpen(false);
                                          setServiceSearch('');
                                        }}
                                        onContextMenu={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setDropdownContextMenu({
                                            x: e.clientX,
                                            y: e.clientY,
                                            type: 'service',
                                            id: srv.id,
                                            name: srv.name
                                          });
                                        }}
                                        className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer text-left border-none bg-transparent ${
                                          isSelected 
                                            ? 'bg-[#003527]/10 text-[#003527]' 
                                            : 'text-[#003527] hover:bg-[#003527]/5 hover:text-[#003527]'
                                        }`}
                                      >
                                        <span className="truncate">{srv.name}</span>
                                        {isSelected && <Check className="w-4 h-4 text-[#003527] flex-shrink-0 ml-2" />}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="px-4 py-3 text-xs text-zinc-400 font-semibold italic text-center">
                                    Keine Leistungen gefunden
                                  </div>
                                )}
                              </div>

                              {/* Persistent Service Add Button */}
                              <div className="border-t border-zinc-100 p-1.5 bg-zinc-50/40">
                                <button
                                  type="button"
                                  onClick={() => handleCreateServiceAndSelect(serviceSearch || 'Neue Leistung')}
                                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-[#003527] hover:bg-[#003527]/5 hover:text-[#0b513d] flex items-center justify-center gap-1.5 cursor-pointer transition-colors border-none bg-transparent"
                                >
                                  <Plus className="w-3.5 h-3.5" /> 
                                  {serviceSearch ? `"${serviceSearch}" hinzufügen` : 'Leistung hinzufügen'}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Treatment Duration Selector */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Dauer</label>
                      <select
                        value={treatmentDuration}
                        onChange={(e) => setTreatmentDuration(parseInt(e.target.value))}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] cursor-pointer outline-none"
                      >
                        {[15, 30, 45, 50, 60, 75, 90, 120].map(d => (
                          <option key={d} value={d}>{d} Min.</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Blocker Form */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Titel / Blockgrund</label>
                      <input
                        type="text"
                        placeholder="z.B. Mittagspause, Praxis-Einkauf, Admin-Zeit..."
                        value={blockerTitle}
                        onChange={(e) => setBlockerTitle(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Dauer</label>
                      <select
                        value={blockerDuration}
                        onChange={(e) => setBlockerDuration(parseInt(e.target.value))}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] cursor-pointer outline-none"
                      >
                        {[15, 30, 45, 60, 90, 120, 180, 240].map(d => (
                          <option key={d} value={d}>{d} Min.</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Datum</label>
                    <input
                      type="date"
                      value={newAppDate}
                      onChange={(e) => setNewAppDate(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Uhrzeit (Start)</label>
                    <input
                      type="time"
                      value={appTime}
                      onChange={(e) => setAppTime(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs mt-6 transition-all cursor-pointer border-none"
                >
                  Termin eintragen
                </button>
              </form>
            </div>
          ) : (
            selectedAppointment && (
              <div className="space-y-6 text-left">
                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/40 rounded-[1.5rem] p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      !selectedAppointment.clientId
                        ? 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        : 'bg-[#003527]/5 text-[#003527] border border-[#003527]/10'
                    }`}>
                      {!selectedAppointment.clientId ? 'Interner Blocker' : selectedAppointment.serviceName.split(' ')[0]}
                    </span>

                  </div>
                  
                  <h4 className="font-extrabold text-sm text-[#043F2D] leading-tight">{selectedAppointment.serviceName}</h4>
                  
                  <div className="space-y-1.5 text-xs text-[#404944] font-semibold">
                    {selectedAppointment.clientId && (
                      <p className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#003527]/60" /> {selectedAppointment.clientName}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#003527]/60" /> 
                      {new Date(selectedAppointment.startTime).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#003527]/60" /> 
                      {formatAppTimeRange(selectedAppointment.startTime, Math.round((new Date(selectedAppointment.endTime).getTime() - new Date(selectedAppointment.startTime).getTime()) / 60000))} Uhr
                    </p>
                  </div>
                </div>

                {selectedAppointment.clientId ? (
                  <>
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
                              type="button"
                              onClick={() => {
                                const updated = { ...selectedAppointment, status: st.id as any };
                                setSelectedAppointment(updated);
                                updateAppointment(updated);
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
                        const invoice = invoices.find(inv => inv.appointmentId === selectedAppointment.id && inv.status !== 'cancelled');
                        if (invoice) {
                          return (
                            <div className="flex justify-between items-center text-xs font-semibold text-[#404944]">
                              <div 
                                onClick={() => {
                                  setIsSheetOpen(false);
                                  setPrefillInvoice(invoice);
                                  if (invoice.status === 'draft') {
                                    setIsEditingDraft(true);
                                    setIsViewingInvoice(false);
                                  } else {
                                    setIsEditingDraft(false);
                                    setIsViewingInvoice(true);
                                  }
                                  setIsNewInvoiceSheetOpen(true);
                                }}
                                className="cursor-pointer hover:bg-zinc-100/80 p-1.5 rounded-lg transition-colors text-left flex-grow mr-2"
                                title="Rechnung im Detail-Viewer öffnen"
                              >
                                <p className="font-bold text-[#003527]">Rechnungsnummer: {invoice.invoiceNumber}</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">Erstellt am: {new Date(invoice.date).toLocaleDateString('de-DE')}</p>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                                  invoice.status === 'paid' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                    : invoice.status === 'overdue'
                                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                                    : invoice.status === 'draft'
                                    ? 'bg-zinc-100 border-zinc-300 text-zinc-600'
                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                }`}>
                                  {invoice.status === 'paid' && 'Bezahlt'}
                                  {invoice.status === 'overdue' && 'Überfällig'}
                                  {invoice.status === 'open' && 'Offen'}
                                  {invoice.status === 'draft' && 'Entwurf'}
                                </span>
                                {invoice.status === 'open' && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markInvoicePaid(invoice.id);
                                    }}
                                    className="text-[9px] bg-emerald-600 text-white px-2 py-1 rounded transition-colors cursor-pointer border-none"
                                  >
                                    Bezahlen
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    printInvoice(invoice);
                                  }}
                                  className="p-1 bg-zinc-200 hover:bg-zinc-300 text-[#003527] rounded transition-colors cursor-pointer border-none"
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
                                onClick={() => {
                                  setIsSheetOpen(false);
                                  openNewInvoiceSheetWithPrefill({
                                    clientId: selectedAppointment.clientId || '',
                                    amount: selectedAppointment.price,
                                    appointmentId: selectedAppointment.id,
                                    clientName: selectedAppointment.clientName,
                                    date: selectedAppointment.startTime.slice(0, 10)
                                  });
                                }}
                                className="bg-[#003527] hover:bg-[#0b513d] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border-none"
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
                                    setSelectedClientId(selectedAppointment.clientId || '');
                                    startEditSoap(note);
                                    setIsSheetOpen(false);
                                    router.push('/dashboard/clients');
                                  }}
                                  className="text-[10px] text-[#003527] hover:underline flex items-center gap-0.5 cursor-pointer font-bold border-none bg-transparent"
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
                                  createSoapNote(selectedAppointment.id, selectedAppointment.clientId || '');
                                  router.push('/dashboard/clients');
                                  setIsSheetOpen(false);
                                }}
                                className="text-[10px] text-[#003527] hover:underline font-bold cursor-pointer border-none bg-transparent"
                              >
                                Bericht anlegen
                              </button>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </>
                ) : null}

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Private Anmerkungen zu dieser Sitzung</label>
                  <textarea
                    rows={3}
                    value={selectedAppointment.notes || ''}
                    onChange={(e) => {
                      const updated = { ...selectedAppointment, notes: e.target.value };
                      setSelectedAppointment(updated);
                    }}
                    onBlur={() => {
                      updateAppointment(selectedAppointment);
                    }}
                    placeholder="z.B. Mittagspause, Schwerpunkt heute LWS Mobilisierung..."
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-semibold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-[#bfc9c3]/20 flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (confirm('Möchtest du diesen Termin wirklich löschen?')) {
                        deleteAppointment(selectedAppointment.id);
                        setIsSheetOpen(false);
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" /> Termin löschen
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </motion.div>

      {dropdownContextMenu && (
        <div
          style={{
            position: 'fixed',
            top: `${dropdownContextMenu.y}px`,
            left: `${dropdownContextMenu.x}px`,
            zIndex: 99999,
          }}
          className="w-48 bg-white/95 backdrop-blur-xl border border-[#bfc9c3]/30 rounded-2xl shadow-xl p-1.5 flex flex-col font-sans text-xs text-[#003527] divide-y divide-[#bfc9c3]/15 overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-[9px] text-zinc-400 font-bold uppercase tracking-wider select-none text-left truncate">
            {dropdownContextMenu.name}
          </div>
          
          <div className="py-1 flex flex-col">
            <button
              type="button"
              onClick={() => {
                const newName = prompt(dropdownContextMenu.type === 'client' ? 'Klientenname bearbeiten:' : 'Leistungsname bearbeiten:', dropdownContextMenu.name);
                if (newName && newName.trim() && newName.trim() !== dropdownContextMenu.name) {
                  if (dropdownContextMenu.type === 'client') {
                    updateClientName(dropdownContextMenu.id, newName.trim());
                  } else {
                    updateService(dropdownContextMenu.id, newName.trim());
                  }
                }
                setDropdownContextMenu(null);
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
            >
              <FileText className="w-3.5 h-3.5 text-[#003527]/60" />
              Umbenennen
            </button>
          </div>

          <div className="py-1 flex flex-col">
            <button
              type="button"
              onClick={async () => {
                if (dropdownContextMenu.type === 'client') {
                  if (confirm(`Möchtest du "${dropdownContextMenu.name}" wirklich archivieren?`)) {
                    await archiveClient(dropdownContextMenu.id);
                  }
                } else {
                  if (confirm(`Möchtest du "${dropdownContextMenu.name}" wirklich unwiderruflich löschen?`)) {
                    deleteService(dropdownContextMenu.id);
                  }
                }
                setDropdownContextMenu(null);
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              {dropdownContextMenu.type === 'client' ? 'Archivieren' : 'Löschen'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
